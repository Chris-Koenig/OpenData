import React, { useState, useEffect, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import FilterComponent from './components/FilterComponent';
import { loadAccidentDataFinal } from './services/finalLoader';
import { CoordinatePoint, FilterState } from './types/accident';
import './App.css';

function App() {
  const [accidents, setAccidents] = useState<CoordinatePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    showPedestrianAccidents: true,
    showBicycleAccidents: true,
    showOtherAccidents: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load the accident data using final production loader
        console.log('🚀 Loading Zurich traffic accident data...');
        const data = await loadAccidentDataFinal();
        console.log('Data loaded successfully:', data.length, 'points');
        
        if (data.length === 0) {
          console.error('No data points were processed successfully, using fallback test data');
          // Fallback to test data if real data fails
          const fallbackData: CoordinatePoint[] = [
            {
              lat: 47.3769, lng: 8.5417,
              accident: {
                AccidentUID: 'fallback1', AccidentType: 'Test', AccidentType_en: 'Fallback Pedestrian Accident',
                AccidentSeverityCategory: 'test', AccidentSeverityCategory_en: 'Test Severity',
                AccidentInvolvingPedestrian: 'true', AccidentInvolvingBicycle: 'false',
                AccidentInvolvingMotorcycle: 'false', RoadType_en: 'Test Road',
                AccidentLocation_CHLV95_E: '2683000', AccidentLocation_CHLV95_N: '1247000',
                AccidentYear: '2023', AccidentMonth: '7', AccidentMonth_en: 'July',
                AccidentWeekDay_en: 'Monday', AccidentHour: '12'
              }
            },
            {
              lat: 47.3667, lng: 8.5500,
              accident: {
                AccidentUID: 'fallback2', AccidentType: 'Test', AccidentType_en: 'Fallback Bicycle Accident',
                AccidentSeverityCategory: 'test', AccidentSeverityCategory_en: 'Test Severity',
                AccidentInvolvingPedestrian: 'false', AccidentInvolvingBicycle: 'true',
                AccidentInvolvingMotorcycle: 'false', RoadType_en: 'Test Road',
                AccidentLocation_CHLV95_E: '2684000', AccidentLocation_CHLV95_N: '1246000',
                AccidentYear: '2023', AccidentMonth: '8', AccidentMonth_en: 'August',
                AccidentWeekDay_en: 'Tuesday', AccidentHour: '15'
              }
            }
          ];
          setAccidents(fallbackData);
          return;
        }
        
        setAccidents(data);
        
      } catch (err) {
        console.error('💥 APP: Fatal error in loadData:', err);
        console.error('💥 APP: Error type:', typeof err);
        console.error('💥 APP: Error message:', err instanceof Error ? err.message : 'Unknown error');
        console.error('💥 APP: Error stack:', err instanceof Error ? err.stack : 'No stack');
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to load accident data';
        setError(errorMessage);
        console.error('💥 APP: Set error state to:', errorMessage);
        
        // Set fallback data when there's an error
        console.log('💥 APP: Setting fallback data due to error...');
        const fallbackData: CoordinatePoint[] = [
          {
            lat: 47.3769, lng: 8.5417,
            accident: {
              AccidentUID: 'error-fallback1', AccidentType: 'Test', AccidentType_en: 'Error Fallback Pedestrian',
              AccidentSeverityCategory: 'test', AccidentSeverityCategory_en: 'Test Severity',
              AccidentInvolvingPedestrian: 'true', AccidentInvolvingBicycle: 'false',
              AccidentInvolvingMotorcycle: 'false', RoadType_en: 'Test Road',
              AccidentLocation_CHLV95_E: '2683000', AccidentLocation_CHLV95_N: '1247000',
              AccidentYear: '2023', AccidentMonth: '7', AccidentMonth_en: 'July',
              AccidentWeekDay_en: 'Monday', AccidentHour: '12'
            }
          },
          {
            lat: 47.3667, lng: 8.5500,
            accident: {
              AccidentUID: 'error-fallback2', AccidentType: 'Test', AccidentType_en: 'Error Fallback Bicycle',
              AccidentSeverityCategory: 'test', AccidentSeverityCategory_en: 'Test Severity',
              AccidentInvolvingPedestrian: 'false', AccidentInvolvingBicycle: 'true',
              AccidentInvolvingMotorcycle: 'false', RoadType_en: 'Test Road',
              AccidentLocation_CHLV95_E: '2684000', AccidentLocation_CHLV95_N: '1246000',
              AccidentYear: '2023', AccidentMonth: '8', AccidentMonth_en: 'August',
              AccidentWeekDay_en: 'Tuesday', AccidentHour: '15'
            }
          }
        ];
        setAccidents(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredAccidents = useMemo(() => {
    return accidents.filter(accident => {
      const isPedestrian = accident.accident.AccidentInvolvingPedestrian === 'true';
      const isBicycle = accident.accident.AccidentInvolvingBicycle === 'true';
      const isOther = !isPedestrian && !isBicycle;

      if (isPedestrian && !filters.showPedestrianAccidents) return false;
      if (isBicycle && !filters.showBicycleAccidents) return false;
      if (isOther && !filters.showOtherAccidents) return false;

      return true;
    });
  }, [accidents, filters]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading accident data...</p>
        <p>Check browser console for debug information</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Zurich Traffic Accidents Visualization</h1>
        <p>Interactive map showing traffic accident locations in Zurich</p>
      </header>
      
      <div className="app-content">
        <aside className="sidebar">
          <FilterComponent
            filters={filters}
            onFilterChange={setFilters}
            totalAccidents={accidents.length}
            filteredCount={filteredAccidents.length}
          />
          {accidents.length === 0 && (
            <div style={{ padding: '10px', color: 'red' }}>
              No accident data loaded! Check console for errors.
            </div>
          )}
        </aside>
        
        <main className="map-section">
          <MapComponent accidents={filteredAccidents} />
        </main>
      </div>
    </div>
  );
}

export default App;
