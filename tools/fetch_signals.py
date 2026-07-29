#!/usr/bin/env python3
"""
fetch_signals.py -- zero-cost, API-free search-intent collector for
West Linn, Oregon real estate (ZIP 97068).

Gathers free web demand-signals -- no API keys, no paid tools:

  1. Google Autocomplete   real long-tail phrases people actually type
  2. DuckDuckGo text       organic result snippets (what already ranks)
  3. DuckDuckGo news       timely local hooks / "this week" signal
  4. West Linn Tidings RSS  local freshness feed (events, schools, market)

Writes everything to data/raw_signals.json. A human (or the weekly
Claude agent) then reads that file and synthesizes an intent report per
the rules in CLAUDE.md.

Usage:  python tools/fetch_signals.py
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import requests

ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT / "data" / "raw_signals.json"

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)

# --- what we collect ---------------------------------------------------------

# Full-sentence queries for DDG text + news (the task's five, plus a couple
# that round out the four intent buckets).
QUERIES = [
    "West Linn OR real estate news",
    "Homes for sale in West Linn Oregon",
    "Willamette neighborhood West Linn",
    "West Linn OR property taxes and schools",
    "Buying a home in West Linn vs Lake Oswego",
    "West Linn Oregon housing market",
    "Living in West Linn Oregon",
]

# Short seeds for Google Autocomplete. Trailing space pulls the next word;
# this is where the real long-tail intent surfaces.
AUTOCOMPLETE_SEEDS = [
    "west linn oregon real estate",
    "west linn homes for sale",
    "west linn housing market",
    "west linn home prices",
    "west linn property tax",
    "west linn real estate agent",
    "west linn vs lake oswego",
    "selling a house in west linn",
    "buying a house in west linn",
    "west linn schools",
    "living in west linn",
    "moving to west linn",
    "things to do in west linn",
    "west linn neighborhoods",
    "willamette neighborhood west linn",
]

# Local freshness feed. West Linn Tidings is a legacy Pamplin Media / Portland
# Tribune title whose own RSS feed is now defunct (host DNS/SSL dead), so its
# local coverage is picked up via a Google News RSS query scoped to West Linn,
# OR -- a reliable, key-free freshness feed that surfaces Tidings-style items
# plus other West Linn local news. We try each candidate and keep the first
# that parses as RSS/Atom. Failure is non-fatal (the rest of the signal lands).
RSS_CANDIDATES = [
    "https://news.google.com/rss/search?q=%22West+Linn%22+Oregon&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=%22West+Linn%22+real+estate&hl=en-US&gl=US&ceid=US:en",
    "https://www.koinlocalnews.com/search/?f=rss&t=article&c=west_linn&l=50&s=start_time&sd=desc",
    "https://pamplinmedia.com/component/obrss/west-linn-tidings",
]

DDG_TEXT_MAX = 8
DDG_NEWS_MAX = 6
POLITE_SLEEP = 1.2  # seconds between network calls, to stay a good citizen


def log(msg: str) -> None:
    print(f"[fetch_signals] {msg}", file=sys.stderr)


# --- collectors --------------------------------------------------------------

def google_autocomplete(seed: str) -> list[str]:
    """Free Google Autocomplete via the Firefox client endpoint (no key)."""
    url = (
        "https://suggestqueries.google.com/complete/search"
        f"?client=firefox&hl=en&q={quote(seed)}"
    )
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=15)
        r.raise_for_status()
        data = r.json()  # [seed, [suggestions...]]
        return list(data[1]) if len(data) > 1 else []
    except Exception as e:  # noqa: BLE001 -- best-effort, never fatal
        log(f"autocomplete failed for {seed!r}: {e}")
        return []


def ddg_text(query: str) -> list[dict]:
    from ddgs import DDGS

    try:
        with DDGS() as d:
            rows = d.text(query, region="us-en", max_results=DDG_TEXT_MAX)
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("href", "") or r.get("url", ""),
                "snippet": r.get("body", ""),
            }
            for r in (rows or [])
        ]
    except Exception as e:  # noqa: BLE001
        log(f"ddg text failed for {query!r}: {e}")
        return []


def ddg_news(query: str) -> list[dict]:
    from ddgs import DDGS

    try:
        with DDGS() as d:
            rows = d.news(query, region="us-en", max_results=DDG_NEWS_MAX)
        return [
            {
                "date": r.get("date", ""),
                "title": r.get("title", ""),
                "url": r.get("url", "") or r.get("href", ""),
                "source": r.get("source", ""),
                "snippet": r.get("body", ""),
            }
            for r in (rows or [])
        ]
    except Exception as e:  # noqa: BLE001
        log(f"ddg news failed for {query!r}: {e}")
        return []


def fetch_tidings_rss() -> dict:
    """Try each candidate feed; return the first that parses as RSS/Atom."""
    from bs4 import BeautifulSoup

    for url in RSS_CANDIDATES:
        try:
            r = requests.get(url, headers={"User-Agent": UA}, timeout=20)
            if r.status_code != 200 or "<rss" not in r.text.lower() and "<feed" not in r.text.lower():
                log(f"rss candidate not usable ({r.status_code}): {url}")
                continue
            soup = BeautifulSoup(r.text, "xml")
            items = soup.find_all("item") or soup.find_all("entry")
            parsed = []
            for it in items[:25]:
                title = it.find("title")
                link = it.find("link")
                pub = it.find("pubDate") or it.find("published") or it.find("updated")
                desc = it.find("description") or it.find("summary")
                link_val = ""
                if link is not None:
                    link_val = link.get_text(strip=True) or link.get("href", "")
                parsed.append(
                    {
                        "title": title.get_text(strip=True) if title else "",
                        "url": link_val,
                        "date": pub.get_text(strip=True) if pub else "",
                        "snippet": (desc.get_text(strip=True) if desc else "")[:400],
                    }
                )
            if parsed:
                log(f"rss ok ({len(parsed)} items): {url}")
                return {"source_url": url, "items": parsed}
        except Exception as e:  # noqa: BLE001
            log(f"rss candidate failed {url}: {e}")
            continue
    log("no RSS feed reachable; leaving tidings empty")
    return {"source_url": None, "items": []}


# --- main --------------------------------------------------------------------

def main() -> int:
    now = datetime.now(timezone.utc)
    iso_year, iso_week, _ = now.isocalendar()
    theme = "real-estate" if iso_week % 2 == 1 else "lifestyle"

    log(f"collecting West Linn signals  ({now.date()}, ISO wk {iso_week}, theme={theme})")

    autocomplete = {}
    for seed in AUTOCOMPLETE_SEEDS:
        autocomplete[seed] = google_autocomplete(seed)
        time.sleep(POLITE_SLEEP)

    search = {}
    for q in QUERIES:
        search[q] = {"text": ddg_text(q)}
        time.sleep(POLITE_SLEEP)
        search[q]["news"] = ddg_news(q)
        time.sleep(POLITE_SLEEP)

    tidings = fetch_tidings_rss()

    payload = {
        "meta": {
            "collected_at": now.isoformat(),
            "date": now.date().isoformat(),
            "iso_year": iso_year,
            "iso_week": iso_week,
            "theme_by_week_parity": theme,
            "location": "West Linn, OR 97068",
            "note": (
                "Free discovery + demand signal (Autocomplete, DuckDuckGo, "
                "local RSS). Precise per-keyword weekly volume needs a paid "
                "tool; rank topics on composite signal, not a single number."
            ),
        },
        "autocomplete": autocomplete,
        "search": search,
        "tidings_rss": tidings,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUT_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(OUT_PATH)

    ac_total = sum(len(v) for v in autocomplete.values())
    tx_total = sum(len(v["text"]) for v in search.values())
    nw_total = sum(len(v["news"]) for v in search.values())
    log(
        f"wrote {OUT_PATH.relative_to(ROOT)}  "
        f"({ac_total} autocomplete phrases, {tx_total} results, "
        f"{nw_total} news, {len(tidings['items'])} RSS items)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
