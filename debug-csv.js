const Papa = require('papaparse');
const fs = require('fs');

// LV95 to WGS84 conversion function
function convertLV95ToWGS84(east, north) {
  // Convert Swiss LV95 coordinates to WGS84 (latitude, longitude)
  const e = (east - 2600000) / 1000000;
  const n = (north - 1200000) / 1000000;
  
  // Calculate longitude
  const lng = 2.6779094 
    + 4.728982 * e 
    + 0.791484 * e * n 
    + 0.1306 * e * (n * n) 
    - 0.0436 * (e * e * e);
    
  // Calculate latitude  
  const lat = 16.9023892 
    + 3.238272 * n 
    - 0.270978 * (e * e) 
    - 0.002528 * (n * n) 
    - 0.0447 * (e * e) * n 
    - 0.0140 * (n * n * n);
    
  return {
    lat: lat * 100 / 36,
    lng: lng * 100 / 36
  };
}

// Test the CSV loading
console.log('🔍 Starting CSV debug test...');

const csvPath = '/Users/christoph.koenig/Code/private/accident data/OpenData/public/RoadTrafficAccidentLocations.csv';

if (fs.existsSync(csvPath)) {
  console.log('✅ CSV file exists');
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  console.log(`📊 CSV file size: ${csvContent.length} characters`);
  
  // Remove BOM if present
  const cleanContent = csvContent.replace(/^\uFEFF/, '');
  console.log(`🧹 After BOM removal: ${cleanContent.length} characters`);
  
  // Parse with Papa Parse
  const parseResult = Papa.parse(cleanContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
  
  console.log(`📈 Parse errors: ${parseResult.errors.length}`);
  if (parseResult.errors.length > 0) {
    console.log('❌ Parse errors:', parseResult.errors.slice(0, 5));
  }
  
  console.log(`📊 Total rows parsed: ${parseResult.data.length}`);
  
  if (parseResult.data.length > 0) {
    const firstRow = parseResult.data[0];
    console.log('🔍 First row keys:', Object.keys(firstRow));
    console.log('🔍 First row:', firstRow);
    
    // Test coordinate conversion
    const eastCol = 'AccidentLocation_CHLV95_E';
    const northCol = 'AccidentLocation_CHLV95_N';
    
    if (firstRow[eastCol] && firstRow[northCol]) {
      const east = parseFloat(firstRow[eastCol]);
      const north = parseFloat(firstRow[northCol]);
      
      console.log(`🗺️  Original coordinates: E=${east}, N=${north}`);
      
      const converted = convertLV95ToWGS84(east, north);
      console.log(`🌐 Converted coordinates: lat=${converted.lat}, lng=${converted.lng}`);
      
      // Check if coordinates are in valid range for Switzerland
      const isValid = (
        converted.lat >= 45.8 && converted.lat <= 47.9 && // Switzerland latitude range
        converted.lng >= 5.9 && converted.lng <= 10.5     // Switzerland longitude range
      );
      
      console.log(`✅ Coordinates valid for Switzerland: ${isValid}`);
    }
    
    // Test a few more rows
    let validCount = 0;
    let invalidCount = 0;
    
    for (let i = 0; i < Math.min(100, parseResult.data.length); i++) {
      const row = parseResult.data[i];
      
      if (row[eastCol] && row[northCol]) {
        const east = parseFloat(row[eastCol]);
        const north = parseFloat(row[northCol]);
        
        if (!isNaN(east) && !isNaN(north)) {
          const converted = convertLV95ToWGS84(east, north);
          
          const isValid = (
            converted.lat >= 45.8 && converted.lat <= 47.9 &&
            converted.lng >= 5.9 && converted.lng <= 10.5
          );
          
          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
            if (invalidCount < 5) {
              console.log(`❌ Invalid coords for row ${i}: lat=${converted.lat}, lng=${converted.lng}`);
            }
          }
        }
      }
    }
    
    console.log(`📊 Sample validation (first 100): Valid=${validCount}, Invalid=${invalidCount}`);
  }
  
} else {
  console.log('❌ CSV file not found at:', csvPath);
}