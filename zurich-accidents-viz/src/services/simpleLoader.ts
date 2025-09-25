import Papa from "papaparse";
import { AccidentData, CoordinatePoint } from "../types/accident";

// Simplified and more robust coordinate conversion
const convertLV95ToWGS84 = (
  east: number,
  north: number
): { lat: number; lng: number } => {
  // Convert LV95 to LV03
  const E = east - 2000000;
  const N = north - 1000000;

  // Auxiliary values
  const y = (E - 600000) / 1000000;
  const x = (N - 200000) / 1000000;

  // Calculate WGS84 coordinates
  const lng =
    2.6779094 +
    4.728982 * y +
    0.791484 * y * x +
    0.1306 * y * x * x -
    0.0436 * y * y * y;
  const lat =
    46.9524 +
    4.728982 * x -
    0.791484 * y * y +
    0.1306 * y * y * x -
    0.0436 * x * x * x;

  return { lat, lng };
};

const parseNumber = (str: string): number => {
  if (!str || str === "") return 0;
  const num = parseFloat(str.replace(/"/g, ""));
  return isNaN(num) ? 0 : num;
};

export const loadAccidentDataSimple = async (): Promise<CoordinatePoint[]> => {
  try {
    console.log("🚀 Loading accident data (simple version)...");

    const response = await fetch("/RoadTrafficAccidentLocations.csv");
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }

    let csvText = await response.text();

    // Remove BOM if present
    if (csvText.charCodeAt(0) === 0xfeff) {
      csvText = csvText.slice(1);
    }

    console.log("📄 CSV loaded, size:", csvText.length);

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          console.log("✅ Parsing complete:", results.data.length, "rows");

          const points: CoordinatePoint[] = [];
          let processed = 0;
          let successful = 0;

          // Process first 1000 rows for testing
          const maxRows = Math.min(1000, results.data.length);

          for (let i = 0; i < maxRows; i++) {
            const row = results.data[i];
            processed++;

            if (!row || typeof row !== "object") continue;

            const eastStr =
              row["AccidentLocation_CHLV95_E"] || row.AccidentLocation_CHLV95_E;
            const northStr =
              row["AccidentLocation_CHLV95_N"] || row.AccidentLocation_CHLV95_N;

            if (!eastStr || !northStr) continue;

            const east = parseNumber(eastStr);
            const north = parseNumber(northStr);

            if (east === 0 || north === 0) continue;
            if (east < 2000000 || east > 3000000) continue; // Basic LV95 bounds
            if (north < 1000000 || north > 2000000) continue;

            const { lat, lng } = convertLV95ToWGS84(east, north);

            // Very basic validation
            if (lat < 45 || lat > 50 || lng < 5 || lng > 12) continue;
            if (isNaN(lat) || isNaN(lng)) continue;

            const accident: AccidentData = {
              AccidentUID: row.AccidentUID || "",
              AccidentType: row.AccidentType || "",
              AccidentType_en: row.AccidentType_en || row.AccidentType || "",
              AccidentSeverityCategory: row.AccidentSeverityCategory || "",
              AccidentSeverityCategory_en:
                row.AccidentSeverityCategory_en || "",
              AccidentInvolvingPedestrian:
                row.AccidentInvolvingPedestrian || "false",
              AccidentInvolvingBicycle: row.AccidentInvolvingBicycle || "false",
              AccidentInvolvingMotorcycle:
                row.AccidentInvolvingMotorcycle || "false",
              RoadType_en: row.RoadType_en || "",
              AccidentLocation_CHLV95_E: eastStr,
              AccidentLocation_CHLV95_N: northStr,
              AccidentYear: row.AccidentYear || "",
              AccidentMonth: row.AccidentMonth || "",
              AccidentMonth_en: row.AccidentMonth_en || "",
              AccidentWeekDay_en: row.AccidentWeekDay_en || "",
              AccidentHour: row.AccidentHour || "",
            };

            points.push({ lat, lng, accident });
            successful++;
          }

          console.log("📊 Processing results:", {
            processed,
            successful,
            percentage: Math.round((successful / processed) * 100),
          });

          if (successful > 0) {
            console.log("🎯 Sample points:", points.slice(0, 3));
          }

          resolve(points);
        },
        error: reject,
      });
    });
  } catch (error) {
    console.error("❌ Error loading data:", error);
    throw error;
  }
};
