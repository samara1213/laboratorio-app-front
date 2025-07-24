import CardWithTitle from '../../CardWithTitle';
import MuiTable from '../../mui/MuiTable';
import CreateButton from '../../mui/CreateButton';
import EditButton from '../../mui/EditButton';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import { useState, useEffect } from 'react';
import { getAllExamsDB, getAllAlliancesDB, createExamDB, updateExamDB } from '../../../services';
import { useAuthStore } from '../../../hooks/authStore';
import CreateExamsModal from './CreateExamsModal';
import EditExamsModal from './EditExamsModal';

export default function ExamsPage() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);
  const [alliances, setAlliances] = useState([]);

  // Permite refrescar la tabla desde cualquier función
  const fetchExams = async () => {
    setLoading(true);
    try {
      const lab_id = user.laboratory.lab_id;
      const response = await getAllExamsDB(lab_id);
      const classificationNames = {
        '1': 'Imagen hemograma',
        '2': 'Hematología',
        '3': 'Química',
        '4': 'Inmunología',
        '5': 'Microscopía',
        '6': 'Macroscopia',
        '7': 'Microbiología',
        '8': 'Hormonas',
      };
      const data = (response.data.data || []).map((exam) => ({
        ...exam,
        exa_classification: classificationNames[String(exam.exa_classification)] || '',
        aliado: exam.alliance ? exam.alliance.ali_nombre : '',
        accion: <EditButton onClick={() => handleEdit(exam)} />,
      }));   
      setExams(data);
    } catch (error) {
      setExams([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchExams();
  }, [user]);

  useEffect(() => {
    const fetchAlliances = async () => {
      try {
        const response = await getAllAlliancesDB(user.laboratory.lab_id);     
        setAlliances(response.data.data || []);
      } catch (e) {
        setAlliances([]);
      }
    };
    if (user) fetchAlliances();
  }, [user]);

  const columns = [
    { key: 'exa_name', label: 'Nombre del examen' },
    { key: 'exa_description', label: 'Descripcion' },
    { key: 'exa_classification', label: 'Grupo' },
    { key: 'exa_price', label: 'Precio' },
    { key: 'aliado', label: 'Aliado' },
    { key: 'accion', label: 'Acciones' },
  ];

  // Elimina referencias a editExam, setForm, form, formError y handleFormChange
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleEdit = (exam) => {
    setExamToEdit(exam);
    setEditModalOpen(true);
  };

  const handleCreate = () => {
    handleOpenModal();
  };

  const handleCreateExam = async (data) => {
    try {
      const lab_id = user.laboratory.lab_id;
      const payload = {
        ...data,
        laboratory: lab_id,
        exa_price: Number(data.exa_price),
        alliance: data.alliance || null
      };
      const response = await createExamDB(payload);
      setModalOpen(false);
      await fetchExams(); // Refresca la tabla después de crear
      return response;
    } catch (error) {      
        throw error;
    }
  };

  const handleUpdateExam = async (data) => {
    try {
      
        const lab_id = user.laboratory.lab_id;
      const response = await updateExamDB(examToEdit.exa_id, {
        ...data,
        laboratory: lab_id,
        exa_price: Number(data.exa_price),
        alliance: data.alliance || null
      });
      setEditModalOpen(false);
      setExamToEdit(null);
      await fetchExams();
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <LayoutDashboard>
      <CardWithTitle title="Administrar Exámenes" loading={loading}>
        <div className="flex justify-end mb-4">
          <CreateButton onClick={handleCreate} title="Nuevo examen" />
        </div>
        <MuiTable columns={columns} data={exams} />
        <CreateExamsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateExam}
          alliances={alliances}
          defaultValues={{ exa_name: '', exa_description: '', exa_price: '', alliance: '' }}
        />
        <EditExamsModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setExamToEdit(null); }}
          onSubmit={handleUpdateExam}
          alliances={alliances}
          defaultValues={examToEdit}
        />
      </CardWithTitle>
    </LayoutDashboard>
  );
}
