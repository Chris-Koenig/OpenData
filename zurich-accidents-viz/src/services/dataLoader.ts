import Papa from 'papaparse';
import { AccidentData, CoordinatePoint } from '../types/accident';
import { convertLV95ToWGS84, parseCoordinate } from '../utils/coordinates';

export const loadAccidentData = async (): Promise<CoordinatePoint[]> => {
  try {
    console.log('Starting to load accident data...');
    const response = await fetch('/RoadTrafficAccidentLocations.csv');
    
    if (!response.ok) {
      console.error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let csvText = await response.text();
    
    // Remove UTF-8 BOM if present
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
      console.log('Removed UTF-8 BOM from CSV');
    }
    
    console.log('CSV loaded successfully:', {
      size: csvText.length,
      firstChars: csvText.substring(0, 100)
    });
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Papa Parse completed. Total rows:', results.data.length);
          if (results.errors.length > 0) {
            console.warn('Parse errors:', results.errors.slice(0, 5)); // Show first 5 errors only
          }
          
          // Debug: Check if we have data
          if (!results.data || results.data.length === 0) {
            console.error('No data returned from Papa Parse');
            resolve([]);
            return;
          }
          
          console.log('First row keys:', Object.keys(results.data[0] as any));
          console.log('First row sample:', results.data[0]);
          
          try {
            const points: CoordinatePoint[] = [];
            
            // Process more data points (first 5000 for better visualization)
            const maxRows = Math.min(results.data.length, 5000);
            console.log(`Processing first ${maxRows} rows...`);
            
            let processed = 0;
            let skippedMissing = 0;
            let skippedInvalid = 0;
            let skippedOutOfBounds = 0;
            
            for (let index = 0; index < maxRows; index++) {
              const row = results.data[index] as any;
              processed++;
              
              // Debug first few rows
              if (index < 3) {
                console.log(`Row ${index}:`, row);
              }
              
              // Check coordinate fields
              const eastField = row.AccidentLocation_CHLV95_E;
              const northField = row.AccidentLocation_CHLV95_N;
              
              if (!eastField || !northField) {
                skippedMissing++;
                if (index < 5) console.log(`Row ${index}: Missing coordinates - E:${eastField}, N:${northField}`);
                continue;
              }
              
              const east = parseCoordinate(eastField);
              const north = parseCoordinate(northField);
              
              if (east === 0 || north === 0) {
                skippedInvalid++;
                if (index < 5) console.log(`Row ${index}: Invalid coordinates - E:${east}, N:${north}`);
                continue;
              }
              
              const { lat, lng } = convertLV95ToWGS84(east, north);
              
              if (index < 3) {
                console.log(`Row ${index}: LV95(${east}, ${north}) -> WGS84(${lat}, ${lng})`);
              }
              
              // Very lenient validation - just check for reasonable coordinates
              if (lat < 40 || lat > 55 || lng < 0 || lng > 15 || isNaN(lat) || isNaN(lng)) {
                skippedOutOfBounds++;
                if (index < 5) console.log(`Row ${index}: Out of bounds - lat:${lat}, lng:${lng}`);
                continue;
              }
              
              const accident: AccidentData = {
                AccidentUID: row.AccidentUID || '',
                AccidentType: row.AccidentType || '',
                AccidentType_en: row.AccidentType_en || '',
                AccidentSeverityCategory: row.AccidentSeverityCategory || '',
                AccidentSeverityCategory_en: row.AccidentSeverityCategory_en || '',
                AccidentInvolvingPedestrian: row.AccidentInvolvingPedestrian || 'false',
                AccidentInvolvingBicycle: row.AccidentInvolvingBicycle || 'false',
                AccidentInvolvingMotorcycle: row.AccidentInvolvingMotorcycle || 'false',
                RoadType_en: row.RoadType_en || '',
                AccidentLocation_CHLV95_E: eastField,
                AccidentLocation_CHLV95_N: northField,
                AccidentYear: row.AccidentYear || '',
                AccidentMonth: row.AccidentMonth || '',
                AccidentMonth_en: row.AccidentMonth_en || '',
                AccidentWeekDay_en: row.AccidentWeekDay_en || '',
                AccidentHour: row.AccidentHour || ''
              };
              
              points.push({
                lat,
                lng,
                accident
              });
            }
            
            console.log(`Processing complete:`, {
              processed: processed,
              successful: points.length,
              skippedMissing: skippedMissing,
              skippedInvalid: skippedInvalid,
              skippedOutOfBounds: skippedOutOfBounds
            });
            
            if (points.length > 0) {
              console.log('First 3 points:', points.slice(0, 3));
            } else {
              console.error('No valid points were created!');
            }
            
            resolve(points);
          } catch (error) {
            console.error('Error processing CSV data:', error);
            reject(error);
          }
        },
        error: (error: any) => {
          console.error('Papa Parse error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading accident data:', error);
    throw error;
  }
};