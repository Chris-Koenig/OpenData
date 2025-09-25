import { CoordinatePoint } from '../types/accident';

export async function loadAccidentDataDebug(): Promise<CoordinatePoint[]> {
  console.log('🐛 DEBUG LOADER: Starting with hardcoded known-good data...');
  
  // Create some hardcoded points that we know should work
  // These are real coordinates from the CSV converted manually
  const debugPoints: CoordinatePoint[] = [
    {
      lat: 47.4021548603881,
      lng: 8.543932440204568,
      accident: {
        AccidentUID: 'debug1',
        AccidentType: 'at7',
        AccidentType_en: 'Parking Accident',
        AccidentSeverityCategory: 'as4',
        AccidentSeverityCategory_en: 'Property damage',
        AccidentInvolvingPedestrian: 'false',
        AccidentInvolvingBicycle: 'false',
        AccidentInvolvingMotorcycle: 'false',
        RoadType_en: 'Minor road',
        AccidentLocation_CHLV95_E: '2683433',
        AccidentLocation_CHLV95_N: '1250736',
        AccidentYear: '2023',
        AccidentMonth: '7',
        AccidentMonth_en: 'July',
        AccidentWeekDay_en: 'Wednesday',
        AccidentHour: '08'
      }
    },
    {
      lat: 47.38829, 
      lng: 8.53421,
      accident: {
        AccidentUID: 'debug2',
        AccidentType: 'at2',
        AccidentType_en: 'Rear-end collision',
        AccidentSeverityCategory: 'as4',
        AccidentSeverityCategory_en: 'Property damage',
        AccidentInvolvingPedestrian: 'false',
        AccidentInvolvingBicycle: 'false',
        AccidentInvolvingMotorcycle: 'false',
        RoadType_en: 'Minor road',
        AccidentLocation_CHLV95_E: '2682586',
        AccidentLocation_CHLV95_N: '1246712',
        AccidentYear: '2023',
        AccidentMonth: '7',
        AccidentMonth_en: 'July',
        AccidentWeekDay_en: 'Friday',
        AccidentHour: '12'
      }
    },
    {
      lat: 47.3850,
      lng: 8.5400,
      accident: {
        AccidentUID: 'debug3',
        AccidentType: 'at1',
        AccidentType_en: 'Pedestrian Accident',
        AccidentSeverityCategory: 'as2',
        AccidentSeverityCategory_en: 'Injury',
        AccidentInvolvingPedestrian: 'true',
        AccidentInvolvingBicycle: 'false',
        AccidentInvolvingMotorcycle: 'false',
        RoadType_en: 'Main road',
        AccidentLocation_CHLV95_E: '2682000',
        AccidentLocation_CHLV95_N: '1246000',
        AccidentYear: '2023',
        AccidentMonth: '8',
        AccidentMonth_en: 'August',
        AccidentWeekDay_en: 'Saturday',
        AccidentHour: '14'
      }
    },
    {
      lat: 47.3900,
      lng: 8.5350,
      accident: {
        AccidentUID: 'debug4',
        AccidentType: 'at3',
        AccidentType_en: 'Bicycle Accident',
        AccidentSeverityCategory: 'as3',
        AccidentSeverityCategory_en: 'Minor injury',
        AccidentInvolvingPedestrian: 'false',
        AccidentInvolvingBicycle: 'true',
        AccidentInvolvingMotorcycle: 'false',
        RoadType_en: 'Bicycle lane',
        AccidentLocation_CHLV95_E: '2682200',
        AccidentLocation_CHLV95_N: '1247200',
        AccidentYear: '2023',
        AccidentMonth: '9',
        AccidentMonth_en: 'September',
        AccidentWeekDay_en: 'Sunday',
        AccidentHour: '16'
      }
    },
    {
      lat: 47.3750,
      lng: 8.5450,
      accident: {
        AccidentUID: 'debug5',
        AccidentType: 'at4',
        AccidentType_en: 'Motorcycle Accident',
        AccidentSeverityCategory: 'as1',
        AccidentSeverityCategory_en: 'Fatal',
        AccidentInvolvingPedestrian: 'false',
        AccidentInvolvingBicycle: 'false',
        AccidentInvolvingMotorcycle: 'true',
        RoadType_en: 'Highway',
        AccidentLocation_CHLV95_E: '2682800',
        AccidentLocation_CHLV95_N: '1245800',
        AccidentYear: '2023',
        AccidentMonth: '10',
        AccidentMonth_en: 'October',
        AccidentWeekDay_en: 'Monday',
        AccidentHour: '18'
      }
    }
  ];
  
  console.log(`🐛 DEBUG LOADER: Returning ${debugPoints.length} hardcoded points`);
  console.log('🐛 DEBUG LOADER: Sample point:', debugPoints[0]);
  
  return debugPoints;
}