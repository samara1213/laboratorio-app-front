import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getResultsByOrderIdDB } from '../../../services';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import { Icon } from '@iconify/react';
import MuiTable from '../../mui/MuiTable';
import EditButton from '../../mui/EditButton';
import EditExamParamsModal from './EditExamParamsModal';


export default function EditResultPage() {
  const { orderId } = useParams();
  const [resultados, setResultados] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examsTableData, setExamsTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const examColumns = [
    { key: 'exa_name', label: 'Nombre del examen' },
    { key: 'exa_description', label: 'Descripción' },
    { key: 'accion', label: 'Acciones' },
  ];

  // Unificar la lógica de obtención de resultados
  const fetchResultados = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getResultsByOrderIdDB(orderId);
      setResultados(res.data.data);
      const exams = res.data.data?.exams || [];
      setExamsTableData(exams.map(exam => ({
        ...exam,
        accion: <EditButton onClick={() => handleEditExam(exam)} />,
      })));
      setCliente(res.data.data?.customer || null);
    } catch (err) {
      setError('No se pudieron cargar los resultados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultados();
  }, [orderId]);

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setModalOpen(true);
  };

  return (
    <LayoutDashboard>
      <CardWithTitle title={`Editar Resultados`}>
        {cliente && (
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm flex flex-col md:flex-row md:items-center md:gap-8">
            <div className="flex-1">
              <div className="font-bold text-lg text-blue-900 mb-2 flex items-center gap-2">
                <Icon icon="mdi:account-circle" className="text-blue-500" width={22} height={22} />
                Datos del Cliente
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-blue-900">
                <div><span className="font-semibold">Nombre:</span> {cliente.cus_first_name} {cliente.cus_second_name} {cliente.cus_first_lastname} {cliente.cus_second_lastname}</div>
                <div><span className="font-semibold">Documento:</span> {cliente.cus_document_number}</div>
                <div><span className="font-semibold">Correo:</span> {cliente.cus_email}</div>
                <div><span className="font-semibold">Teléfono:</span> {cliente.cus_phone}</div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex-shrink-0 flex items-center justify-center">
              <div className="rounded-full bg-blue-200 h-16 w-16 flex items-center justify-center text-2xl font-bold text-blue-700 shadow-inner">
                <span>{cliente.cus_first_name?.charAt(0)}{cliente.cus_second_name?.charAt(0)}</span>
              </div>
            </div>
          </div>
        )}
        {loading && <div className="text-gray-500">Cargando resultados...</div>}        
        {!loading && !error && resultados && resultados.exams && resultados.exams.length > 0 && (
          <div className="mt-6">
            <div className="font-semibold text-blue-800 mb-2 text-base">Exámenes de la Orden</div>
            <MuiTable
              columns={examColumns}
              data={examsTableData}
            />
          </div>
        )}
        {!loading && !error && resultados && (!resultados.exams || resultados.exams.length === 0) && (
          <div className="text-gray-500 mt-4">No hay exámenes para esta orden.</div>
        )}
      </CardWithTitle>
      <EditExamParamsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        exam={selectedExam}
        orderId={orderId}
        onRefresh={fetchResultados}
      />
    </LayoutDashboard>
  );
}
