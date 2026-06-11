import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PagosPage from './pages/pagos/PagosPage';
import ContratoPage from './pages/contrato/ContratoPage';

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(220,95,30,0.2)', borderTopColor: '#DC5F1E', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={session ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/pagos" element={session ? <PagosPage /> : <Navigate to="/login" replace />} />
      <Route path="/contrato" element={session ? <ContratoPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
