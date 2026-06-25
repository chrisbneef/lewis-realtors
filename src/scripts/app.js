/* Lewis Realtors - shared front-end behavior.
   Sticky header, mobile menu, FAQ accordion, scroll-reveal, theme toggle. */

(function () {
  "use strict";

  /* --- Theme (set early in <head> to avoid flash; this handles toggling) -- */
  const root = document.documentElement;
  const STORE = "lr-theme";

  function applyTheme(theme) {
    root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    });
  }

  window.__lrSetTheme = function (next) {
    const theme = next || (root.dataset.theme === "dark" ? "light" : "dark");
    try { localStorage.setItem(STORE, theme); } catch (e) {}
    applyTheme(theme);
  };

  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-theme-toggle]");
    if (toggle) window.__lrSetTheme();
  });

  /* --- Sticky header shadow on scroll ------------------------------------ */
  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile menu -------------------------------------------------------- */
  const menuBtn = document.querySelector("[data-menu-btn]");
  const nav = document.querySelector("[data-nav]");
  if (menuBtn && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      menuBtn.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("no-scroll", open);
    };
    menuBtn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* --- FAQ accordion ------------------------------------------------------ */
  document.querySelectorAll("[data-accordion] > [data-acc-item]").forEach((item) => {
    const btn = item.querySelector("[data-acc-trigger]");
    const panel = item.querySelector("[data-acc-panel]");
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : null;
    });
  });

  /* --- Scroll reveal ------------------------------------------------------ */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
})();
