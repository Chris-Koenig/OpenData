const fs = require('fs');

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split(',');
    const row = {};
    
    for (let j = 0; j < headers.length && j < values.length; j++) {
      row[headers[j]] = values[j].replace(/"/g, '').trim();
    }
    
    data.push(row);
  }
  
  return data;
}

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
console.log('🔍 Starting simple CSV debug test...');

const csvPath = '/Users/christoph.koenig/Code/private/accident data/OpenData/zurich-accidents-viz/public/RoadTrafficAccidentLocations.csv';

if (fs.existsSync(csvPath)) {
  console.log('✅ CSV file exists');
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  console.log(`📊 CSV file size: ${csvContent.length} characters`);
  
  // Remove BOM if present
  const cleanContent = csvContent.replace(/^\uFEFF/, '');
  console.log(`🧹 After BOM removal: ${cleanContent.length} characters`);
  
  // Get first few lines to check structure
  const firstLines = cleanContent.split('\n').slice(0, 3);
  console.log('📋 First 3 lines:');
  firstLines.forEach((line, i) => {
    console.log(`  ${i}: ${line.substring(0, 100)}...`);
  });
  
  // Parse with simple parser
  const data = parseCSV(cleanContent);
  console.log(`📊 Total rows parsed: ${data.length}`);
  
  if (data.length > 0) {
    const firstRow = data[0];
    console.log('🔍 First row keys:', Object.keys(firstRow).slice(0, 10));
    
    // Check for coordinate columns
    const eastCol = 'AccidentLocation_CHLV95_E';
    const northCol = 'AccidentLocation_CHLV95_N';
    
    console.log(`🗺️  Looking for columns: ${eastCol}, ${northCol}`);
    console.log(`🗺️  East column exists: ${eastCol in firstRow}`);
    console.log(`🗺️  North column exists: ${northCol in firstRow}`);
    
    if (firstRow[eastCol] && firstRow[northCol]) {
      console.log(`🗺️  First row coordinates: E="${firstRow[eastCol]}", N="${firstRow[northCol]}"`);
      
      const east = parseFloat(firstRow[eastCol]);
      const north = parseFloat(firstRow[northCol]);
      
      console.log(`🗺️  Parsed coordinates: E=${east}, N=${north}`);
      console.log(`🗺️  Are numbers valid: E=${!isNaN(east)}, N=${!isNaN(north)}`);
      
      if (!isNaN(east) && !isNaN(north)) {
        const converted = convertLV95ToWGS84(east, north);
        console.log(`🌐 Converted coordinates: lat=${converted.lat}, lng=${converted.lng}`);
        
        // Check if coordinates are in valid range for Switzerland
        const isValid = (
          converted.lat >= 45.8 && converted.lat <= 47.9 && // Switzerland latitude range
          converted.lng >= 5.9 && converted.lng <= 10.5     // Switzerland longitude range
        );
        
        console.log(`✅ Coordinates valid for Switzerland: ${isValid}`);
      }
    }
    
    // Test pedestrian/bicycle flags
    console.log(`🚶 Pedestrian column: "${firstRow['AccidentInvolvingPedestrian']}"`);
    console.log(`🚴 Bicycle column: "${firstRow['AccidentInvolvingBicycle']}"`);
    
  }
  
} else {
  console.log('❌ CSV file not found at:', csvPath);
}