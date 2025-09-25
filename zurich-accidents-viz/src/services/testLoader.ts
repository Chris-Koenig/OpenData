// Simple test to load and parse CSV data
import Papa from 'papaparse';

export const testCSVLoad = async () => {
  try {
    console.log('Testing CSV load...');
    const response = await fetch('/RoadTrafficAccidentLocations.csv');
    console.log('Response status:', response.status, response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    let text = await response.text();
    console.log('Raw text length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));
    
    // Remove BOM if present
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
      console.log('Removed BOM');
    }
    
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          console.log('Parse complete:', {
            rows: results.data.length,
            errors: results.errors.length,
            firstRow: results.data[0]
          });
          resolve(results);
        }
      });
    });
  } catch (error) {
    console.error('Test failed:', error);
    return null;
  }
};