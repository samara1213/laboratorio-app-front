// privateRoutes.jsx
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/panel';
import { useSession } from '../hooks/queries/useSession';
import { canAny, firstMenuUrl } from '../lib/permissions';
import NoAccess from '../components/dashboard/NoAccess';

// cada pantalla se descarga solo cuando se visita (bundle inicial más liviano)
const Dashboard = lazy(() => import('../components/Dashboard'));
const UsersPage = lazy(() => import('../components/pages/users/UsersPage'));
const LaboratoriesPage = lazy(() => import('../components/pages/laboratories/LaboratoriesPage'));
const MenusPage = lazy(() => import('../components/pages/menus/MenusPage'));
const RolesPage = lazy(() => import('../components/pages/roles/RolesPage'));
const AlliancesPage = lazy(() => import('../components/pages/alliances/AlliancesPage'));
const ExamsPage = lazy(() => import('../components/pages/exams/ExamsPage'));
const ParamExamsPage = lazy(() => import('../components/pages/param_exams/ParamExamsPage'));
const CreateCustomerPage = lazy(() => import('../components/pages/customer/CreateCustomerPage'));
const EditCustomerPage = lazy(() => import('../components/pages/customer/EditCustomerPage'));
const CreateOrderPage = lazy(() => import('../components/pages/orders/CreateOrderPage'));
const ResultsCapturePage = lazy(() => import('../components/pages/results/ResultsCapturePage'));
const ProfilePage = lazy(() => import('../components/profile/ProfilePage'));
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
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const session = useSession(isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  // sesión guardada antes de la Fase 3 (sin permisos): se espera a /auth/me
  if (!user?.permissions && session.isPending) return <PageFallback />;

  return (
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  );
}

/**
 * Muestra la pantalla solo si el rol tiene alguno de los permisos. En el inicio,
 * quien no puede ver órdenes pasa a la primera opción de su menú
 */
function Protected({ permissions, children }) {
  const user = useSelector(state => state.auth.user);
  const { pathname } = useLocation();

  if (canAny(user, permissions)) return children;

  const fallback = firstMenuUrl(user?.role?.menus);
  if (pathname === '/dashboard' && fallback && fallback !== '/dashboard') return <Navigate to={fallback} replace />;
  return <NoAccess />;
}

const guard = (element, ...permissions) => <Protected permissions={permissions}>{element}</Protected>;

// cada ruta exige alguno de los permisos indicados ("modulo:accion"); el backend los vuelve a validar
const privateRoutes = [
  { path: '/dashboard', element: guard(<Dashboard />, 'orders:view') },
  { path: '/users', element: guard(<UsersPage />, 'users:view') },
  { path: '/laboratories', element: guard(<LaboratoriesPage />, 'laboratories:view') },
  { path: '/menus', element: guard(<MenusPage />, 'menus:view') },
  { path: '/roles', element: guard(<RolesPage />, 'roles:view') },
  { path: '/alliances', element: guard(<AlliancesPage />, 'alliances:view') },
  { path: '/exams', element: guard(<ExamsPage />, 'exams:view') },
  { path: '/param-exams', element: guard(<ParamExamsPage />, 'exams:view') },
  { path: '/customers/create', element: guard(<CreateCustomerPage />, 'customers:create') },
  { path: '/customers/edit', element: guard(<EditCustomerPage />, 'customers:update') },
  { path: '/orders/create', element: guard(<CreateOrderPage />, 'orders:create') },
  // registrar y corregir usan la misma pantalla (guardado en lote)
  { path: '/results/:orderId', element: guard(<ResultsCapturePage />, 'results:create', 'results:update') },
  { path: '/results/edit/:orderId', element: guard(<ResultsCapturePage />, 'results:create', 'results:update') },
  { path: '/orders/search', element: guard(<SearchOrdersPage />, 'orders:view') },
  // cada usuario ve su perfil y su firma (solo exige sesión)
  { path: '/profile', element: <ProfilePage /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export default privateRoutes;
