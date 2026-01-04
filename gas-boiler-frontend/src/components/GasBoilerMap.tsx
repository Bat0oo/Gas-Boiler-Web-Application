import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup ,useMapEvents} from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { gasBoilerService } from "../services/gasBoilerService";
import './GasBoilerMap.css'
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
  token: string;
  center?: LatLngExpression;
  zoom?: number;
}

const GasBoilerMap: React.FC<Props> = ({ token, center = [44.7866, 20.4489], zoom = 7 }) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  //
  const [modalOpen, setModalOpen] = useState(false);
  const [newPosition, setNewPosition] = useState<L.LatLng | null>(null);
  const [newBoilerName, setNewBoilerName] = useState("");
  const [newBoilerMaxPower, setNewBoilerMaxPower] = useState<number>(0);
  const [newBoilerEfficiency, setNewBoilerEfficiency] = useState<number>(0);
  //

   useEffect(() => {
    loadMapPoints();
  }, [token]);

  const loadMapPoints = async () => {
    setLoading(true);
    try {
      const data = await gasBoilerService.getMapPoints(token);
      console.log("Loaded points:", data); // Debug
      setPoints(data);
    } catch (err) {
      console.error("Failed to load map points", err);
    } finally {
      setLoading(false);
    }
  };
console.log("BASE URL:", process.env.REACT_APP_API_BASE_URL); //testing

// right clic
  const MapEvents = () => {
    useMapEvents({
      contextmenu: (e) => {
              console.log("Desni klik detected!", e.latlng); 
        e.originalEvent.preventDefault();
        setNewPosition(e.latlng);
        setModalOpen(true);
      },
    });
    return null;
  };
  //

//
const handleCreateBoiler = async () => {
    if (!newPosition) return;
    try {
      const payload = {
        name: newBoilerName,
        maxPower: Math.max(0, newBoilerMaxPower),
        efficiency: Math.max(0, Math.min(1, newBoilerEfficiency)),
        currentPower: 0,
        buildingObject: {
          name: `Building for ${newBoilerName}`,
          latitude: newPosition.lat,
          longitude: newPosition.lng,
          heatingArea: 100,
          desiredTemperature: 22,
          wallUValue: 0.5,
          windowUValue: 1.1,
          ceilingUValue: 0.4,
          floorUValue: 0.3,
          wallArea: 80,
          windowArea: 20,
          ceilingArea: 40,
          floorArea: 40
        }
    };
    console.log("Creating boiler with payload:", payload);
      const created = await gasBoilerService.createGasBoiler(payload, token);
            console.log("Created boiler:", created);

      setPoints([...points, created]);
      setModalOpen(false);
      setNewBoilerName("");
      setNewBoilerMaxPower(0);
      setNewBoilerEfficiency(0);
      setNewPosition(null);
    } catch (err) {
      console.error("Failed to create boiler", err);
    }
  };
  //

   return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!loading && points.map((p) => {
          // Validation check
          if (!p.lat || !p.lon) {
            console.warn("Invalid point:", p);
            return null;
          }
          
          return (
            <Marker key={p.id} position={[p.lat, p.lon]}>
              <Popup>
                <div>
                  <h3>{p.name}</h3>
                  <p>Trenutna snaga: {p.currentPower} kW</p>
                  <p>ID kotla: {p.id}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <MapEvents />
      </MapContainer>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Kreiraj Gas Boiler</h2>
            <label>
              Ime kotla:
              <input
                value={newBoilerName}
                onChange={(e) => setNewBoilerName(e.target.value)}
                placeholder="Unesite naziv kotla"
              />
            </label>
            <label>
              Maksimalna snaga (kW):
              <input
                type="number"
                value={newBoilerMaxPower}
                onChange={(e) => setNewBoilerMaxPower(parseFloat(e.target.value) || 0)}
              />
            </label>
            <label>
              Efikasnost (0-1, npr. 0.95 = 95%):
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={newBoilerEfficiency}
                onChange={(e) => setNewBoilerEfficiency(parseFloat(e.target.value) || 0)}
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handleCreateBoiler} className="btn-primary">
                Kreiraj
              </button>
              <button onClick={() => setModalOpen(false)} className="btn-secondary">
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GasBoilerMap;