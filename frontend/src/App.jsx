import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { homePathFor } from './utils/roles';
import Layout from './components/Layout';
import RequireRole from './components/RequireRole';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import DonorHome from './pages/donor/DonorHome';

import BrowseDonationsPage from './pages/recipient/BrowseDonationsPage';
import MyReservationsPage from './pages/recipient/MyReservationsPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import IncidentsPage from './pages/admin/IncidentsPage';
import RecipientApprovalsPage from './pages/admin/RecipientApprovalsPage';
import IncidentReportPage from './pages/admin/IncidentReportPage';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireRole roles={['DONOR']} />}>
        <Route element={<Layout />}>
          <Route path="/donor" element={<DonorHome />} />
        </Route>
      </Route>

      <Route element={<RequireRole roles={['RECIPIENT_ORG']} />}>
        <Route element={<Layout />}>
          <Route path="/recipient" element={<BrowseDonationsPage />} />
          <Route path="/recipient/reservations" element={<MyReservationsPage />} />
        </Route>
      </Route>

      <Route element={<RequireRole roles={['ADMIN']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/incidents" element={<IncidentsPage />} />
          <Route path="/admin/recipients" element={<RecipientApprovalsPage />} />
          <Route path="/admin/report" element={<IncidentReportPage />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
