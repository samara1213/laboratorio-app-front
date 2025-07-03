// privateRoutes.jsx
import Dashboard from '../components/Dashboard';
import UsersPage from '../components/pages/users/usersPage';
import LaboratoriesPage from '../components/pages/laboratories/LaboratoriesPage';
import MenusPage from '../components/pages/menus/MenusPage';
import RolesPage from '../components/pages/roles/RolesPage';
import AlliancesPage from '../components/pages/alliances/AlliancesPage';
import ExamsPage from '../components/pages/exams/ExamsPage';
import ParamExamsPage from '../components/pages/param_exams/ParamExamsPage';
import CreateCustomerPage from '../components/pages/customer/CreateCustomerPage';
import EditCustomerPage from '../components/pages/customer/EditCustomerPage';
import CreateOrderPage from '../components/pages/orders/CreateOrderPage';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

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
    element: <UsersPage />,
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
    path: '*',
    element: <Dashboard />,
  }
  // Aquí puedes agregar más rutas privadas
];

export default privateRoutes;
