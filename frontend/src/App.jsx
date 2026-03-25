import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout      from './components/layout/Layout';
import Dashboard   from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets     from './pages/Budgets';
import Savings     from './pages/Savings';
import Reports     from './pages/Reports';
import Settings    from './pages/Settings';
import Login       from './pages/Login';
import Register    from './pages/Register';

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = useAuthStore(s => s.token);
  return !token ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, [token]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Private */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index                  element={<Dashboard />} />
        <Route path="transactions"    element={<Transactions />} />
        <Route path="budgets"         element={<Budgets />} />
        <Route path="savings"         element={<Savings />} />
        <Route path="reports"         element={<Reports />} />
        <Route path="settings"        element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}