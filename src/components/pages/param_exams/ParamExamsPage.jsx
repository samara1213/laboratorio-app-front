import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import MuiTable from '../../mui/MuiTable';
import CreateButton from '../../mui/CreateButton';
import EditButton from '../../mui/EditButton';
import MuiSelect from '../../mui/MuiSelect';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../hooks/authStore';
import { getAllExamsDB } from '../../../services/examsService';
import { getAllParamExamsDB, createParamExamDB, updateParamExamDB } from '../../../services/paramExamsService';
import CreateParamExamModal from './CreateParamExamModal';
import EditParamExamModal from './EditParamExamModal';

export default function ParamExamsPage() {
    const { user } = useAuthStore();
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [params, setParams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [paramToEdit, setParamToEdit] = useState(null);

    // Obtener exámenes
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const response = await getAllExamsDB(user.laboratory.lab_id);
                setExams(response.data.data || []);
            } catch {
                setExams([]);
            }
        })();
    }, [user]);

    // Obtener parámetros del examen seleccionado
    useEffect(() => {
        if (!selectedExam) {
            setParams([]);
            setLoading(false);
            return;
        }
        refreshParams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExam]);

    const handleEdit = (param) => {
        setParamToEdit(param);
        setEditModalOpen(true);
    };

    // Función para refrescar la lista de parámetros
    const refreshParams = async () => {
        if (!selectedExam) return;
        setLoading(true);
        try {
            const response = await getAllParamExamsDB(selectedExam);
            const paramsData = (response.data.data || []).map(param => ({
                ...param,
                accion: (
                    <EditButton onClick={() => handleEdit(param)} />
                )
            }));
            setParams(paramsData);
        } catch {
            setParams([]);
        } finally {
            setLoading(false);
        }
    };

    // Lógica para crear un parámetro de examen
    const handleCreateParamExam = async (data) => {
        try {
            setLoading(true);
            const responde = await createParamExamDB(data);
            await refreshParams();
            setModalOpen(false);
            return responde; 
        } catch (error) {
            
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Lógica para editar un parámetro de examen
    const handleEditParamExam = async (data) => {
        try {
            setLoading(true);
            const response = await updateParamExamDB(paramToEdit.par_id, data);
            await refreshParams();
            setEditModalOpen(false);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'par_name', label: 'Nombre del parámetro' },
        { key: 'par_default_value', label: 'Valor por defecto' },
        { key: 'par_state', label: 'Estado' },
        { key: 'accion', label: 'Acciones' },
    ];

    return (
        <LayoutDashboard>
            <CardWithTitle title="Administrar parámetros de exámenes" loading={loading}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 px-2 sm:px-0">
                    <MuiSelect
                        label="Filtrar por examen"
                        name="examSelect"
                        value={selectedExam}
                        onChange={e => setSelectedExam(e.target.value)}
                        className="max-w-xs w-full sm:w-80 lg:w-[420px]"
                    >
                        <option value="">Selecciona un examen</option>
                        {exams.map(exam => (
                            <option key={exam.exa_id} value={exam.exa_id}>{exam.exa_name}</option>
                        ))}
                    </MuiSelect>
                    <CreateButton title="Crear parámetro" onClick={() => setModalOpen(true)} disabled={!selectedExam} />
                </div>
                <div className="pb-4">
                    <MuiTable columns={columns} data={params} />
                </div>
                <CreateParamExamModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreateParamExam}
                    loading={loading}
                    examId={selectedExam}
                />
                <EditParamExamModal
                    open={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSubmit={handleEditParamExam}
                    loading={loading}
                    param={paramToEdit}
                    examId={selectedExam}
                />
            </CardWithTitle>
        </LayoutDashboard>
    );
}
