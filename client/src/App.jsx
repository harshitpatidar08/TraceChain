import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Scanner from './pages/Scanner';
import Trace from './pages/Trace';

// Dashboard Pages (Farmer)
import MyProducts from './pages/dashboard/farmer/MyProducts';
import RegisterProduct from './pages/dashboard/farmer/RegisterProduct';

// Dashboard Pages (Shared Stakeholders)
import ScanAndLog from './pages/dashboard/ScanAndLog';
import MyEvents from './pages/dashboard/MyEvents';
import SearchProduct from './pages/dashboard/SearchProduct';
import Profile from './pages/dashboard/Profile';
import ProductDetail from './pages/dashboard/ProductDetail';

// Dashboard Pages (Admin)
import Overview from './pages/dashboard/admin/Overview';
import AlertsCenter from './pages/dashboard/admin/AlertsCenter';
import AllProducts from './pages/dashboard/admin/AllProducts';
import AllEvents from './pages/dashboard/admin/AllEvents';

const RoleRedirect = () => {
  const { role } = useAuth();
  if (role === 'farmer') return <Navigate to="/dashboard/farmer/products" replace />;
  if (role === 'admin') return <Navigate to="/dashboard/admin/overview" replace />;
  if (['processor', 'distributor', 'retailer'].includes(role)) return <Navigate to="/dashboard/scan" replace />;
  return <Navigate to="/auth" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/trace/:traceId" element={<Trace />} />
          <Route path="/scanner" element={<Scanner />} />

          {/* Nested Dashboard Routes */}
          <Route path="/dashboard" element={<AppLayout />}>
            {/* Default redirect based on role */}
            <Route index element={<RoleRedirect />} />

            {/* Farmer */}
            <Route path="farmer/products" element={
              <ProtectedRoute allowedRoles={['farmer']}><MyProducts /></ProtectedRoute>
            } />
            <Route path="farmer/register" element={
              <ProtectedRoute allowedRoles={['farmer']}><RegisterProduct /></ProtectedRoute>
            } />

            {/* Shared stakeholder pages */}
            <Route path="scan" element={
              <ProtectedRoute allowedRoles={['processor', 'distributor', 'retailer']}><ScanAndLog /></ProtectedRoute>
            } />
            <Route path="events" element={
              <ProtectedRoute allowedRoles={['farmer', 'processor', 'distributor', 'retailer', 'admin']}><MyEvents /></ProtectedRoute>
            } />
            <Route path="search" element={
              <ProtectedRoute allowedRoles={['farmer', 'processor', 'distributor', 'retailer', 'admin']}><SearchProduct /></ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute allowedRoles={['farmer', 'processor', 'distributor', 'retailer', 'admin']}><Profile /></ProtectedRoute>
            } />
            <Route path="product/:traceId" element={
              <ProtectedRoute allowedRoles={['farmer', 'processor', 'distributor', 'retailer', 'admin']}><ProductDetail /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="admin/overview" element={
              <ProtectedRoute allowedRoles={['admin']}><Overview /></ProtectedRoute>
            } />
            <Route path="admin/alerts" element={
              <ProtectedRoute allowedRoles={['admin']}><AlertsCenter /></ProtectedRoute>
            } />
            <Route path="admin/products" element={
              <ProtectedRoute allowedRoles={['admin']}><AllProducts /></ProtectedRoute>
            } />
            <Route path="admin/events" element={
              <ProtectedRoute allowedRoles={['admin']}><AllEvents /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
