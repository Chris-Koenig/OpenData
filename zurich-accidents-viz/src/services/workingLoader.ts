import Papa from 'papaparse';
import { CoordinatePoint, AccidentData } from '../types/accident';
import { convertLV95ToWGS84 } from '../utils/coordinates';

export async function loadAccidentDataWorking(): Promise<CoordinatePoint[]> {
  console.log('🚀 WORKING LOADER: Starting real CSV processing...');
  
  try {
    // Step 1: Fetch the CSV file
    console.log('📥 WORKING LOADER: Fetching CSV...');
    const response = await fetch('/RoadTrafficAccidentLocations.csv');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log(`📊 WORKING LOADER: CSV size: ${csvText.length} characters`);
    
    // Step 2: Parse CSV with Papa Parse
    const parseResult = Papa.parse(csvText.replace(/^\uFEFF/, ''), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });
    
    console.log(`📈 WORKING LOADER: Parse complete. Rows: ${parseResult.data.length}, Errors: ${parseResult.errors.length}`);
    
    if (parseResult.data.length === 0) {
      throw new Error('No data parsed from CSV');
    }
    
    // Step 3: Process data in batches (start with first 100 for testing)
    const batchSize = 100;
    const totalRows = parseResult.data.length;
    console.log(`⚡ WORKING LOADER: Processing first ${batchSize} of ${totalRows} rows...`);
    
    const points: CoordinatePoint[] = [];
    let processedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < Math.min(batchSize, totalRows); i++) {
      const row = parseResult.data[i] as any;
      
      // Extract coordinates
      const eastStr = row['AccidentLocation_CHLV95_E'];
      const northStr = row['AccidentLocation_CHLV95_N'];
      
      if (!eastStr || !northStr) {
        skippedCount++;
        continue;
      }
      
      const east = parseFloat(eastStr);
      const north = parseFloat(northStr);
      
      if (isNaN(east) || isNaN(north)) {
        skippedCount++;
        continue;
      }
      
      // Convert coordinates
      const { lat, lng } = convertLV95ToWGS84(east, north);
      
      // Validate Swiss coordinates (more permissive range)
      if (lat < 45.5 || lat > 48.0 || lng < 5.5 || lng > 11.0) {
        skippedCount++;
        continue;
      }
      
      // Create accident data object with safe defaults
      const accidentData: AccidentData = {
        AccidentUID: row['AccidentUID'] || `accident-${i}`,
        AccidentType: row['AccidentType'] || 'unknown',
        AccidentType_en: row['AccidentType_en'] || 'Unknown Accident Type',
        AccidentSeverityCategory: row['AccidentSeverityCategory'] || 'unknown',
        AccidentSeverityCategory_en: row['AccidentSeverityCategory_en'] || 'Unknown Severity',
        AccidentInvolvingPedestrian: row['AccidentInvolvingPedestrian'] || 'false',
        AccidentInvolvingBicycle: row['AccidentInvolvingBicycle'] || 'false',
        AccidentInvolvingMotorcycle: row['AccidentInvolvingMotorcycle'] || 'false',
        RoadType_en: row['RoadType_en'] || 'Unknown Road Type',
        AccidentLocation_CHLV95_E: eastStr,
        AccidentLocation_CHLV95_N: northStr,
        AccidentYear: row['AccidentYear'] || '2023',
        AccidentMonth: row['AccidentMonth'] || '1',
        AccidentMonth_en: row['AccidentMonth_en'] || 'Unknown',
        AccidentWeekDay_en: row['AccidentWeekDay_en'] || 'Unknown',
        AccidentHour: row['AccidentHour'] || '00'
      };
      
      // Create coordinate point
      const point: CoordinatePoint = {
        lat,
        lng,
        accident: accidentData
      };
      
      points.push(point);
      processedCount++;
      
      // Log progress every 20 points
      if (processedCount % 20 === 0) {
        console.log(`📍 WORKING LOADER: Processed ${processedCount} points...`);
      }
    }
    
    console.log(`🎉 WORKING LOADER: Complete! Processed ${processedCount} valid points, skipped ${skippedCount} invalid rows`);
    console.log(`📊 WORKING LOADER: Sample points:`, points.slice(0, 3).map(p => ({ lat: p.lat, lng: p.lng, type: p.accident.AccidentType_en })));
    
    return points;
    
  } catch (error) {
    console.error('💥 WORKING LOADER: Error:', error);
    throw error;
  }
}