import React, { useState } from 'react';
import CardWithTitle from '../CardWithTitle';
import MuiModal from '../mui/MuiModal';
import CancelButton from '../mui/CancelButton';
import CreateButton from '../mui/CreateButton';
import { changeStatusOrderDB } from '../../services/orderService';

export default function PreviewExamsModal({ open, onClose, order, loading }) {
  const [processing, setProcessing] = useState(false);

  const handleProcessOrder = async () => {
    if (!order) return;
    setProcessing(true);
    try {
      await changeStatusOrderDB({ ord_id: order.ord_id, ord_status: 'PROCESANDO' });
      onClose();
    } catch (error) {
      // Puedes mostrar un toast si lo deseas
      // toast.error('No se pudo procesar la orden');
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;  

  return (
    <MuiModal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <CardWithTitle title="Vista previa de exámenes a realizar">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-blue-700 font-semibold animate-pulse">Cargando datos de la orden...</span>
          </div>
        ) : order ? (
          <>
            <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:gap-8">
              <div className="mb-2 sm:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-blue-900">Orden:</span>
                  <span className="text-blue-700 text-base font-mono tracking-wide">{order.ord_code}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-blue-900">Cliente:</span>
                  <span className="text-blue-700">{order.customer?.cus_first_name} {order.customer?.cus_first_lastname}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-900">Documento:</span>
                  <span className="text-blue-700">{order.customer?.cus_document_number}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-blue-800 mb-2">Exámenes solicitados</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {(order.exams || []).length > 0 ? (
                  order.exams.map((exam, idx) => (
                    <div key={idx} className="p-3 rounded border border-blue-100 bg-blue-50 flex flex-col">
                      <span className="font-bold text-blue-900">{exam.exa_name}</span>
                      <span className="text-gray-700 text-sm mt-1">{exam.exa_description || 'Sin descripción'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">No hay exámenes registrados</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-8">
              <CancelButton onClick={onClose} />
              <CreateButton title="procesar" onClick={handleProcessOrder} disabled={processing} />
            </div>
          </>
        ) : null}
      </CardWithTitle>
    </MuiModal>
  );
}
