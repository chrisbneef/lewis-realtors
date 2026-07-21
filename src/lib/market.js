// Helpers for reading the monthly-refreshed market data (src/data/market.json).
// All figures are ASKING prices from active listings; never label them as sold.
import market from "../data/market.json";

export { market };

/** Compact money: 399000 -> "$399K", 1222225 -> "$1.2M". */
export function money(n) {
  if (n == null || !Number.isFinite(n)) return null;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m % 1 ? m.toFixed(1) : m.toFixed(0)}M`;
  }
  return `$${Math.round(n / 1000)}K`;
}

/** Full money: 399000 -> "$399,000". */
export function moneyFull(n) {
  return n == null || !Number.isFinite(n) ? null : `$${Math.round(n).toLocaleString()}`;
}

/** Per-neighborhood market record, or null. */
export function hoodMarket(slug) {
  return market.neighborhoods?.[slug] ?? null;
}

/**
 * The price label shown on cards and hero pills. Prefers the real interquartile
 * band; falls back to a listing count, then to a neutral "Listings updating".
 */
export function priceLabel(slug) {
  const n = hoodMarket(slug);
  if (n?.publishable && n.priceRange) {
    return `${money(n.priceRange.low)}–${money(n.priceRange.high)}`;
  }
  // Too few listings for a reliable range - keep the pill consistent and honest
  // rather than exposing a thin count like "3 active listings".
  return "Market data soon";
}
