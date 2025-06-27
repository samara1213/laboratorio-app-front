// UsersTable.jsx
import MuiTable from '../mui/MuiTable';
import { Icon } from '@iconify/react';

const users = [
  { name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
  { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Editor' },
];

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'actions', label: 'Actions' },
];

const data = users.map(user => ({
  ...user,
  actions: (
    <div className="flex gap-2">
      <button className="bg-[#29313B] hover:bg-[#1e232a] text-white p-2 rounded-lg">
        <Icon icon="mdi:pencil" className="w-4 h-4" />
      </button>
      <button className="bg-[#29313B] hover:bg-[#1e232a] text-white p-2 rounded-lg">
        <Icon icon="mdi:delete" className="w-4 h-4" />
      </button>
    </div>
  ),
}));

export default function UsersTable() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-[#29313B]">Table</h2>
      <MuiTable columns={columns} data={data} />
    </div>
  );
}
