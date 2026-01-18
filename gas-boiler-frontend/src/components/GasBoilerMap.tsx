import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup,Tooltip, useMapEvents } from 'react-leaflet';
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
      console.error('Error loading buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      contextmenu: (e) => {
        e.originalEvent.preventDefault();

        if (isAdmin) {
          alert('Administrators cannot create buildings. You can only view.');
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
      console.error('Error creating building:', err);
      throw err;
    }
  };

  const handleBuildingClick = (buildingId: number) => {
    setSelectedBuildingId(buildingId);
    setBuildingDetailsOpen(true);
  };

  const handleAddBoiler = (buildingId: number) => {
    if (isAdmin) {
      alert('Administrators cannot create boilers. You can only view.');
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
      console.error('Error creating boiler:', err);
      throw err;
    }
  };

  // ========== CHANGED: Added admin check ==========
  const handleEditBuilding = async (buildingId: number) => {
    // Admin check
    if (isAdmin) {
      alert('Administrators cannot edit buildings. This is view-only mode.');
      return;
    }

    try {
      const building = await buildingService.getBuildingById(buildingId, token);
      setEditingBuilding(building);
      setBuildingDetailsOpen(false);
      setEditBuildingOpen(true);
    } catch (err) {
      console.error('Error loading building:', err);
      alert('Error loading building');
    }
  };

  const handleBuildingUpdated = async (updatedBuilding: Building) => {
    await loadBuildings();
    setEditBuildingOpen(false);
    setEditingBuilding(null);
    setSelectedBuildingId(updatedBuilding.id);
    setBuildingDetailsOpen(true);
  };

  const handleEditBoiler = async (boilerId: number) => {
    if (isAdmin) {
      alert('Administrators cannot edit boilers. This is view-only mode.');
      return;
    }

    try {
      const boiler = await gasBoilerService.getBoilerById(boilerId, token);
      setEditingBoiler(boiler);
      setBuildingDetailsOpen(false);
      setEditBoilerOpen(true);
    } catch (err) {
      console.error('Error loading boiler:', err);
      alert('Error loading boiler');
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

  const handleDeleteBuilding = async (buildingId: number) => {
    if (isAdmin) {
      alert('Administrators cannot delete buildings. This is view-only mode.');
      return;
    }

    try {
      await buildingService.deleteBuilding(buildingId, token);
      await loadBuildings();
      setBuildingDetailsOpen(false);
    } catch (err) {
      console.error('Error deleting building:', err);
      alert('Error deleting building');
    }
  };

  const handleDeleteBoiler = async (boilerId: number): Promise<void> => {
    if (isAdmin) {
      alert('Administrators cannot delete boilers. This is view-only mode.');
      return;
    }

    try {
      await gasBoilerService.deleteGasBoiler(boilerId, token);
      await loadBuildings();
    } catch (err) {
      console.error('Error deleting boiler:', err);
      throw err;
    }
  };

  return (
    <div className="map-container">
      {isAdmin && (
        <div className="admin-mode-banner">
          👔 Administrator Mode - View Only (you cannot create, edit, or delete)
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
      >
        {/* Hover Tooltip - Shows on mouse over */}
        <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
          <div className="marker-tooltip">
            <div className="tooltip-title">🏢 {building.name}</div>
            <div className="tooltip-info">
              🔥 {building.boilerCount} boilers • ⚡ {building.totalMaxPower.toFixed(0)} kW
            </div>
          </div>
        </Tooltip>

        {/* Click Popup - Shows on click */}
        <Popup>
          <div className="building-popup">
            <h3 className="building-popup-title">🏢 {building.name}</h3>

            <p className="building-popup-info">
              <strong>Number of boilers:</strong> {building.boilerCount}
            </p>
            <p className="building-popup-info">
              <strong>Total power:</strong> {building.totalMaxPower.toFixed(1)} kW
            </p>
            <p className="building-popup-info">
              <strong>Current:</strong> {building.totalCurrentPower.toFixed(1)} kW
            </p>
            <button
              onClick={() => handleBuildingClick(building.id)}
              className="building-popup-button"
            >
              View Details
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