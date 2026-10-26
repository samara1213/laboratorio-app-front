// privateRoutes.jsx
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui/panel';

// cada pantalla se descarga solo cuando se visita (bundle inicial más liviano)
const Dashboard = lazy(() => import('../components/Dashboard'));
const AdminUserPage = lazy(() => import('../components/pages/users/AdminUserPage'));
const LaboratoriesPage = lazy(() => import('../components/pages/laboratories/LaboratoriesPage'));
const MenusPage = lazy(() => import('../components/pages/menus/MenusPage'));
const RolesPage = lazy(() => import('../components/pages/roles/RolesPage'));
const AlliancesPage = lazy(() => import('../components/pages/alliances/AlliancesPage'));
const ExamsPage = lazy(() => import('../components/pages/exams/ExamsPage'));
const ParamExamsPage = lazy(() => import('../components/pages/param_exams/ParamExamsPage'));
const CreateCustomerPage = lazy(() => import('../components/pages/customer/CreateCustomerPage'));
const EditCustomerPage = lazy(() => import('../components/pages/customer/EditCustomerPage'));
const CreateOrderPage = lazy(() => import('../components/pages/orders/CreateOrderPage'));
const ResultsPage = lazy(() => import('../components/pages/results/ResultsPage'));
const EditResultPage = lazy(() => import('../components/pages/results/EditResultPage'));
const SearchOrdersPage = lazy(() => import('../components/pages/orders/SearchOrdersPage'));

/**
 * Pantalla de espera mientras se descarga una página
 */
function PageFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ground">
      <Spinner label="Cargando…" />
    </div>
  );
}

export function PrivateRoute() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? (
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  ) : (
    <Navigate to="/" replace />
  );
}

const privateRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/users', element: <AdminUserPage /> },
  { path: '/laboratories', element: <LaboratoriesPage /> },
  { path: '/menus', element: <MenusPage /> },
  { path: '/roles', element: <RolesPage /> },
  { path: '/alliances', element: <AlliancesPage /> },
  { path: '/exams', element: <ExamsPage /> },
  { path: '/param-exams', element: <ParamExamsPage /> },
  { path: '/customers/create', element: <CreateCustomerPage /> },
  { path: '/customers/edit', element: <EditCustomerPage /> },
  { path: '/orders/create', element: <CreateOrderPage /> },
  { path: '/results/:orderId', element: <ResultsPage /> },
  { path: '/results/edit/:orderId', element: <EditResultPage /> },
  { path: '/orders/search', element: <SearchOrdersPage /> },
  { path: '*', element: <Dashboard /> },
  // Aquí puedes agregar más rutas privadas
];

export default privateRoutes;
