/**
 * Componente Modal reutilizable y responsivo.
 * Props:
 * - open: boolean, si el modal está visible
 * - onClose: función para cerrar el modal
 * - children: contenido del modal
 * - maxWidth: ancho máximo opcional (ej: 'max-w-lg', 'max-w-xl')
 */
export default function MuiModal({ open, onClose, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0 animate-fade-in">
      <div
        className={`bg-white rounded-xl shadow-lg w-full ${maxWidth} p-0 sm:p-4 relative animate-fade-in`}
        role="dialog"
        aria-modal="true"
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Cerrar"
          type="button"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
