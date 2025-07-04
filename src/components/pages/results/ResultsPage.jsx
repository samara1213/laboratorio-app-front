import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import { getOrderByIdDB } from '../../../services/orderService';
import MuiTable from '../../mui/MuiTable';
import EditButton from '../../mui/EditButton';
import ResultModal from './ResultModal';
import { createResultDB } from '../../../services/resultService';
import { changeStatusOrderDB } from '../../../services/orderService';
import { toast } from 'react-toastify';
import CreateButton from '../../mui/CreateButton';
import { useResultsActions } from '../../../hooks/resultsStore';

const examColumns = [
  { key: 'exa_name', label: 'Nombre del examen' },
  { key: 'exa_description', label: 'Descripcion' },
  { key: 'proceso', label: 'Proceso' },
  { key: 'accion', label: 'Acciones' },
];

export default function ResultsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { saveExamResults, clearAllExamResults } = useResultsActions();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const completedExams = useSelector(state => state.results.completedExams);
  const [modalOpen, setModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrderByIdDB(orderId);
        setOrder(response.data.data);
      } catch (err) {
        setError('No se pudo cargar la orden.');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  function getExamTableData(exams) {
    return (exams || []).map(exam => ({
      ...exam,
      order_id: orderId,
      proceso: isExamComplete(exam, completedExams)
        ? <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-300">Completado</span>
        : <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-300">Pendiente</span>,
      accion: (
        <EditButton onClick={() => handleEditExam(exam)} />
      ),
    }));
  }

  function handleEditExam(exam) {    
    setExamToEdit(exam);
    setModalOpen(true);
  }

  function handleCloseModal() {  
    setModalOpen(false);
    setExamToEdit(null);
  }

  function isExamComplete(exam, completedExams) {
    return (
      exam.parameters &&
      exam.parameters.length > 0 &&
      exam.parameters.every(param => {
        const found = completedExams.find(
          r => r.exa_id === exam.exa_id && r.par_id === param.par_id && r.resultado !== ''
        );
        return found && found.resultado !== undefined && found.resultado !== null && found.resultado !== '';
      })
    );
  }

  // Calcular exámenes completos (todos los parámetros con resultado, y al menos uno con valor distinto de vacío)
  const completedCount = order?.exams
    ? order.exams.filter(exam => isExamComplete(exam, completedExams)).length
    : 0;

  async function handleSaveResults() {
    if (!order) return;
    setSaving(true);
    const resultsToSend = completedExams.map(r => ({
      res_value: r.resultado,
      res_observation: r.observacion,
      order: order.ord_id,
      exam: r.exa_id,
      param: r.par_id
    }));
    try {
      for (const result of resultsToSend) {
        await createResultDB(result);     
      }
      clearAllExamResults(); // Limpiar completedExams correctamente
      toast.success('Resultados enviados correctamente');
      navigate('/dashboard');
    } catch (e) {
      // Cambiar estado de la orden a PENDIENTE si falla
      try {
        await changeStatusOrderDB({ ord_id: order.ord_id, ord_status: 'PENDIENTE' });
      } catch (err) {
        toast.error('error en actualizar orden');
      }
      toast.error('Error al enviar resultados. La orden fue marcada como PENDIENTE.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <LayoutDashboard>
      <CardWithTitle title="Gestión de Resultados de Laboratorio">
        <div className="mb-4 text-gray-700 font-semibold">
          Orden seleccionada: <span className="text-blue-700">{orderId}</span>
        </div>
        {loading && (
          <div className="text-gray-500">Cargando información de la orden...</div>
        )}
        {error && (
          <div className="text-red-500">{error}</div>
        )}
        {order && !loading && !error && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow p-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-200 text-blue-700 text-xl font-bold shadow-inner">
                  <span>{order.customer?.cus_first_name?.[0] || ''}{order.customer?.cus_first_lastname?.[0] || ''}</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-900 mb-1">
                    {order.customer?.cus_first_name} {order.customer?.cus_first_lastname}
                  </div>
                  <div className="text-sm text-blue-700 font-mono mb-1">
                    <b>Documento:</b> {order.customer?.cus_document_number}
                  </div>
                  <div className="text-xs text-blue-500 flex items-center gap-4">
                    <span><b>Fecha de orden:</b> {order.ord_created_at}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-200 text-orange-900 border border-orange-400 shadow-sm">
                      <b>Estado:</b> {order.ord_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Barra de progreso de resultados */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                Progreso de resultados
              </label>
              <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${order.exams && order.exams.length ? (completedCount / order.exams.length) * 100 : 0}%` }}
                ></div>
              </div>          
            </div>
            <MuiTable
              columns={examColumns}
              data={getExamTableData(order.exams)}
            />
            <ResultModal
              open={modalOpen}
              exam={examToEdit}
              onClose={handleCloseModal}
            />
            <CreateButton
              className="mt-6"
              onClick={handleSaveResults}
              title={saving ? "Guardando..." : "Guardar resultados"}
              disabled={saving || completedExams.length === 0}
            />
          </>
        )}      
      </CardWithTitle>
    </LayoutDashboard>
  );
}
