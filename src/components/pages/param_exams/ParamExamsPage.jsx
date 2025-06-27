import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import MuiTable from '../../mui/MuiTable';
import CreateButton from '../../mui/CreateButton';
import EditButton from '../../mui/EditButton';
import MuiSelect from '../../mui/MuiSelect';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../hooks/authStore';
import { getAllExamsDB } from '../../../services/examsService';
import { getAllParamExamsDB } from '../../../services/paramExamsService';
import CreateParamExamModal from './CreateParamExamModal';

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
        setLoading(true);
        (async () => {
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
        })();
    }, [selectedExam]);

    const handleEdit = (param) => {
        setParamToEdit(param);
        setEditModalOpen(true);
    };

    // Lógica para crear un parámetro de examen
    const handleCreateParamExam = async (data) => {
        // await createParamExamDB(data);
        // setModalOpen(false);
        // // Refresca la tabla después de crear
        // if (selectedExam) {
        //     setLoading(true);
        //     const response = await getAllParamExamsDB(selectedExam);
        //     const paramsData = (response.data.data || []).map(param => ({
        //         ...param,
        //         accion: (
        //             <EditButton onClick={() => handleEdit(param)} />
        //         )
        //     }));
        //     setParams(paramsData);
        //     setLoading(false);
        // }
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
                    <CreateButton title="Crear parámetro" onClick={() => setModalOpen(true)} />
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
                {/* Aquí irían los modales de editar */}
            </CardWithTitle>
        </LayoutDashboard>
    );
}
