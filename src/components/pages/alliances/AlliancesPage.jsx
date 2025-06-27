import CardWithTitle from '../../CardWithTitle';
import MuiTable from '../../mui/MuiTable';
import CreateButton from '../../mui/CreateButton';
import EditButton from '../../mui/EditButton';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import { useState, useEffect } from 'react';
import { getAllAlliancesDB, createAllAlliancesDB, updateAllAlliancesDB } from '../../../services/alliancesService';
import { useAuthStore } from '../../../hooks/authStore';
import CreateAllianceModal from './CreateAllianceModal';
import EditAllianceModal from './EditAllianceModal';

export default function AlliancesPage() {
  const [alliances, setAlliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editAlliance, setEditAlliance] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { user } = useAuthStore();

  // Extraer fetchAlliances para poder reutilizarla
  const fetchAlliances = async () => {
    setLoading(true);
    try {
      const labId = user.laboratory.lab_id;
      if (!labId) throw new Error('No se tiene laboratorio logueado');
      const response = await getAllAlliancesDB(labId);
      const data = (response.data.data || []).map(alliace => ({
        ...alliace,
        accion: <EditButton onClick={() => handleEdit(alliace)} />,
      }));
      setAlliances(data);
    } catch (e) {
      setAlliances([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlliances();
  }, [user]);

  const columns = [
    { key: 'ali_nombre', label: 'Nombre del aliado' },
    { key: 'ali_direccion', label: 'Direccion' },
    { key: 'ali_telefono', label: 'Telefono' },
    { key: 'ali_nombre_contacto', label: 'Contacto'},
    { key: 'accion', label: 'Acciones' },
  ];

  const handleEdit = (alliance) => {
    setEditAlliance(alliance);
    setEditModalOpen(true);
  };

  const handleCreate = () => {
    setEditAlliance(null);
    setCreateModalOpen(true);
  };

  const handleSaveCreate = async (data) => {
    try {
      const response = await createAllAlliancesDB({ ...data, ali_laboratory_id: user.laboratory.lab_id });
      setCreateModalOpen(false);
      await fetchAlliances();
      return response;
    } catch (error) {              
        throw error;
    }
  };

  const handleSaveEdit = async (data) => {
    try {
      const response = await updateAllAlliancesDB(editAlliance.ali_id, data);
      setEditModalOpen(false);
      await fetchAlliances();
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <LayoutDashboard>
      <CardWithTitle title="Administrar Aliados" loading={loading}>
        <div className="flex justify-end mb-4">
          <CreateButton onClick={handleCreate} title="Nuevo aliado" />
        </div>
        <MuiTable columns={columns} data={alliances} />
        <CreateAllianceModal
          open={createModalOpen}
          onSave={handleSaveCreate}
          onClose={() => setCreateModalOpen(false)}
        />
        <EditAllianceModal
          open={editModalOpen}
          initialAlliance={editAlliance}
          onSave={handleSaveEdit}
          onClose={() => setEditModalOpen(false)}
        />   
      </CardWithTitle>
    </LayoutDashboard>
  );
}
