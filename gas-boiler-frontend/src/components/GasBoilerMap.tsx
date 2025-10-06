import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { getMapPoints } from "../services/gasBoilerService";
import "leaflet/dist/leaflet.css";

// Fix leaflet's default icon path (if needed)
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

interface Point {
  id: number;
  name: string;
  lat: number;
  lon: number;
  currentPower: number;
}

interface Props {
  token?: string;
  center?: LatLngExpression;
  zoom?: number;
}

const GasBoilerMap: React.FC<Props> = ({ token, center = [44.7866, 20.4489], zoom = 7 }) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMapPoints(token);
        setPoints(data);
      } catch (err) {
        console.error("Failed to load map points", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);
console.log("BASE URL:", process.env.REACT_APP_API_BASE_URL);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!loading && points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]}>
            <Popup>
              <div>
                <h3>{p.name}</h3>
                <p>Trenutna snaga: {p.currentPower} kW</p>
                <p>ID kotla: {p.id}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default GasBoilerMap;