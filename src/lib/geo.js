// Geometry helpers for assigning listings to neighborhoods by boundary.
// All coordinates are GeoJSON [lng, lat] order (matches neighborhood-boundaries.json).
// Pure ESM, no dependencies; imported by both Astro and the Node refresh script.

/** Ray-casting test: is [lng,lat] inside a single linear ring? */
export function pointInRing(pt, ring) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      (yi > y) !== (yj > y) &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** A polygon is [outerRing, ...holeRings]: inside outer and outside every hole. */
export function pointInPolygon(pt, polygon) {
  if (!polygon.length || !pointInRing(pt, polygon[0])) return false;
  for (let h = 1; h < polygon.length; h++) {
    if (pointInRing(pt, polygon[h])) return false; // inside a hole
  }
  return true;
}

/** MultiPolygon support: [polygon, ...]. True if inside any part. */
export function pointInPolygons(pt, polygons) {
  return polygons.some((poly) => pointInPolygon(pt, poly));
}

/** Fast axis-aligned reject before the (costlier) ray cast. bbox = [minLng,minLat,maxLng,maxLat]. */
export function inBbox(pt, bbox) {
  return pt[0] >= bbox[0] && pt[0] <= bbox[2] && pt[1] >= bbox[1] && pt[1] <= bbox[3];
}

/**
 * Assign a point to exactly one neighborhood.
 * @param pt [lng, lat]
 * @param entries array of { slug, bbox, polygons }
 * @returns slug or null (outside every boundary)
 */
export function assignNeighborhood(pt, entries) {
  for (const e of entries) {
    if (inBbox(pt, e.bbox) && pointInPolygons(pt, e.polygons)) return e.slug;
  }
  return null;
}
