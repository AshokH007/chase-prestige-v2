import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import LoadingScreen from './components/LoadingScreen';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'));
const Cards = lazy(() => import('./pages/Cards'));
const Bills = lazy(() => import('./pages/Bills'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Loans = lazy(() => import('./pages/Loans'));
const Trading = lazy(() => import('./pages/Trading'));
const CryptoVault = lazy(() => import('./pages/CryptoVault'));
const AIConcierge = lazy(() => import('./pages/AIConcierge'));
const StaffAI = lazy(() => import('./pages/StaffAI'));
const Settings = lazy(() => import('./pages/Settings'));

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'STAFF') return <WorkerDashboard />;
  return <Dashboard />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                {/* Default Redirect */}
                <Route path="/" element={<DashboardRedirect />} />
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* Staff Specific Routes */}
                <Route path="/staff/oracle" element={<StaffAI />} />
                <Route path="/staff/dashboard" element={<WorkerDashboard initialView="metrics" />} />
                <Route path="/staff/directory" element={<WorkerDashboard initialView="users" />} />
                <Route path="/staff/compliance" element={<WorkerDashboard initialView="compliance" />} />
                <Route path="/staff/logs" element={<WorkerDashboard initialView="logs" />} />
                <Route path="/staff/credit" element={<WorkerDashboard initialView="credit" />} />

                {/* Client Specific Routes */}
                <Route path="/transactions" element={<Dashboard initialView="transactions" />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/investments" element={<Trading />} />
                <Route path="/crypto" element={<CryptoVault />} />
                <Route path="/concierge" element={<AIConcierge />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
