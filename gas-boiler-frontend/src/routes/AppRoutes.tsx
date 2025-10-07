import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard/Dashboard';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import Profile from '../pages/Profile/Profile';
import ProtectedRoute from '../components/ProtectedRoute';
import UsersPage from '../pages/Admin/UsersPage';
import SystemParametersPage from '../pages/Admin/SystemParametersPage';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {user.role === 'Admin' ? (
  <>
    <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
    <Route path="/admin/system-parameters" element={<ProtectedRoute adminOnly><SystemParametersPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/profile/:id" element={ <ProtectedRoute adminOnly> <Profile /> </ProtectedRoute>}/>
  </>
      ) : (
        <>
          <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute>}/>
          <Route path="/profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> }/>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
