import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import MuiTable from '../../mui/MuiTable';
import CreateButton from '../../mui/CreateButton';
import EditButton from '../../mui/EditButton';
import { useState, useEffect } from 'react';
import { getAllMenusDB, createMenuDB, updateMenuDB } from '../../../services';
import CreateMenuModal from './CreateMenuModal';
import EditMenuModal from './EditMenuModal';

export default function MenusPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState(null);

  // fetchMenus como función normal
  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await getAllMenusDB();
      const data = (response.data.data || []).map(menu => ({
        ...menu,
        men_parent_name: menu.men_parent?.men_name || '',
        accion: <EditButton onClick={() => handleEdit(menu)} />,
      }));
      setMenus(data);
    } catch (e) {
      setMenus([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line
  }, []);

  const columns = [
    { key: 'men_name', label: 'Nombre menú' },
    { key: 'men_level', label: 'Nivel' },
    { key: 'men_url', label: 'Ruta' },
    { key: 'men_parent_name', label: 'Menú padre' },
    { key: 'accion', label: 'Acciones' },
  ];

  const handleEdit = (menu) => {
    setMenuToEdit(menu);
    setEditModalOpen(true);
  };

  const handleSaveCreate = async (newMenu) => {
    try {
      const response = await createMenuDB(newMenu);
      await fetchMenus();
      setCreateModalOpen(false);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Simulación de guardado de edición (reemplaza por tu servicio real)
  const handleSaveEdit = async (men_id, updatedMenu) => {
    // Llama al servicio real de actualización
    const response = await updateMenuDB(men_id, { ...updatedMenu});
    await fetchMenus();
    setEditModalOpen(false);
    return response;
  };

  return (
    <LayoutDashboard>
      <CardWithTitle title="Administración de Menús" loading={loading}>
        <div className="flex justify-end mb-4">
          <CreateButton onClick={() => setCreateModalOpen(true)} title="Nuevo menú" />
        </div>
        <MuiTable columns={columns} data={menus} />
        <CreateMenuModal
          open={createModalOpen}
          onSave={handleSaveCreate}
          onClose={() => setCreateModalOpen(false)}
        />
        <EditMenuModal
          open={editModalOpen}
          menu={menuToEdit}
          onSave={handleSaveEdit}
          onClose={() => setEditModalOpen(false)}
        />
      </CardWithTitle>
    </LayoutDashboard>
  );
}
