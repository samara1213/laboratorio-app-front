import { useState } from 'react';
import UploadButton from '../../mui/UploadButton';
import MuiFileUploadModal from '../../mui/MuiFileUploadModal';
import { uploadFile } from '../../../services/attached';
import CardWithTitle from '../../CardWithTitle';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import MuiTable from '../../mui/MuiTable';
import { getOrdersByCustomerIdDB, searchCustomerByDocumentDB, generatePdfOrderDB, sendResultsOrderDB, getUrlPrefirredOrderDB } from '../../../services';
import CreateButton from '../../mui/CreateButton';
import MuiInput from '../../mui/MuiInput';
import { useAuthStore } from '../../../hooks/authStore';
import EditButton from '../../mui/EditButton';
import PdfButton from '../../mui/PdfButton';
import MailButton from '../../mui/MailButton';
import PrintButton from '../../mui/PrintButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MuiModalLoader from '../../mui/MuiModalLoader';


export default function SearchOrdersPage() {

  const columns = [
        { key: 'ord_code', label: 'Numero de orden' },
        { key: 'ord_created_at', label: 'Fecha' },
        { key: 'ord_status', label: 'Estado' },
        { key: 'accion', label: 'Acciones' },
  ];
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState(null);
  const [printingOrderId, setPrintingOrderId] = useState(null);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [uploadingOrderId, setUploadingOrderId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Handler para subir archivo
  const handleUploadFile = async (file) => {
    if (!selectedOrderId) return;
    setUploadingOrderId(selectedOrderId);
    try {
      const response = await uploadFile(file, selectedOrderId);
      toast.success(response?.data?.message || 'Archivo cargado correctamente');
      setShowUploadModal(false);
      setSelectedOrderId(null);
      await handleSearch(); // Refresca la tabla
    } catch (error) {
      const msg = error?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error cargando archivo');
      toast.error(errorMsg);
    } finally {
      setUploadingOrderId(null);
    }
  };
  const handleSearch = async () => {
    setLoading(true);
    try {
      const customerRes = await searchCustomerByDocumentDB({ 
        laboratory: user?.laboratory?.lab_id,    
        cus_document_number: search });
      const customer = customerRes.data.data;
      if (!customer || !customer.cus_id) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const res = await getOrdersByCustomerIdDB({ 
        cus_id: customer.cus_id,
        lab_id: user?.laboratory?.lab_id,
      });
      const ordersRaw = res.data.data || [];
      const formattedOrders = ordersRaw.map(o => {
        const status = o.ord_status;
        return {
          ...o,
          ord_status: (
            status === 'PENDIENTE' ?
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-300">Pendiente</span> :
            status === 'PENDIENTE PDF' ?
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">Pendiente PDF</span> :
            status === 'CANCELADA' ?
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-300">Cancelada</span> :
            status === 'FINALIZADA' ?
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-300">Finalizada</span> :
            status === 'PROCESANDO' ?
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-300">Procesando</span> :
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold border border-gray-300">{status}</span>
          ),
          accion: (
            (() => {
              if (status === 'PENDIENTE' || status === 'PROCESANDO' || status === 'CANCELADA') return null;
              if (status === 'FINALIZADA') {
                return (
                  <div className="flex gap-1 items-center">
                    <EditButton onClick={() => handleEditResult(o.ord_id)} />
                    <UploadButton onClick={() => { setSelectedOrderId(o.ord_id); setShowUploadModal(true); }} />
                    <PdfButton onClick={() => handleGeneratePdf(o.ord_id)} disabled={generatingPdfId === o.ord_id} />
                    <MailButton onClick={() => handleSendEmail(o.ord_id)} />
                    <PrintButton onClick={() => handlePrintOrder(o.ord_id)} disabled={printingOrderId === o.ord_id} />
                    
                  </div>
                );
              }
              if (status === 'PENDIENTE PDF') {
                return (
                  <div className="flex gap-1 items-center">
                    <EditButton onClick={() => handleEditResult(o.ord_id)} />
                    <UploadButton onClick={() => { setSelectedOrderId(o.ord_id); setShowUploadModal(true); }} />
                    <PdfButton onClick={() => handleGeneratePdf(o.ord_id)} disabled={generatingPdfId === o.ord_id} />                    
                  </div>
                );
              }
              // Default: show all buttons
              return (
                <div className="flex gap-1 items-center">
                  <EditButton onClick={() => handleEditResult(o.ord_id)} />
                  <UploadButton onClick={() => { setSelectedOrderId(o.ord_id); setShowUploadModal(true); }} />
                  <PdfButton onClick={() => handleGeneratePdf(o.ord_id)} disabled={generatingPdfId === o.ord_id} />
                  <MailButton onClick={() => handleSendEmail(o.ord_id)} />
                  <PrintButton onClick={() => handlePrintOrder(o.ord_id)} disabled={printingOrderId === o.ord_id} />               
                </div>
              );
            })()
          ),
        };  
      });
      setOrders(formattedOrders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResult = (orderId) => {
    navigate(`/results/edit/${orderId}`);
  };

  // Función para generar el PDF de la orden
  const handleGeneratePdf = async (orderId) => {
    setGeneratingPdfId(orderId);
    try {
      const response = await generatePdfOrderDB(orderId);
      toast.success(response.data.message || 'PDF generado correctamente');
      await handleSearch(); // Refresca la tabla después de generar el PDF
    } catch (error) {
      const msg = error?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error buscando exámenes');
      toast.error(errorMsg);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  // Agregar función para enviar email
  const handleSendEmail = async (orderId) => {
    setSendingEmailId(orderId);
    try {
      const response = await sendResultsOrderDB(orderId);
      toast.success(response.data.message || 'Correo enviado correctamente');
    } catch (error) {
      const msg = error?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error enviando correo');
      toast.error(errorMsg);
    } finally {
      setSendingEmailId(null);
    }
  };

  // Agregar función para imprimir (obtener url prefirmada)
  const handlePrintOrder = async (orderId) => {
    setPrintingOrderId(orderId);
    try {
      const response = await getUrlPrefirredOrderDB(orderId);
      const url = response.data?.data?.ord_pdf_url;
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('No se pudo obtener la URL prefirmada');
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error obteniendo URL prefirmada');
      toast.error(errorMsg);
    } finally {
      setPrintingOrderId(null);
    }
  };

  return (
    <LayoutDashboard>
      <CardWithTitle title="Buscar Órdenes de Laboratorio">
        {(generatingPdfId || sendingEmailId) && (
          <MuiModalLoader text={generatingPdfId ? "Generando PDF..."  : "Enviando correo..."} />
        )}
        <div className="flex flex-col gap-2 mb-4">
          {/* Loader ahora es modal, no aquí */}
          <div className="flex gap-2">
            <MuiInput
              name="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por documento"
              className="w-64 max-w-xs"
            />
            <div className="mt-0">
              <CreateButton title="Buscar" onClick={handleSearch} />
            </div>
          </div>
        </div>
        <MuiTable columns={columns} data={orders} />
        <MuiFileUploadModal
          open={showUploadModal}
          onClose={() => { setShowUploadModal(false); setSelectedOrderId(null); }}
          onUpload={handleUploadFile}
          loading={false}
          title="Cargar archivo adjunto"
        />
      </CardWithTitle>
    </LayoutDashboard>
  );
}
