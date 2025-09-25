export interface AccidentData {
  AccidentUID: string;
  AccidentType: string;
  AccidentType_en: string;
  AccidentSeverityCategory: string;
  AccidentSeverityCategory_en: string;
  AccidentInvolvingPedestrian: string;
  AccidentInvolvingBicycle: string;
  AccidentInvolvingMotorcycle: string;
  RoadType_en: string;
  AccidentLocation_CHLV95_E: string;
  AccidentLocation_CHLV95_N: string;
  AccidentYear: string;
  AccidentMonth: string;
  AccidentMonth_en: string;
  AccidentWeekDay_en: string;
  AccidentHour: string;
}

export interface FilterState {
  showPedestrianAccidents: boolean;
  showBicycleAccidents: boolean;
  showOtherAccidents: boolean;
}

export interface CoordinatePoint {
  lat: number;
  lng: number;
  accident: AccidentData;
}