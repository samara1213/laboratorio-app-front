import CancelButton from './CancelButton';
import CreateButton from './CreateButton';

export default function ConfirmDialog({ open, title = 'Confirmar', message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs animate-fade-in">
        <h3 className="text-lg font-bold mb-2 text-gray-800">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <CancelButton onClick={onCancel} title="Cancelar" className="!px-4 !py-2 !text-base sm:!text-sm" />
          <CreateButton onClick={onConfirm} title={<span className="drop-shadow-sm">Eliminar</span>} className="!px-4 !py-2 !text-base sm:!text-sm" />
        </div>
      </div>
    </div>
  );
}
