import LayoutDashboard from '../../dashboard/LayoutDashboard';
import MuiInput from '../../mui/MuiInput';
import CreateButton from '../../mui/CreateButton';
import CancelButton from '../../mui/CancelButton';
import { useState, useEffect } from 'react';
import CardWithTitle from '../../CardWithTitle';
import { searchCustomerByDocumentDB, getAllExamsDB, createOrderDB } from '../../../services';
import { useAuthStore } from '../../../hooks/authStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import MuiSelect from '../../mui/MuiSelect';
import MuiTable from '../../mui/MuiTable';
import MuiDeleteButton from '../../mui/MuiDeleteButton';
import OrderTotalsBox from './OrderTotalsBox';

export default function CreateOrderPage() {
    const [doc, setDoc] = useState('');
    const [searching, setSearching] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [showCreatePrompt, setShowCreatePrompt] = useState(false);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [orderExams, setOrderExams] = useState([]);
    const { user } = useAuthStore();
    const navigate = useNavigate();
    // Permite que el input acepte vacío y muestra 0 si está vacío
    const [discountPercent, setDiscountPercent] = useState('0');
    // Nuevo estado para controlar la vista de la orden
    const [showOrderSection, setShowOrderSection] = useState(false);
    // Nuevo: Totales como estado para forzar re-render si es necesario
    const [totals, setTotals] = useState({ subtotal: 0, discountValue: 0, total: 0 });

    useEffect(() => {
        
        if (!user?.laboratory?.lab_id) return;
        const fetchExams = async () => {
            try {
                const res = await getAllExamsDB(user.laboratory.lab_id);
                // Soportar ambos posibles formatos de respuesta
                let data = res.data?.data || res.data;
                if (data) {
                    setExams(data);

                } else {
                    setExams([]);
                }

            } catch (error) {
                const msg = error?.response?.data?.message;
                const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error buscando exámenes');
                toast.error(errorMsg);
                setExams([]);
            }
        };
        fetchExams();
    }, [user?.laboratory?.lab_id]);

    // Modifica handleSearch para mostrar la sección de orden al encontrar cliente
    const handleSearch = async (e) => {
        e.preventDefault();
        setSearching(true);
        setCustomer(null);
        setShowCreatePrompt(false);
        try {
            const res = await searchCustomerByDocumentDB({
                laboratory: user?.laboratory?.lab_id,
                cus_document_number: doc
            });
            if (res.data && res.data.data) {
                setCustomer(res.data.data);
                setShowOrderSection(true);
            } else {
                setShowCreatePrompt(true);
            }
        } catch (error) {
            const msg = error?.response?.data?.message;
            const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al buscar cliente');
            setShowCreatePrompt(true);
        }
        setSearching(false);
    };

    const handleGoToCreate = () => {
        navigate('/customers/create');
    };
    const handleCancelPrompt = () => {
        setShowCreatePrompt(false);
        setDoc('');
    };
    // Nuevo handler para cancelar la orden y volver a la búsqueda
    const handleCancelOrder = () => {
        setCustomer(null);
        setOrderExams([]);
        setDiscountPercent('0');
        setShowOrderSection(false);
    };

    const handleAddExam = () => {
        if (!selectedExam) return;
        const exam = exams.find(e => e.exa_id === selectedExam);
        if (!exam) return;
        // Evitar duplicados
        if (orderExams.some(e => e.exa_id === exam.exa_id)) {
            toast.warn('El examen ya está agregado');
            return;
        }
        setOrderExams([
            ...orderExams,
            {
                exa_id: exam.exa_id,
                exa_name: exam.exa_name,
                exa_description: exam.exa_description || '',
                exa_price: exam.exa_price || 0,
                quantity: 1
            }
        ]);
        setSelectedExam('');
    };

    const handleRemoveExam = (exa_id) => {
        setOrderExams(orderExams.filter(e => e.exa_id !== exa_id));
    };

    const handleChangeQuantity = (exa_id, value) => {
        setOrderExams(orderExams.map(e =>
            e.exa_id === exa_id
                ? { ...e, quantity: Math.max(1, Number(value) || 1) }
                : e
        ));
    };
  
    useEffect(() => {
        const percent = Number(discountPercent);
        const subtotal = orderExams.reduce((sum, e) => sum + (Number(e.exa_price || 0) * Number(e.quantity || 1)), 0);
        const discountValue = !isNaN(percent) && percent > 0 ? subtotal * (percent / 100) : 0;
        const total = subtotal - discountValue;
        setTotals({ subtotal, discountValue, total });
    }, [orderExams, discountPercent]);

    const handleCreateOrder = async () => {
        if (!customer || orderExams.length === 0) return;
        try {
            const orderData = {
                cus_id: customer.cus_id,
                exa_ids: orderExams.map(e => e.exa_id),
                ord_discount_percentage: Number(discountPercent),
                ord_total_value: Number(totals.total), 
                ord_discount_value: Number(totals.discountValue),
                lab_id: user?.laboratory?.lab_id,
                ord_status: "PENDIENTE"
            };
            const response = await createOrderDB(orderData);            
            toast.success(response?.data?.message || 'Orden creada exitosamente');
            handleCancelOrder();
        } catch (error) {
            const msg = error?.response?.data?.message;
            const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al crear la orden');
            toast.error(errorMsg);
        }
    };

    const columns = [
        { key: 'exa_name', label: 'Nombre del examen' },
        { key: 'exa_description', label: 'Descripcion' },
        { key: 'exa_price', label: 'Precio', render: (row) => `$${Number(row.exa_price).toLocaleString()}` },
        { key: 'quantity', label: 'Cantidad', render: (row) => (
            <div className="flex items-center justify-center gap-2">
                <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold"
                    onClick={() => handleChangeQuantity(row.exa_id, row.quantity - 1)}
                    disabled={row.quantity <= 1}
                    aria-label="Disminuir cantidad"
                >-</button>
                <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={e => handleChangeQuantity(row.exa_id, e.target.value)}
                    className="w-12 border rounded px-2 py-1 text-center"
                    aria-label="Cantidad"
                />
                <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold"
                    onClick={() => handleChangeQuantity(row.exa_id, row.quantity + 1)}
                    aria-label="Aumentar cantidad"
                >+</button>
            </div>
        ) },
        { key: 'total_value', label: 'Valor total', render: (row) => `$${(Number(row.exa_price) * Number(row.quantity)).toLocaleString()}` },
        { key: 'accion', label: 'Acciones', render: (row) => (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <MuiDeleteButton onClick={() => handleRemoveExam(row.exa_id)} aria-label="Eliminar examen" />
            </div>
        ) },
    ];

    return (
        <LayoutDashboard>
            <div className="p-6">
                <CardWithTitle title="Crear Orden de Laboratorio">
                    <div className="bg-white rounded-lg shadow p-6 min-h-[300px]">
                        {/* Mostrar input y botón de buscar solo si no hay cliente seleccionado */}
                        {!showOrderSection && !showCreatePrompt && (
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                                <MuiInput
                                    label="Documento del cliente"
                                    name="customer_document"
                                    value={doc}
                                    onChange={e => setDoc(e.target.value)}
                                    className="w-64 max-w-xs"
                                    required
                                />
                                <div className="mt-4">
                                    <CreateButton type="submit" title={searching ? 'Buscando...' : 'Buscar'} disabled={searching} />
                                </div>
                            </form>
                        )}
                        {showCreatePrompt && (
                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                                <span className="text-red-600 font-medium mb-2">Cliente no encontrado</span>
                                <CreateButton title="Crear cliente" onClick={handleGoToCreate} />
                                <CancelButton onClick={handleCancelPrompt} />
                            </div>
                        )}
                        {/* Mostrar datos del cliente, exámenes y tabla solo si showOrderSection está activo */}
                        {showOrderSection && customer && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <div className="font-semibold text-blue-700 mb-1">Datos del cliente:</div>
                                    <div className="text-sm text-blue-900">
                                        <span className="font-medium">{customer.cus_first_name} {customer.cus_second_name} {customer.cus_first_lastname} {customer.cus_second_lastname}</span><br />
                                        <span>Documento: {customer.cus_document_type} {customer.cus_document_number}</span><br />
                                        <span>Correo: {customer.cus_email}</span><br />
                                        <span>Teléfono: {customer.cus_phone}</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <div className="font-semibold text-green-700 mb-2">Seleccionar examen a realizar</div>
                                    <form className="flex flex-col sm:flex-row items-center gap-4">
                                        <MuiSelect
                                            label="Seleccione un examen"
                                            name="exam_select"
                                            value={selectedExam}
                                            onChange={e => setSelectedExam(e.target.value)}
                                            className="w-64 max-w-xs"
                                            required
                                        >
                                            <option value="">Seleccione un examen</option>
                                            {exams.map(exam => (
                                                <option key={exam.exa_id} value={exam.exa_id}>{exam.exa_name}</option>
                                            ))}
                                        </MuiSelect>
                                        <div className="mt-4">
                                            <CreateButton type="button" title="Agregar examen" onClick={handleAddExam} />
                                        </div>
                                    </form>
                                </div>
                                <div className="overflow-x-auto mt-6">
                                    {orderExams.length > 0 && (
                                        <>  
                                        <MuiTable
                                            columns={columns}
                                            data={orderExams}
                                        />
                                        <OrderTotalsBox
                                            totals={totals}
                                            discountPercent={discountPercent}
                                            setDiscountPercent={setDiscountPercent}
                                        />
                                        </>                                     
                                        
                                    )}
                                </div>                               
                                {/* Botones de crear y cancelar orden */}
                                <div className="flex gap-4 mt-8">
                                    <CreateButton title="Crear orden" onClick={handleCreateOrder} disabled={orderExams.length === 0} />
                                    <CancelButton onClick={handleCancelOrder} />
                                </div>
                            </>
                        )}                        
                    </div>
                </CardWithTitle>
            </div>
        </LayoutDashboard>
    );
}
