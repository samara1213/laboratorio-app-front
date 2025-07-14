import LayoutDashboard from './dashboard/LayoutDashboard';
import CardWithTitle from './CardWithTitle';
import MuiTable from './mui/MuiTable';
import { useEffect, useState } from 'react';
import { getOrdersByStatusDB, deleteOrderDB, getOrderByIdDB, changeStatusOrderDB, uploadFile } from '../services';
import { useAuthStore } from '../hooks/authStore';
import EditButton from './mui/EditButton';
import DeleteButton from './mui/MuiDeleteButton';
import ConfirmDialog from './mui/ConfirmDialog';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PreviewButton from './mui/PreviewButton';
import PreviewExamsModal from './dashboard/PreviewExamsModal';
import UploadButton from './mui/UploadButton';
import MuiFileUploadModal from './mui/MuiFileUploadModal';


const columns = [
  { key: 'ord_code', label: 'N° Orden' },
  { key: 'cus_document_number', label: 'Ducumento cliente' },
  { key: 'customer_name', label: 'Nombre del cliente' },
  { key: 'ord_created_at', label: 'Fecha orden' },
  { key: 'ord_status', label: 'Estado' },
  { key: 'actions', label: 'Acciones' },
];

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuthStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [orderToPreview, setOrderToPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [orderToUpload, setOrderToUpload] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!user?.laboratory?.lab_id) return;
    try {
      // Obtener órdenes PENDIENTE y PROCESANDO
      const [pendRes, procRes, adjRes] = await Promise.all([
        getOrdersByStatusDB({ lab_id: user.laboratory.lab_id, ord_status: 'PENDIENTE' }),
        getOrdersByStatusDB({ lab_id: user.laboratory.lab_id, ord_status: 'PROCESANDO' }),
        getOrdersByStatusDB({ lab_id: user.laboratory.lab_id, ord_status: 'ORDEN CON ADJUNTO' })
      ]);
      const pendData = pendRes.data.data || [];
      const procData = procRes.data.data || [];
      const adjData = adjRes.data.data || [];
      const allOrders = [...pendData, ...procData, ...adjData];
      const data = allOrders.map(order => ({
        ...order,
        cus_document_number: order.customer?.cus_document_number || '',
        customer_name: `${order.customer?.cus_first_name || ''} ${order.customer?.cus_first_lastname || ''}`,
        ord_status: (
          <span
            className={
              order.ord_status === 'PENDIENTE'
                ? 'px-3 py-1 rounded-full text-xs font-bold bg-orange-200 text-orange-900 border border-orange-400 shadow-sm'
                : order.ord_status === 'PROCESANDO'
                  ? 'px-3 py-1 rounded-full text-xs font-bold bg-purple-200 text-purple-900 border border-purple-400 shadow-sm'
                  : 'px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700 border border-gray-300'
            }
          >
            {order.ord_status}
          </span>
        ),
        actions: (
          <div className="flex gap-2">
            <EditButton onClick={() => navigate(`/results/${order.ord_id}`)} />
            <PreviewButton onClick={() => handlePreview(order)} />
            <UploadButton onClick={() => handleUploadClick(order)} />
            <DeleteButton onClick={() => handleDelete(order)} />
          </div>
        ),
      }));
      setOrders(data);
    } catch (error) {
      setOrders([]);
    }
  };

  const handleDelete = (order) => {
    setOrderToDelete(order);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      const response = await deleteOrderDB(orderToDelete.ord_id);
      setConfirmOpen(false);
      setOrderToDelete(null);
      await fetchOrders();
      toast.success(response?.data?.message || 'Orden eliminada correctamente');
    } catch (error) {      
      setConfirmOpen(false);
      setOrderToDelete(null);
      const msg = error?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al eliminar orden');
      toast.error(errorMsg);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setOrderToDelete(null);
  };

  // Handler para vista previa
  const handlePreview = async (order) => {
    setLoadingPreview(true);
    try {
      const response = await getOrderByIdDB(order.ord_id);
      const orderData = response.data.data;
      setOrderToPreview(orderData);
      setPreviewOpen(true);
    } catch (error) {
      toast.error('No se pudo obtener la información de la orden');
    } finally {
      setLoadingPreview(false);
    }
  };
  const handleClosePreview = async () => {
    setPreviewOpen(false);
    setOrderToPreview(null);
    await fetchOrders();
  };

  const handleUploadClick = (order) => {
    setOrderToUpload(order);
    setUploadOpen(true);
  };

  const handleFileUpload = async (file) => {
    try {
      const response = await uploadFile(file, orderToUpload?.ord_id);
      await changeStatusOrderDB({ ord_id: orderToUpload?.ord_id, ord_status: 'ORDEN CON ADJUNTO' });
      toast.success(response?.data?.message || 'Archivo cargado correctamente');
      await fetchOrders();
    } catch (error) {
      toast.error(response?.data?.message || 'Error al cargar el archivo');
    } finally {
      setUploadOpen(false);
      setOrderToUpload(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <LayoutDashboard>
      <CardWithTitle title="Órdenes pendientes">
        <MuiTable columns={columns} data={orders} />
        <MuiFileUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUpload={handleFileUpload}
          loading={false}
          title="Cargar archivo de orden"
        />
        <PreviewExamsModal open={previewOpen} onClose={handleClosePreview} order={orderToPreview} loading={loadingPreview} />
        <ConfirmDialog
          open={confirmOpen}
          title="Eliminar orden"
          message="¿Seguro que deseas eliminar esta orden? Esta acción no se puede deshacer."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </CardWithTitle>
    </LayoutDashboard>
  );
}

export default Dashboard;
