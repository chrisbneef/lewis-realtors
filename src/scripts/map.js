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

  // Carto Positron, a clean light basemap that suits the editorial palette.
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }
  ).addTo(map);

  // display is already MultiPolygon coordinates in [lng,lat]; L.geoJSON flips
  // to Leaflet's [lat,lng] internally, so no manual conversion here.
  const layer = L.geoJSON(
    { type: "Feature", geometry: { type: "MultiPolygon", coordinates: cfg.display } },
    { style: { color: "#9a812f", weight: 2, fillColor: "#c1ac5e", fillOpacity: 0.14 } }
  ).addTo(map);

  map.fitBounds(layer.getBounds(), { padding: [28, 28] });
})();
