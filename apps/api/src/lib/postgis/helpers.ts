import { sql } from 'drizzle-orm';

/**
 * Create a PostGIS point from latitude and longitude
 */
export function makePoint(longitude: number, latitude: number) {
  return sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography`;
}

/**
 * Check if a geometry is within a bounding box
 */
export function withinBbox(
  column: ReturnType<typeof sql>,
  west: number,
  south: number,
  east: number,
  north: number,
) {
  return sql`ST_Within(${column}::geometry, ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326))`;
}

/**
 * Calculate distance in meters between a geometry and a point
 */
export function distanceMeters(
  column: ReturnType<typeof sql>,
  longitude: number,
  latitude: number,
) {
  return sql`ST_Distance(${column}::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography)`;
}

/**
 * Check if a geometry is within a radius (in meters) of a point
 */
export function withinRadius(
  column: ReturnType<typeof sql>,
  longitude: number,
  latitude: number,
  radiusMeters: number,
) {
  return sql`ST_DWithin(${column}::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radiusMeters})`;
}
