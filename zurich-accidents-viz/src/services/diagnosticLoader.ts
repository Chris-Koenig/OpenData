import Papa from 'papaparse';
import { CoordinatePoint, AccidentData } from '../types/accident';
import { convertLV95ToWGS84 } from '../utils/coordinates';

export async function loadAccidentDataDiagnostic(): Promise<CoordinatePoint[]> {
  console.log('🔍 DIAGNOSTIC LOADER: Starting comprehensive diagnostic...');
  
  try {
    // Step 1: Test basic fetch
    console.log('📥 DIAGNOSTIC: Testing fetch...');
    const response = await fetch('/RoadTrafficAccidentLocations.csv');
    console.log('📥 DIAGNOSTIC: Response status:', response.status);
    console.log('📥 DIAGNOSTIC: Response ok:', response.ok);
    console.log('📥 DIAGNOSTIC: Response headers: Content-Type =', response.headers.get('content-type'));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Step 2: Get text
    console.log('📄 DIAGNOSTIC: Getting text content...');
    const csvText = await response.text();
    console.log('📄 DIAGNOSTIC: Raw text length:', csvText.length);
    console.log('📄 DIAGNOSTIC: First 100 chars:', csvText.substring(0, 100));
    
    // Step 3: Clean BOM
    const cleanText = csvText.replace(/^\uFEFF/, '');
    console.log('📄 DIAGNOSTIC: After BOM removal:', cleanText.length);
    
    // Step 4: Test Papa Parse
    console.log('🔍 DIAGNOSTIC: Starting Papa Parse...');
    const parseResult = Papa.parse(cleanText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        console.log('📋 DIAGNOSTIC: Processing header:', header);
        return header.trim();
      }
    });
    
    console.log('📋 DIAGNOSTIC: Parse result keys:', Object.keys(parseResult));
    console.log('📋 DIAGNOSTIC: Data length:', parseResult.data?.length || 0);
    console.log('📋 DIAGNOSTIC: Errors length:', parseResult.errors?.length || 0);
    console.log('📋 DIAGNOSTIC: Meta:', parseResult.meta);
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.warn('⚠️ DIAGNOSTIC: Parse errors:', parseResult.errors.slice(0, 5));
    }
    
    if (!parseResult.data || parseResult.data.length === 0) {
      console.error('❌ DIAGNOSTIC: No data in parse result');
      throw new Error('No data parsed');
    }
    
    // Step 5: Examine first row structure
    const firstRow = parseResult.data[0] as any;
    console.log('📋 DIAGNOSTIC: First row type:', typeof firstRow);
    console.log('📋 DIAGNOSTIC: First row keys:', Object.keys(firstRow || {}));
    console.log('📋 DIAGNOSTIC: First row content:', firstRow);
    
    // Step 6: Test coordinate extraction
    const eastKey = 'AccidentLocation_CHLV95_E';
    const northKey = 'AccidentLocation_CHLV95_N';
    
    console.log(`📍 DIAGNOSTIC: Looking for coordinate keys: "${eastKey}", "${northKey}"`);
    console.log(`📍 DIAGNOSTIC: East key exists: ${eastKey in firstRow}`);
    console.log(`📍 DIAGNOSTIC: North key exists: ${northKey in firstRow}`);
    console.log(`📍 DIAGNOSTIC: East value: "${firstRow[eastKey]}"`);
    console.log(`📍 DIAGNOSTIC: North value: "${firstRow[northKey]}"`);
    
    const eastVal = parseFloat(firstRow[eastKey]);
    const northVal = parseFloat(firstRow[northKey]);
    console.log(`📍 DIAGNOSTIC: Parsed coordinates: E=${eastVal}, N=${northVal}`);
    console.log(`📍 DIAGNOSTIC: Are valid numbers: E=${!isNaN(eastVal)}, N=${!isNaN(northVal)}`);
    
    if (!isNaN(eastVal) && !isNaN(northVal)) {
      const converted = convertLV95ToWGS84(eastVal, northVal);
      console.log(`🌐 DIAGNOSTIC: Converted coordinates: lat=${converted.lat}, lng=${converted.lng}`);
      
      // Create ONE test point to see if it works
      const testAccident: AccidentData = {
        AccidentUID: firstRow['AccidentUID'] || 'test-1',
        AccidentType: firstRow['AccidentType'] || 'unknown',
        AccidentType_en: firstRow['AccidentType_en'] || 'Test Accident',
        AccidentSeverityCategory: firstRow['AccidentSeverityCategory'] || 'unknown',
        AccidentSeverityCategory_en: firstRow['AccidentSeverityCategory_en'] || 'Unknown',
        AccidentInvolvingPedestrian: firstRow['AccidentInvolvingPedestrian'] || 'false',
        AccidentInvolvingBicycle: firstRow['AccidentInvolvingBicycle'] || 'false',
        AccidentInvolvingMotorcycle: firstRow['AccidentInvolvingMotorcycle'] || 'false',
        RoadType_en: firstRow['RoadType_en'] || 'Unknown',
        AccidentLocation_CHLV95_E: firstRow[eastKey] || '0',
        AccidentLocation_CHLV95_N: firstRow[northKey] || '0',
        AccidentYear: firstRow['AccidentYear'] || '2023',
        AccidentMonth: firstRow['AccidentMonth'] || '1',
        AccidentMonth_en: firstRow['AccidentMonth_en'] || 'Unknown',
        AccidentWeekDay_en: firstRow['AccidentWeekDay_en'] || 'Unknown',
        AccidentHour: firstRow['AccidentHour'] || '00'
      };
      
      const testPoint: CoordinatePoint = {
        lat: converted.lat,
        lng: converted.lng,
        accident: testAccident
      };
      
      console.log('✅ DIAGNOSTIC: Successfully created test point:', testPoint);
      console.log('🎉 DIAGNOSTIC: Returning array with 1 real data point');
      
      return [testPoint];
    }
    
    console.error('❌ DIAGNOSTIC: Could not convert coordinates');
    throw new Error('Coordinate conversion failed');
    
  } catch (error) {
    console.error('💥 DIAGNOSTIC: Caught error:', error);
    console.error('💥 DIAGNOSTIC: Error type:', typeof error);
    console.error('💥 DIAGNOSTIC: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 DIAGNOSTIC: Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Re-throw the error so we can see it in the app
    throw error;
  }
}