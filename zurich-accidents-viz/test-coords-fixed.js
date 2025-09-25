const convertLV95ToWGS84 = (east, north) => {
  // Convert LV95 coordinates to auxiliary coordinate system
  const y = (east - 2600000) / 1000000;
  const x = (north - 1200000) / 1000000;
  
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
  const lambda = lambda_seconds * 100 / 36;
  const phi = phi_seconds * 100 / 36;
  
  return { lat: phi, lng: lambda };
};

// Test with the first CSV coordinate
const east1 = 2683433;
const north1 = 1250736;
const result1 = convertLV95ToWGS84(east1, north1);
console.log(`Coordinate 1: E=${east1}, N=${north1} -> lat=${result1.lat}, lng=${result1.lng}`);

// Test with the second CSV coordinate
const east2 = 2682586;
const north2 = 1246712;
const result2 = convertLV95ToWGS84(east2, north2);
console.log(`Coordinate 2: E=${east2}, N=${north2} -> lat=${result2.lat}, lng=${result2.lng}`);

// Zurich city center should be approximately: lat=47.3769, lng=8.5417
console.log('Expected Zurich coordinates: lat=47.3769, lng=8.5417');
console.log(`Result 1 valid for Zurich: ${result1.lat >= 47.3 && result1.lat <= 47.5 && result1.lng >= 8.4 && result1.lng <= 8.7}`);
console.log(`Result 2 valid for Zurich: ${result2.lat >= 47.3 && result2.lat <= 47.5 && result2.lng >= 8.4 && result2.lng <= 8.7}`);