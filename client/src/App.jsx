import React from 'react';

import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import {
  Toaster
} from 'react-hot-toast';

import {
  AuthProvider,
  useAuth
} from './context/AuthContext';

import {
  NotificationProvider
} from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
/* Pages */
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Scanner from './pages/Scanner';
import Trace from './pages/Trace';
/* Farmer */
import MyProducts from './pages/dashboard/farmer/MyProducts';
import RegisterProduct from './pages/dashboard/farmer/RegisterProduct';
/* Shared Stakeholder Pages */
import ScanAndLog from './pages/dashboard/ScanAndLog';
import MyEvents from './pages/dashboard/MyEvents';
import SearchProduct from './pages/dashboard/SearchProduct';
import Profile from './pages/dashboard/Profile';
import ProductDetail from './pages/dashboard/ProductDetail';
/* Admin */
import Overview from './pages/dashboard/admin/Overview';
import AlertsCenter from './pages/dashboard/admin/AlertsCenter';
import AllProducts from './pages/dashboard/admin/AllProducts';
import AllEvents from './pages/dashboard/admin/AllEvents';

/* Role Redirect */

const RoleRedirect = () => {
  const { role } = useAuth();

  if (role === 'farmer') {
    return (
      <Navigate
        to="/dashboard/farmer/products"
        replace
      />
    );
  }

  if (role === 'admin') {
    return (
      <Navigate
        to="/dashboard/admin/overview"
        replace
      />
    );
  }

  if (
    [
      'processor',
      'distributor',
      'retailer'
    ].includes(role)
  ) {
    return (
      <Navigate
        to="/dashboard/scan"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/auth"
      replace
    />
  );
};

function App() {
  return (
    <AuthProvider>

      <NotificationProvider>

        {/* GLOBAL TOASTER */}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,

            style: {
              background: '#ffffff',
              color: '#0f172a',
              border:
                '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '16px',
              fontWeight: '600',
              boxShadow:
                '0 10px 30px rgba(15,23,42,0.08)'
            },

            success: {
              iconTheme: {
                primary: '#10b981',
                secondary:
                  '#ffffff'
              }
            },

            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary:
                  '#ffffff'
              }
            }
          }}
        />

        {/* APP WRAPPER */}

        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden relative">

          {/* GLOBAL BACKGROUND GLOW */}

          <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />

          <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />

          {/* ROUTES */}

          <Routes>

            {/* PUBLIC ROUTES */}

            <Route
              path="/"
              element={<Landing />}
            />

            <Route
              path="/auth"
              element={<Auth />}
            />

            <Route
              path="/trace/:traceId"
              element={<Trace />}
            />

            <Route
              path="/scanner"
              element={<Scanner />}
            />

            {/* DASHBOARD LAYOUT */}

            <Route
              path="/dashboard"
              element={<AppLayout />}
            >

              {/* DEFAULT ROLE REDIRECT */}

              <Route
                index
                element={<RoleRedirect />}
              />

              {/* FARMER */}

              <Route
                path="farmer/products"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'farmer'
                    ]}
                  >

                    <MyProducts />

                  </ProtectedRoute>
                }
              />

              <Route
                path="farmer/register"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'farmer'
                    ]}
                  >

                    <RegisterProduct />

                  </ProtectedRoute>
                }
              />

              {/* SHARED STAKEHOLDER PAGES */}

              <Route
                path="scan"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'processor',
                      'distributor',
                      'retailer'
                    ]}
                  >

                    <ScanAndLog />

                  </ProtectedRoute>
                }
              />

              <Route
                path="events"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'farmer',
                      'processor',
                      'distributor',
                      'retailer',
                      'admin'
                    ]}
                  >

                    <MyEvents />

                  </ProtectedRoute>
                }
              />

              <Route
                path="search"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'farmer',
                      'processor',
                      'distributor',
                      'retailer',
                      'admin'
                    ]}
                  >

                    <SearchProduct />

                  </ProtectedRoute>
                }
              />

              <Route
                path="profile"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'farmer',
                      'processor',
                      'distributor',
                      'retailer',
                      'admin'
                    ]}
                  >

                    <Profile />

                  </ProtectedRoute>
                }
              />

              <Route
                path="product/:traceId"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'farmer',
                      'processor',
                      'distributor',
                      'retailer',
                      'admin'
                    ]}
                  >

                    <ProductDetail />

                  </ProtectedRoute>
                }
              />

              {/* ADMIN */}

              <Route
                path="admin/overview"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'admin'
                    ]}
                  >

                    <Overview />

                  </ProtectedRoute>
                }
              />

              <Route
                path="admin/alerts"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'admin'
                    ]}
                  >

                    <AlertsCenter />

                  </ProtectedRoute>
                }
              />

              <Route
                path="admin/products"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'admin'
                    ]}
                  >

                    <AllProducts />

                  </ProtectedRoute>
                }
              />

              <Route
                path="admin/events"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'admin'
                    ]}
                  >

                    <AllEvents />

                  </ProtectedRoute>
                }
              />

            </Route>

          </Routes>

        </div>

      </NotificationProvider>

    </AuthProvider>
  );
}

export default App;