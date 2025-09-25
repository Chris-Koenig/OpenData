// Test script to verify coordinate conversion
import { convertLV95ToWGS84 } from './src/utils/coordinates';

// Test with sample coordinates from our CSV
const testCoords = [
  { east: 2683433, north: 1250736 }, // First row from CSV
  { east: 2682586, north: 1246712 }, // Second row from CSV
  { east: 2684412, north: 1247072 }, // Third row from CSV
];

console.log('Testing coordinate conversion:');
testCoords.forEach((coord, index) => {
  const result = convertLV95ToWGS84(coord.east, coord.north);
  console.log(`Test ${index + 1}: LV95(${coord.east}, ${coord.north}) -> WGS84(${result.lat.toFixed(6)}, ${result.lng.toFixed(6)})`);
});

// Expected results should be around Zurich area: lat ~47.37, lng ~8.54