import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import { LatLngExpression } from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { buildingService } from '../services/buildingService';
import { gasBoilerService } from '../services/gasBoilerService';
import { BuildingMapPoint, Building } from '../types/buildingtypes';
import { CreateBuildingPayload } from '../types/buildingtypes';
import { CreateGasBoilerPayload } from '../types/gasBoilertypes';
import CreateBuildingModal from './CreateBuildingModal';
import BuildingDetailsModal from './BuildingDetailsModal';
import CreateBoilerModal from './CreateBoilerModal';
import EditBuildingModal from './EditBuildingModal';
import EditBoilerModal from '../pages/MyBoilers/EditBoilerModal';
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
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [buildings, setBuildings] = useState<BuildingMapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [createBuildingOpen, setCreateBuildingOpen] = useState(false);
  const [newBuildingPosition, setNewBuildingPosition] = useState<L.LatLng | null>(null);

  const [buildingDetailsOpen, setBuildingDetailsOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);

  const [createBoilerOpen, setCreateBoilerOpen] = useState(false);
  const [selectedBuildingForBoiler, setSelectedBuildingForBoiler] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [editBuildingOpen, setEditBuildingOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const [editBoilerOpen, setEditBoilerOpen] = useState(false);
  const [editingBoiler, setEditingBoiler] = useState<any>(null);

  useEffect(() => {
    loadBuildings();
  }, [token]);

  useEffect(() => {
    const buildingIdFromUrl = searchParams.get('building');
    if (buildingIdFromUrl) {
      const id = parseInt(buildingIdFromUrl);
      if (!isNaN(id)) {
        setSelectedBuildingId(id);
        setBuildingDetailsOpen(true);
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams]);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const data = await buildingService.getMapPoints(token);
      setBuildings(data);
    } catch (err) {
      console.error('Greška prilikom učitavanja zgrada:', err);
    } finally {
      setLoading(false);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      contextmenu: (e) => {
        e.originalEvent.preventDefault();
        
        if (isAdmin) {
          alert('Administratori ne mogu kreirati zgrade. Samo možete pregledati.');
          return;
        }
        
        setNewBuildingPosition(e.latlng);
        setCreateBuildingOpen(true);
      },
    });
    return null;
  };

  const handleCreateBuilding = async (payload: CreateBuildingPayload) => {
    try {
      await buildingService.createBuilding(payload, token);
      await loadBuildings();
      setCreateBuildingOpen(false);
      setNewBuildingPosition(null);
    } catch (err) {
      console.error('Greška prilikom kreiranja zgrade:', err);
      throw err;
    }
  };

  const handleBuildingClick = (buildingId: number) => {
    setSelectedBuildingId(buildingId);
    setBuildingDetailsOpen(true);
  };

  const handleAddBoiler = (buildingId: number) => {
    if (isAdmin) {
      alert('Administratori ne mogu kreirati kotlove. Samo možete pregledati.');
      return;
    }
    
    const building = buildings.find((b) => b.id === buildingId);
    if (building) {
      setSelectedBuildingForBoiler({ id: building.id, name: building.name });
      setBuildingDetailsOpen(false);
      setCreateBoilerOpen(true);
    }
  };

  const handleCreateBoiler = async (payload: CreateGasBoilerPayload) => {
    try {
      await gasBoilerService.createGasBoiler(payload, token);
      await loadBuildings();
      setCreateBoilerOpen(false);
      setSelectedBuildingForBoiler(null);
      
      if (payload.buildingObjectId) {
        setSelectedBuildingId(payload.buildingObjectId);
        setBuildingDetailsOpen(true);
      }
    } catch (err) {
      console.error('Greška prilikom kreiranja kotla:', err);
      throw err;
    }
  };

  // ========== CHANGED: Added admin check ==========
  const handleEditBuilding = async (buildingId: number) => {
    // Admin check
    if (isAdmin) {
      alert('Administratori ne mogu menjati zgrade. Ovo je režim samo za pregled.');
      return;
    }

    try {
      const building = await buildingService.getBuildingById(buildingId, token);
      setEditingBuilding(building);
      setBuildingDetailsOpen(false);
      setEditBuildingOpen(true);
    } catch (err) {
      console.error('Greška prilikom učitavanja zgrade:', err);
      alert('Greška prilikom učitavanja zgrade');
    }
  };

  const handleBuildingUpdated = async (updatedBuilding: Building) => {
    await loadBuildings();
    setEditBuildingOpen(false);
    setEditingBuilding(null);
    setSelectedBuildingId(updatedBuilding.id);
    setBuildingDetailsOpen(true);
  };

  // ========== CHANGED: Added admin check ==========
  const handleEditBoiler = async (boilerId: number) => {
    // Admin check
    if (isAdmin) {
      alert('Administratori ne mogu menjati kotlove. Ovo je režim samo za pregled.');
      return;
    }

    try {
      const boiler = await gasBoilerService.getBoilerById(boilerId, token);
      setEditingBoiler(boiler);
      setBuildingDetailsOpen(false);
      setEditBoilerOpen(true);
    } catch (err) {
      console.error('Greška prilikom učitavanja kotla:', err);
      alert('Greška prilikom učitavanja kotla');
    }
  };

  const handleBoilerUpdated = async (updatedBoiler: any) => {
    await loadBuildings();
    setEditBoilerOpen(false);
    setEditingBoiler(null);
    if (selectedBuildingId) {
      setBuildingDetailsOpen(true);
    }
  };

  // ========== CHANGED: Added admin check ==========
  const handleDeleteBuilding = async (buildingId: number) => {
    // Admin check
    if (isAdmin) {
      alert('Administratori ne mogu brisati zgrade. Ovo je režim samo za pregled.');
      return;
    }

    try {
      await buildingService.deleteBuilding(buildingId, token);
      await loadBuildings();
      setBuildingDetailsOpen(false);
    } catch (err) {
      console.error('Greška prilikom brisanja zgrade:', err);
      alert('Greška prilikom brisanja zgrade');
    }
  };

  // ========== CHANGED: Added admin check ==========
  const handleDeleteBoiler = async (boilerId: number): Promise<void> => {
    // Admin check
    if (isAdmin) {
      alert('Administratori ne mogu brisati kotlove. Ovo je režim samo za pregled.');
      return;
    }

    try {
      await gasBoilerService.deleteGasBoiler(boilerId, token);
      await loadBuildings();
    } catch (err) {
      console.error('Greška prilikom brisanja kotla:', err);
      throw err;
    }
  };

  return (
    <div className="map-container">
      {isAdmin && (
        <div className="admin-mode-banner">
          👔 Administrator Režim - Samo Pregled (ne možete kreirati, menjati ili brisati)
        </div>
      )}
      
      <MapContainer center={center} zoom={zoom} className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!loading &&
          buildings.map((building) => {
            if (!building.latitude || !building.longitude) {
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

      <CreateBuildingModal
        isOpen={createBuildingOpen}
        position={newBuildingPosition}
        onClose={() => {
          setCreateBuildingOpen(false);
          setNewBuildingPosition(null);
        }}
        onCreate={handleCreateBuilding}
      />

      {/* ========== CHANGED: Added isAdmin prop ========== */}
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
        isAdmin={isAdmin}
      />

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

      {editBuildingOpen && editingBuilding && (
        <EditBuildingModal
          isOpen={editBuildingOpen}
          building={editingBuilding}
          token={token}
          onClose={() => {
            setEditBuildingOpen(false);
            setEditingBuilding(null);
          }}
          onSuccess={handleBuildingUpdated}
        />
      )}

      {editBoilerOpen && editingBoiler && (
        <EditBoilerModal
          boiler={editingBoiler}
          onClose={() => {
            setEditBoilerOpen(false);
            setEditingBoiler(null);
          }}
          onSave={handleBoilerUpdated}
          token={token}
        />
      )}
    </div>
  );
};

export default GasBoilerMap;