// components/GasBoilerMap.tsx - CLEAN VERSION
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { buildingService } from '../services/buildingService';
import { gasBoilerService } from '../services/gasBoilerService';
import { BuildingMapPoint } from '../types/buildingtypes';
import { CreateBuildingPayload } from '../types/buildingtypes';
import { CreateGasBoilerPayload } from '../types/gasBoilertypes';
import CreateBuildingModal from './CreateBuildingModal';
import BuildingDetailsModal from './BuildingDetailsModal';
import CreateBoilerModal from './CreateBoilerModal';
import './GasBoilerMap.css';
import 'leaflet/dist/leaflet.css';

// Fix leaflet's default icon path
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Props {
  token: string;
  center?: LatLngExpression;
  zoom?: number;
}

const GasBoilerMap: React.FC<Props> = ({ token, center = [44.7866, 20.4489], zoom = 7 }) => {
  // Building markers on map
  const [buildings, setBuildings] = useState<BuildingMapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Building Modal
  const [createBuildingOpen, setCreateBuildingOpen] = useState(false);
  const [newBuildingPosition, setNewBuildingPosition] = useState<L.LatLng | null>(null);

  // Building Details Modal
  const [buildingDetailsOpen, setBuildingDetailsOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);

  // Create Boiler Modal
  const [createBoilerOpen, setCreateBoilerOpen] = useState(false);
  const [selectedBuildingForBoiler, setSelectedBuildingForBoiler] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadBuildings();
  }, [token]);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const data = await buildingService.getMapPoints(token);
      console.log('Učitane zgrade:', data);
      setBuildings(data);
    } catch (err) {
      console.error('Greška prilikom učitavanja zgrada:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle right-click to create building
  const MapEvents = () => {
    useMapEvents({
      contextmenu: (e) => {
        console.log('Desni klik detected!', e.latlng);
        e.originalEvent.preventDefault();
        setNewBuildingPosition(e.latlng);
        setCreateBuildingOpen(true);
      },
    });
    return null;
  };

  // Create building
  const handleCreateBuilding = async (payload: CreateBuildingPayload) => {
    try {
      console.log('Kreiranje zgrade:', payload);
      await buildingService.createBuilding(payload, token);
      await loadBuildings(); // Refresh map
      setCreateBuildingOpen(false);
      setNewBuildingPosition(null);
    } catch (err) {
      console.error('Greška prilikom kreiranja zgrade:', err);
      throw err;
    }
  };

  // Open building details
  const handleBuildingClick = (buildingId: number) => {
    setSelectedBuildingId(buildingId);
    setBuildingDetailsOpen(true);
  };

  // Open create boiler modal
  const handleAddBoiler = (buildingId: number) => {
    const building = buildings.find((b) => b.id === buildingId);
    if (building) {
      setSelectedBuildingForBoiler({ id: building.id, name: building.name });
      setBuildingDetailsOpen(false); // Close details modal
      setCreateBoilerOpen(true);
    }
  };

  // Create boiler
  const handleCreateBoiler = async (payload: CreateGasBoilerPayload) => {
    try {
      console.log('Kreiranje kotla:', payload);
      await gasBoilerService.createGasBoiler(payload, token);
      await loadBuildings(); // Refresh map to update boiler count
      setCreateBoilerOpen(false);
      setSelectedBuildingForBoiler(null);
      
      // Reopen building details to show new boiler
      if (payload.buildingObjectId) {
        setSelectedBuildingId(payload.buildingObjectId);
        setBuildingDetailsOpen(true);
      }
    } catch (err) {
      console.error('Greška prilikom kreiranja kotla:', err);
      throw err;
    }
  };

  // Delete building
  const handleDeleteBuilding = async (buildingId: number) => {
    try {
      await buildingService.deleteBuilding(buildingId, token);
      await loadBuildings(); // Refresh map
      setBuildingDetailsOpen(false);
    } catch (err) {
      console.error('Greška prilikom brisanja zgrade:', err);
      alert('Greška prilikom brisanja zgrade');
    }
  };

  // Delete boiler
  const handleDeleteBoiler = async (boilerId: number) => {
    try {
      await gasBoilerService.deleteGasBoiler(boilerId, token);
      await loadBuildings(); // Refresh map to update boiler count
    } catch (err) {
      console.error('Greška prilikom brisanja kotla:', err);
      alert('Greška prilikom brisanja kotla');
    }
  };

  // Placeholder for edit functions (implement later)
  const handleEditBuilding = (buildingId: number) => {
    console.log('Izmena zgrade:', buildingId);
    alert('Funkcija za izmenu zgrade nije implementirana');
  };

  const handleEditBoiler = (boilerId: number) => {
    console.log('Izmena kotla:', boilerId);
    alert('Funkcija za izmenu kotla nije implementirana');
  };

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={zoom} className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!loading &&
          buildings.map((building) => {
            if (!building.latitude || !building.longitude) {
              console.warn('Nevažeća zgrada:', building);
              return null;
            }

            return (
              <Marker
                key={building.id}
                position={[building.latitude, building.longitude]}
                eventHandlers={{
                  click: () => handleBuildingClick(building.id),
                }}
              >
                <Popup>
                  <div className="building-popup">
                    <h3 className="building-popup-title">🏢 {building.name}</h3>
                    <p className="building-popup-info">
                      <strong>Broj kotlova:</strong> {building.boilerCount}
                    </p>
                    <p className="building-popup-info">
                      <strong>Ukupna snaga:</strong> {building.totalMaxPower.toFixed(1)} kW
                    </p>
                    <p className="building-popup-info">
                      <strong>Trenutno:</strong> {building.totalCurrentPower.toFixed(1)} kW
                    </p>
                    <button
                      onClick={() => handleBuildingClick(building.id)}
                      className="building-popup-button"
                    >
                      Vidi Detalje
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        <MapEvents />
      </MapContainer>

      {/* Create Building Modal */}
      <CreateBuildingModal
        isOpen={createBuildingOpen}
        position={newBuildingPosition}
        onClose={() => {
          setCreateBuildingOpen(false);
          setNewBuildingPosition(null);
        }}
        onCreate={handleCreateBuilding}
      />

      {/* Building Details Modal */}
      <BuildingDetailsModal
        isOpen={buildingDetailsOpen}
        buildingId={selectedBuildingId}
        token={token}
        onClose={() => {
          setBuildingDetailsOpen(false);
          setSelectedBuildingId(null);
        }}
        onAddBoiler={handleAddBoiler}
        onEditBuilding={handleEditBuilding}
        onDeleteBuilding={handleDeleteBuilding}
        onEditBoiler={handleEditBoiler}
        onDeleteBoiler={handleDeleteBoiler}
      />

      {/* Create Boiler Modal */}
      <CreateBoilerModal
        isOpen={createBoilerOpen}
        buildingId={selectedBuildingForBoiler?.id || null}
        buildingName={selectedBuildingForBoiler?.name || ''}
        onClose={() => {
          setCreateBoilerOpen(false);
          setSelectedBuildingForBoiler(null);
        }}
        onCreate={handleCreateBoiler}
      />
    </div>
  );
};

export default GasBoilerMap;