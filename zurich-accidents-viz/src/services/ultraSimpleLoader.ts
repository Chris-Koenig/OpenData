import Papa from "papaparse";
import { CoordinatePoint, AccidentData } from "../types/accident";
import { convertLV95ToWGS84 } from "../utils/coordinates";

export async function loadAccidentDataUltraSimple(): Promise<
  CoordinatePoint[]
> {
  console.log("🚀 Ultra Simple Loader: Starting...");

  try {
    // Step 1: Fetch the CSV file
    console.log("📥 Ultra Simple Loader: Fetching CSV...");
    const response = await fetch("/RoadTrafficAccidentLocations.csv");

    if (!response.ok) {
      console.error(
        "❌ Ultra Simple Loader: Fetch failed:",
        response.status,
        response.statusText
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("✅ Ultra Simple Loader: CSV fetched successfully");

    // Step 2: Get text content
    const csvText = await response.text();
    console.log(
      `📊 Ultra Simple Loader: CSV size: ${csvText.length} characters`
    );

    // Step 3: Remove BOM if present
    const cleanText = csvText.replace(/^\uFEFF/, "");
    console.log(
      `🧹 Ultra Simple Loader: After BOM removal: ${cleanText.length} characters`
    );

    // Step 4: Parse CSV
    console.log("🔍 Ultra Simple Loader: Parsing CSV...");
    const parseResult = Papa.parse(cleanText, {
      header: true,
      skipEmptyLines: true,
    });

    console.log(
      `📈 Ultra Simple Loader: Parse complete. Rows: ${parseResult.data.length}, Errors: ${parseResult.errors.length}`
    );

    if (parseResult.errors.length > 0) {
      console.warn(
        "⚠️  Ultra Simple Loader: Parse errors:",
        parseResult.errors.slice(0, 3)
      );
    }

    if (parseResult.data.length === 0) {
      console.error("❌ Ultra Simple Loader: No data parsed!");
      return [];
    }

    // Step 5: Check first row structure
    const firstRow = parseResult.data[0] as any;
    console.log(
      "🔍 Ultra Simple Loader: First row keys:",
      Object.keys(firstRow).slice(0, 10)
    );
    console.log(
      "🔍 Ultra Simple Loader: East coordinate:",
      firstRow["AccidentLocation_CHLV95_E"]
    );
    console.log(
      "🔍 Ultra Simple Loader: North coordinate:",
      firstRow["AccidentLocation_CHLV95_N"]
    );

    // Step 6: Process just the first 10 rows for testing
    console.log("⚡ Ultra Simple Loader: Processing first 10 rows...");
    const testRows = parseResult.data.slice(0, 10);
    const points: CoordinatePoint[] = [];

    for (let i = 0; i < testRows.length; i++) {
      const row = testRows[i] as any;
      console.log(`🔄 Processing row ${i}:`, {
        east: row["AccidentLocation_CHLV95_E"],
        north: row["AccidentLocation_CHLV95_N"],
        pedestrian: row["AccidentInvolvingPedestrian"],
        bicycle: row["AccidentInvolvingBicycle"],
      });

      const east = parseFloat(row["AccidentLocation_CHLV95_E"]);
      const north = parseFloat(row["AccidentLocation_CHLV95_N"]);

      if (isNaN(east) || isNaN(north)) {
        console.warn(
          `⚠️  Row ${i}: Invalid coordinates - E=${east}, N=${north}`
        );
        continue;
      }

      // Convert coordinates
      const { lat, lng } = convertLV95ToWGS84(east, north);
      console.log(`🌐 Row ${i}: Converted to lat=${lat}, lng=${lng}`);

      // Basic validation for Switzerland
      if (lat < 45.8 || lat > 47.9 || lng < 5.9 || lng > 10.5) {
        console.warn(
          `⚠️  Row ${i}: Coordinates outside Switzerland - lat=${lat}, lng=${lng}`
        );
        continue;
      }

      // Create accident data object
      const accidentData: AccidentData = {
        AccidentUID: row["AccidentUID"] || `row-${i}`,
        AccidentType: row["AccidentType"] || "unknown",
        AccidentType_en: row["AccidentType_en"] || "Unknown",
        AccidentSeverityCategory: row["AccidentSeverityCategory"] || "unknown",
        AccidentSeverityCategory_en:
          row["AccidentSeverityCategory_en"] || "Unknown",
        AccidentInvolvingPedestrian:
          row["AccidentInvolvingPedestrian"] || "false",
        AccidentInvolvingBicycle: row["AccidentInvolvingBicycle"] || "false",
        AccidentInvolvingMotorcycle:
          row["AccidentInvolvingMotorcycle"] || "false",
        RoadType_en: row["RoadType_en"] || "Unknown",
        AccidentLocation_CHLV95_E: row["AccidentLocation_CHLV95_E"],
        AccidentLocation_CHLV95_N: row["AccidentLocation_CHLV95_N"],
        AccidentYear: row["AccidentYear"] || "2023",
        AccidentMonth: row["AccidentMonth"] || "1",
        AccidentMonth_en: row["AccidentMonth_en"] || "January",
        AccidentWeekDay_en: row["AccidentWeekDay_en"] || "Monday",
        AccidentHour: row["AccidentHour"] || "12",
      };

      // Create point
      const point: CoordinatePoint = {
        lat,
        lng,
        accident: accidentData,
      };

      points.push(point);
      console.log(`✅ Row ${i}: Point created successfully`);
    }

    console.log(
      `🎉 Ultra Simple Loader: Complete! Generated ${points.length} points from ${testRows.length} test rows`
    );
    console.log("📍 Sample points:", points.slice(0, 3));

    return points;
  } catch (error) {
    console.error("💥 Ultra Simple Loader: Fatal error:", error);
    return [];
  }
}
