import { useEffect, useState } from 'react';
import { getAllLaboratoriesDB, getAllUsersDB, createUserDB, updateUserDB } from '../../../services';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import MuiSelect from '../../mui/MuiSelect';
import MuiTable from '../../mui/MuiTable';
import EditButton from '../../mui/EditButton';
import CreateButton from '../../mui/CreateButton';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';

const AdminUserPage = () => {
  const [laboratories, setLaboratories] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  const userColumns = [
    { key: 'use_correo', label: 'Email' },
    { key: 'use_primer_nombre', label: 'Primer nombre' },
    { key: 'use_primer_apellido', label: 'Primer apellido' },
    { key: 'use_estado', label: 'Estado' },
    { key: 'accion', label: 'Acciones' },
  ];

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await getAllLaboratoriesDB();
        setLaboratories(res.data.data || []);
      } catch {
        setLaboratories([]);
      }
    };
    fetchLabs();
  }, []);

  // Función para refrescar la tabla de usuarios
  const refreshUsers = async () => {
    if (!selectedLab) {
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const res = await getAllUsersDB(selectedLab);
      const usersData = (res.data.data || []).map(user => ({
        ...user,
        accion: <EditButton onClick={() => handleEditUser(user)} />,
      }));
      setUsers(usersData);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    refreshUsers();    
  }, [selectedLab]);

  const handleCreateUser = async (userData) => {   
    
    try {
      const response = await createUserDB(userData);
      setOpenCreateModal(false);      
      await refreshUsers();
      return response;
    } catch (err) {
      throw err;
    } finally {
      console.log('User created successfully');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedUser(null);
  };

  const handleUserEdited = async (userData) => {
    try { 
      const response = await updateUserDB(selectedUser.use_id, userData);
      setOpenEditModal(false);
      setSelectedUser(null);
      await refreshUsers();
      return response;    
    } catch (err) {
      throw err;
    }
  };


  return (
    <LayoutDashboard>
      <CardWithTitle title="Gestión de Usuarios" loading={false}>
        <div className="flex flex-col max-w-5xl gap-2 mb-4">
          <div className="flex w-full gap-2 items-center">
            <div className="max-w-xs w-full">
              <MuiSelect
                label="Laboratorio"
                name="laboratory"
                value={selectedLab}
                onChange={e => setSelectedLab(e.target.value)}
              >
                <option value="">Seleccione un laboratorio</option>
                {laboratories.map(lab => (
                  <option key={lab.lab_id} value={lab.lab_id}>{lab.lab_name}</option>
                ))}
              </MuiSelect>
            </div>
            <div className="mt-4">
              <CreateButton title="Agregar usuario" onClick={() => setOpenCreateModal(true)} />
            </div>            
          </div>
        </div>
        <MuiTable columns={userColumns} data={users} loading={loadingUsers} />
        <CreateUserModal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          onUserCreated={handleCreateUser}
          laboratoryId={selectedLab}
        />
        <EditUserModal
          open={openEditModal}
          onClose={handleCloseEditModal}
          user={selectedUser}
          onUserEdited={handleUserEdited}
        />        
      </CardWithTitle>
    </LayoutDashboard>
  );
}

export default AdminUserPage;
