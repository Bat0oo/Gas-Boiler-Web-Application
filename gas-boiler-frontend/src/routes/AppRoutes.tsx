import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Map from '../pages/Map/Map';
import AdminMap from '../pages/Admin/AdminMap';
import Profile from '../pages/Profile/Profile';
import ProtectedRoute from '../components/ProtectedRoute';
import UsersPage from '../pages/Admin/UsersPage';
import SystemParametersPage from '../pages/Admin/SystemParametersPage';
import MyBoilersPage from '../pages/MyBoilers/MyBoilers';
import AllBuildingsPage from '../pages/Buildings/AllBuildingsPage';
import ViewSystemParametersPage from '../pages/ViewSystemParametersPage';
import DataManagementPage from '../pages/DataManagement/DataManagementPage';
import ChartsPage from '../pages/ChartsPage';
import AlarmsPage from '../pages/Alarms/AlarmsPage';
import AlarmSettingsPage from '../pages/Alarms/AlarmSettingsPage';
const AppRoutes: React.FC = () => {
  const { user,loading } = useAuth();

    if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {user.role === 'Admin' ? (
  <>
    <Route path="/admin/map" element={<ProtectedRoute adminOnly><AdminMap /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
    <Route path="/admin/system-parameters" element={<ProtectedRoute adminOnly><SystemParametersPage /></ProtectedRoute>} />
    <Route path="/buildings" element={<ProtectedRoute adminOnly><AllBuildingsPage /></ProtectedRoute>} />
    <Route path="/my-boilers" element={<ProtectedRoute adminOnly><MyBoilersPage /></ProtectedRoute>} />
    <Route path="/charts" element={<ProtectedRoute adminOnly><ChartsPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/profile/:id" element={ <ProtectedRoute adminOnly> <Profile /> </ProtectedRoute>}/>
    <Route path="/data-management" element={<ProtectedRoute adminOnly><DataManagementPage /></ProtectedRoute>} />
    <Route path="/alarms" element={<ProtectedRoute adminOnly><AlarmsPage /></ProtectedRoute>} />
    <Route path="/alarm-settings" element={<ProtectedRoute adminOnly><AlarmSettingsPage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/admin/map" replace />} />
  </>
      ) : (
        <>
          <Route path="/map" element={ <ProtectedRoute> <Map /> </ProtectedRoute>}/>
          <Route path="/profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> }/>
          <Route path="/my-boilers" element={<ProtectedRoute><MyBoilersPage /></ProtectedRoute>} />
          <Route path="/charts" element={<ProtectedRoute><ChartsPage /></ProtectedRoute>} />
          <Route path="/buildings" element={<ProtectedRoute><AllBuildingsPage /></ProtectedRoute>} />
          <Route path="/parameters" element={<ProtectedRoute><ViewSystemParametersPage /></ProtectedRoute>} />
          <Route path="/alarms" element={<ProtectedRoute><AlarmsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/map" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
