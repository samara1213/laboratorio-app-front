import { useState, useEffect } from 'react';
import CardWithTitle from '../../CardWithTitle';
import MuiTable from '../../mui/MuiTable';
import CreateButton from '../../mui/CreateButton';
import EditButton from '../../mui/EditButton';
import { toast } from 'react-toastify';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import { getAllRolesDB, createRoleDB, updateRoleDB } from '../../../services/roleService';
import CreateRoleModal from './CreateRoleModal';
import EditRoleModal from './EditRoleModal';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRole, setEditRole] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await getAllRolesDB();
      const data = (response.data.data || []).map(role => ({
        ...role,
        accion: <EditButton onClick={() => handleEdit(role)} />,
      }));
      setRoles(data);
    } catch {
      setRoles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const columns = [
    { key: 'rol_nombre', label: 'Nombre del rol' },
    { key: 'accion', label: 'Acciones' },
  ];

  const handleEdit = (role) => {
    setEditRole(role);
    setEditModalOpen(true);
  };

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleSaveCreate = async (data) => {
    try {
      const response = await createRoleDB(data);
      setCreateModalOpen(false);
      await fetchRoles();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleSaveEdit = async (data) => {
    try {
      const response = await updateRoleDB(editRole.rol_id, data);
      setEditModalOpen(false);
      await fetchRoles();
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <LayoutDashboard>
      <CardWithTitle title="Administración de Roles" loading={loading}>
        <div className="flex justify-end mb-4">
          <CreateButton onClick={handleCreate} title="Nuevo rol" />
        </div>
        <MuiTable columns={columns} data={roles} />
        <CreateRoleModal
          open={createModalOpen}
          onSave={handleSaveCreate}
          onClose={() => setCreateModalOpen(false)}
        />
        <EditRoleModal
          open={editModalOpen}
          initialRole={editRole}
          onSave={handleSaveEdit}
          onClose={() => setEditModalOpen(false)}
        />
      </CardWithTitle>
    </LayoutDashboard>
  );
}
