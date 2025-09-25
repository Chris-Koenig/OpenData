// Swiss LV95 to WGS84 coordinate conversion
// Using the official Swiss coordinate transformation formulas from swisstopo
export const convertLV95ToWGS84 = (east: number, north: number): { lat: number; lng: number } => {
  // Convert LV95 coordinates to auxiliary coordinate system
  // LV95: E = 2,600,000 + y, N = 1,200,000 + x (where y,x are in LV03 system)
  const y = (east - 2600000) / 1000000;  // Convert to unit of 1000km
  const x = (north - 1200000) / 1000000; // Convert to unit of 1000km
  
  // Calculate longitude λ (lambda) in 10000" (seconds)
  const lambda_seconds = 2.6779094 +
                        4.728982 * y +
                        0.791484 * y * x +
                        0.1306 * y * (x * x) -
                        0.0436 * (y * y * y);
  
  // Calculate latitude φ (phi) in 10000" (seconds)
  const phi_seconds = 16.9023892 +
                     3.238272 * x -
                     0.270978 * (y * y) -
                     0.002528 * (x * x) -
                     0.0447 * (y * y) * x -
                     0.0140 * (x * x * x);
  
  // Convert from 10000" to degrees
  const lambda = lambda_seconds * 100 / 36;  // Convert to degrees
  const phi = phi_seconds * 100 / 36;        // Convert to degrees
  
  return {
    lat: phi,
    lng: lambda
  };
};

export const parseCoordinate = (coord: string): number => {
  const parsed = parseFloat(coord);
  return isNaN(parsed) ? 0 : parsed;
};