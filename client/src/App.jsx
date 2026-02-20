import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import Cards from './pages/Cards';
import Bills from './pages/Bills';
import Analytics from './pages/Analytics';
import Loans from './pages/Loans';
import Trading from './pages/Trading';
import CryptoVault from './pages/CryptoVault';
import AIConcierge from './pages/AIConcierge';
import StaffAI from './pages/StaffAI';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
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
              {/* Add more as implemented */}
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
