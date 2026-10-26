// publicRoutes.jsx
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Login from '../components/Login';
import { Spinner } from '@/components/ui/panel';

const ForgotPassword = lazy(() => import('../components/ForgotPassword'));
const ChangePassword = lazy(() => import('../components/ChangePassword'));

export function PublicRoute() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return !isAuthenticated ? (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-ground">
          <Spinner label="Cargando…" />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

const publicRoutes = [
  { path: '/', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/change-password/:email', element: <ChangePassword /> },
  { path: '*', element: <Login /> },
];

export default publicRoutes;
