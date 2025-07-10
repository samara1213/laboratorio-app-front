// publicRoutes.jsx
import Login from '../components/Login';
import ForgotPassword from '../components/ForgotPassword';
import ChangePassword from '../components/ChangePassword';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export function PublicRoute() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return !isAuthenticated ? (
    <div className="public-layout">
      <Outlet />
    </div>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

const publicRoutes = [
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/change-password/:email',
    element: <ChangePassword />,
  },
  {
    path: '*',
    element: <Login />,
  },
];

export default publicRoutes;
