/**
 * Offline safe-route approximation: detours straight-line paths away from danger pins.
 * Not turn-by-turn routing — heuristic for survival / hackathon demo.
 */

const EARTH_R = 6371000;

export function haversineMeters(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Point p to segment ab — meters (local plane approx, OK for < ~50km legs) */
export function distancePointToSegmentMeters(
  p: { lat: number; lon: number },
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const midLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const kx = (Math.PI / 180) * EARTH_R * Math.cos(midLat);
  const ky = (Math.PI / 180) * EARTH_R;
  const px = p.lon * kx,
    py = p.lat * ky;
  const ax = a.lon * kx,
    ay = a.lat * ky;
  const bx = b.lon * kx,
    by = b.lat * ky;
  const abx = bx - ax,
    aby = by - ay;
  const apx = px - ax,
    apy = py - ay;
  const denom = abx * abx + aby * aby || 1e-12;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / denom));
  const cx = ax + t * abx,
    cy = ay + t * aby;
  return Math.hypot(px - cx, py - cy);
}

/** Push midpoint of segment AB away from `away` by ~meters along perpendicular */
function detourMidpoint(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  away: { lat: number; lon: number },
  pushMeters: number
): { lat: number; lon: number } {
  const mid = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 };
  const midLat = mid.lat * (Math.PI / 180);
  const kx = (Math.PI / 180) * EARTH_R * Math.cos(midLat);
  const ky = (Math.PI / 180) * EARTH_R;
  let vx = (b.lon - a.lon) * kx;
  let vy = (b.lat - a.lat) * ky;
  const L = Math.hypot(vx, vy) || 1e-9;
  vx /= L;
  vy /= L;
  let px = -vy,
    py = vx;
  const wx = (mid.lon - away.lon) * kx;
  const wy = (mid.lat - away.lat) * ky;
  if (px * wx + py * wy < 0) {
    px = vy;
    py = -vx;
  }
  return {
    lat: mid.lat + (py * pushMeters) / ky,
    lon: mid.lon + (px * pushMeters) / kx,
  };
}

/**
 * Returns GeoJSON LineString coordinates [lon, lat][] bending around danger points.
 */
export function computeSafeRoute(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  dangers: { lat: number; lon: number }[],
  bufferMeters = 115
): [number, number][] {
  if (!dangers.length) {
    return [
      [from.lon, from.lat],
      [to.lon, to.lat],
    ];
  }

  let pts: { lat: number; lon: number }[] = [{ ...from }, { ...to }];

  for (let iter = 0; iter < 10; iter++) {
    let inserted = false;
    outer: for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      for (const d of dangers) {
        if (distancePointToSegmentMeters(d, a, b) < bufferMeters) {
          const mid = detourMidpoint(a, b, d, bufferMeters + 55);
          pts.splice(i + 1, 0, mid);
          inserted = true;
          break outer;
        }
      }
    }
    if (!inserted) break;
  }

  return pts.map((p) => [p.lon, p.lat]);
}
