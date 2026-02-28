import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../stores/useAdminAuth';

export default function AdminRoute() {
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return <Outlet />;
}
