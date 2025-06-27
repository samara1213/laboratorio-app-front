// LaboratoriesPage.jsx
import { useEffect, useState } from 'react';
import { getAllLaboratoriesDB, updateLaboratoryDB, createLaboratoryDB } from '../../../services';
import MuiTable from '../../mui/MuiTable';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import EditButton from '../../mui/EditButton';
import CreateButton from '../../mui/CreateButton';
import EditLaboratoryModal from './EditLaboratoryModal';
import CreateLaboratoryModal from './CreateLaboratoryModal';

export default function LaboratoriesPage() {
  const [laboratorios, setLaboratorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [labToEdit, setLabToEdit] = useState(null);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const response = await getAllLaboratoriesDB();
      const labsWithActions = response.data.data.map(lab => ({
        ...lab,
        accion: (
          <EditButton onClick={() => handleEdit(lab)} />
        )
      }));
      setLaboratorios(labsWithActions);
    } catch (e) {
      setLaboratorios([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const columns = [
    { key: 'lab_name', label: 'Nombre laboratorio' },
    { key: 'lab_nit', label: 'Identificacion' },
    { key: 'lab_phone', label: 'Teléfono' },
    { key: 'lab_status', label: 'Estado' },
    { key: 'accion', label: 'Acciones' },
  ];

  const handleEdit = (lab) => {
    setLabToEdit(lab);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (lab_id, updatedLab) => {
    try {
      // Llama al servicio de actualización y retorna la respuesta al modal
      const response = await updateLaboratoryDB(lab_id, updatedLab);
      await fetchLabs();
      setEditModalOpen(false);
      return response; 
    } catch (error) {
      throw error;
    }
  };

  const handleSaveCreate = async (newLab) => {
    try {
      const response = await createLaboratoryDB(newLab);
      await fetchLabs();
      setCreateModalOpen(false);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <LayoutDashboard>
     <CardWithTitle title="Administrar Laboratorios" loading={loading} loadingText="Cargando laboratorios...">
        <div className="flex justify-end mb-4">
          <CreateButton onClick={() => setCreateModalOpen(true)} title="Nuevo laboratorio" />
        </div>
        <MuiTable columns={columns} data={laboratorios} />
        <EditLaboratoryModal
          open={editModalOpen}
          lab={labToEdit}
          onSave={handleSaveEdit}
          onClose={() => setEditModalOpen(false)}
        />
        <CreateLaboratoryModal
          open={createModalOpen}
          onSave={handleSaveCreate}
          onClose={() => setCreateModalOpen(false)}
        />
      </CardWithTitle>
    </LayoutDashboard>
  );
}
