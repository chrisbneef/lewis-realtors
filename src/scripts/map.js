/* Lewis Realtors - neighborhood boundary map (Leaflet via CDN).
   Reads center / zoom / boundary polygon from a JSON script tag on the page. */

(function () {
  "use strict";

  const el = document.getElementById("hood-map");
  if (!el || typeof L === "undefined") return;

  let cfg;
  try {
    cfg = JSON.parse(document.getElementById("hood-map-data").textContent);
  } catch (e) {
    return;
  }

  const map = L.map(el, {
    center: cfg.center,
    zoom: cfg.zoom || 14,
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: true,
  });

  // Carto Positron, a clean light basemap that suits the editorial palette.
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }
  ).addTo(map);

  if (Array.isArray(cfg.boundary) && cfg.boundary.length) {
    const poly = L.polygon(cfg.boundary, {
      color: "#4d6488",
      weight: 2,
      fillColor: "#6c82a5",
      fillOpacity: 0.16,
    }).addTo(map);
    map.fitBounds(poly.getBounds(), { padding: [28, 28] });
  }
})();
