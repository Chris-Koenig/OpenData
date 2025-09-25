import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { CoordinatePoint } from "../types/accident";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

interface MapComponentProps {
  accidents: CoordinatePoint[];
}

// Custom icons for different accident types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const pedestrianIcon = createCustomIcon("#ff4444");
const bicycleIcon = createCustomIcon("#44ff44");
const otherIcon = createCustomIcon("#4444ff");
const mixedIcon = createCustomIcon("#ff8800");

const MapComponent: React.FC<MapComponentProps> = ({ accidents }) => {
  const getMarkerIcon = (accident: CoordinatePoint) => {
    const isPedestrian =
      accident.accident.AccidentInvolvingPedestrian === "true";
    const isBicycle = accident.accident.AccidentInvolvingBicycle === "true";

    if (isPedestrian && isBicycle) {
      return mixedIcon;
    } else if (isPedestrian) {
      return pedestrianIcon;
    } else if (isBicycle) {
      return bicycleIcon;
    } else {
      return otherIcon;
    }
  };

  // Center on Zurich
  const center: [number, number] = [47.3769, 8.5417];

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {accidents.map((point, index) => (
          <Marker
            key={`${point.accident.AccidentUID}-${index}`}
            position={[point.lat, point.lng]}
            icon={getMarkerIcon(point)}
          >
            <Popup>
              <div className="accident-popup">
                <h4>{point.accident.AccidentType_en}</h4>
                <p>
                  <strong>Severity:</strong>{" "}
                  {point.accident.AccidentSeverityCategory_en}
                </p>
                <p>
                  <strong>Year:</strong> {point.accident.AccidentYear}
                </p>
                <p>
                  <strong>Month:</strong> {point.accident.AccidentMonth_en}
                </p>
                <p>
                  <strong>Day:</strong> {point.accident.AccidentWeekDay_en}
                </p>
                <p>
                  <strong>Hour:</strong> {point.accident.AccidentHour}
                </p>
                <p>
                  <strong>Road Type:</strong> {point.accident.RoadType_en}
                </p>
                {point.accident.AccidentInvolvingPedestrian === "true" && (
                  <span className="involvement-badge pedestrian">
                    Pedestrian
                  </span>
                )}
                {point.accident.AccidentInvolvingBicycle === "true" && (
                  <span className="involvement-badge bicycle">Bicycle</span>
                )}
                {point.accident.AccidentInvolvingMotorcycle === "true" && (
                  <span className="involvement-badge motorcycle">
                    Motorcycle
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
