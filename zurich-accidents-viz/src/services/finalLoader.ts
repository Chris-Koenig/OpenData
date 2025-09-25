import Papa from 'papaparse';
import { CoordinatePoint, AccidentData } from '../types/accident';
import { convertLV95ToWGS84 } from '../utils/coordinates';

export async function loadAccidentDataFinal(): Promise<CoordinatePoint[]> {
  console.log('🚀 FINAL LOADER: Starting production data loading...');
  
  try {
    // Fetch the CSV file
    const response = await fetch('/RoadTrafficAccidentLocations.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log(`📊 FINAL LOADER: CSV loaded successfully (${csvText.length} characters)`);
    
    // Parse CSV
    const parseResult = Papa.parse(csvText.replace(/^\uFEFF/, ''), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });
    
    console.log(`📈 FINAL LOADER: Parsed ${parseResult.data.length} rows`);
    
    if (parseResult.data.length === 0) {
      throw new Error('No data parsed from CSV');
    }
    
    // Process data in batches (increase to 2000 for richer visualization)
    const batchSize = 2000;
    const totalRows = parseResult.data.length;
    const processRows = Math.min(batchSize, totalRows);
    
    console.log(`⚡ FINAL LOADER: Processing ${processRows} of ${totalRows} rows...`);
    
    const points: CoordinatePoint[] = [];
    let processedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < processRows; i++) {
      try {
        const row = parseResult.data[i] as any;
        
        // Extract and validate coordinates
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
        
        // Validate coordinates are in Switzerland
        if (lat < 45.5 || lat > 48.0 || lng < 5.5 || lng > 11.0) {
          skippedCount++;
          continue;
        }
        
        // Create accident data with safe fallbacks
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
        
        // Log progress every 100 points
        if (processedCount % 100 === 0) {
          console.log(`📍 FINAL LOADER: Processed ${processedCount} points...`);
        }
        
      } catch (error) {
        // Skip individual row errors but continue processing
        skippedCount++;
        continue;
      }
    }
    
    console.log(`🎉 FINAL LOADER: Complete!`);
    console.log(`📊 FINAL LOADER: Successfully processed ${processedCount} valid points`);
    console.log(`⚠️  FINAL LOADER: Skipped ${skippedCount} invalid rows`);
    
    // Count accident types for summary
    const pedestrianCount = points.filter(p => p.accident.AccidentInvolvingPedestrian === 'true').length;
    const bicycleCount = points.filter(p => p.accident.AccidentInvolvingBicycle === 'true').length;
    const otherCount = points.length - pedestrianCount - bicycleCount;
    
    console.log(`📊 FINAL LOADER: Accident types - Pedestrian: ${pedestrianCount}, Bicycle: ${bicycleCount}, Other: ${otherCount}`);
    
    return points;
    
  } catch (error) {
    console.error('💥 FINAL LOADER: Error:', error);
    throw error;
  }
}