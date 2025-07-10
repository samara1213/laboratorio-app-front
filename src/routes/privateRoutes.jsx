// privateRoutes.jsx
import Dashboard from '../components/Dashboard';
import LaboratoriesPage from '../components/pages/laboratories/LaboratoriesPage';
import MenusPage from '../components/pages/menus/MenusPage';
import RolesPage from '../components/pages/roles/RolesPage';
import AlliancesPage from '../components/pages/alliances/AlliancesPage';
import ExamsPage from '../components/pages/exams/ExamsPage';
import ParamExamsPage from '../components/pages/param_exams/ParamExamsPage';
import CreateCustomerPage from '../components/pages/customer/CreateCustomerPage';
import EditCustomerPage from '../components/pages/customer/EditCustomerPage';
import CreateOrderPage from '../components/pages/orders/CreateOrderPage';
import ResultsPage from '../components/pages/results/ResultsPage';
import EditResultPage from '../components/pages/results/EditResultPage';
import SearchOrdersPage from '../components/pages/orders/SearchOrdersPage';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import AdminUserPage from '../components/pages/users/AdminUserPage';

export function PrivateRoute() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

const privateRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/users',
    element: <AdminUserPage />,
  },
  {
    path: '/laboratories',
    element: <LaboratoriesPage />,
  },
  {
    path: '/menus',
    element: <MenusPage />,
  },
  {
    path: '/roles',
    element: <RolesPage />,
  },
  {
    path: '/alliances',
    element: <AlliancesPage />,
  },
  {
    path: '/exams',
    element: <ExamsPage />,
  },
  {
    path: '/param-exams',
    element: <ParamExamsPage />,
  },
  {
    path: '/customers/create',
    element: <CreateCustomerPage />,
  },
  {
    path: '/customers/edit',
    element: <EditCustomerPage />,
  },
  {
    path: '/orders/create',
    element: <CreateOrderPage />,
  },
  {
    path: '/results/:orderId',
    element: <ResultsPage />,
  },
  {
    path: '/results/edit/:orderId',
    element: <EditResultPage />,
  },
  {
    path: '/orders/search',
    element: <SearchOrdersPage />,
  },
  {
    path: '*',
    element: <Dashboard />,
  }
  // Aquí puedes agregar más rutas privadas
];

export default privateRoutes;
