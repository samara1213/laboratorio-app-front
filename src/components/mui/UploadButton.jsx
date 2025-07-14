import { Icon } from '@iconify/react';

export default function UploadButton({ onClick, disabled = false, title = 'Cargar', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-[1.04] transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${className}`}
      title={title}
    >
      <Icon icon="mdi:upload" className="w-5 h-5" />
    </button>
  );
}
