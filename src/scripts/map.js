/* Lewis Realtors - neighborhood boundary map (Leaflet via CDN).
   Reads a simplified official boundary from a JSON script tag:
   { display: MultiPolygon coordinates ([lng,lat]), bbox: [minLng,minLat,maxLng,maxLat] }. */

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
  if (!cfg || !Array.isArray(cfg.display) || !cfg.display.length) return;

  const [minLng, minLat, maxLng, maxLat] = cfg.bbox || [-122.65, 45.35, -122.6, 45.38];
  const center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2]; // [lat, lng]

  const map = L.map(el, {
    center,
    zoom: 14,
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: true,
  });

  // OpenStreetMap's standard tiles, muted to a quiet warm gray so the gold
  // boundary carries the map. (CARTO's free basemap started requiring an API
  // key in 2026 and served "API KEY REQUIRED" tiles instead.) OSM's tile
  // policy allows light use like this with attribution; no key needed.
  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);
  // Set inline: Leaflet builds the tile pane at runtime, outside Astro's
  // scoped styles.
  tiles.getContainer().style.filter = "grayscale(1) sepia(0.1) brightness(1.12) contrast(0.7)";

  // display is already MultiPolygon coordinates in [lng,lat]; L.geoJSON flips
  // to Leaflet's [lat,lng] internally, so no manual conversion here.
  const layer = L.geoJSON(
    { type: "Feature", geometry: { type: "MultiPolygon", coordinates: cfg.display } },
    { style: { color: "#9a812f", weight: 2, fillColor: "#c1ac5e", fillOpacity: 0.14 } }
  ).addTo(map);

  map.fitBounds(layer.getBounds(), { padding: [28, 28] });
})();
