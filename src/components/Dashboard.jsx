// Dashboard.jsx
import { Icon } from '@iconify/react';
import LayoutDashboard from './dashboard/LayoutDashboard';
import UsersTable from './dashboard/UsersTable';

function Dashboard() {
  return (
    <LayoutDashboard>
      <UsersTable />
    </LayoutDashboard>
  );
}

export default Dashboard;
