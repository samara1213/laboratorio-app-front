import { Icon } from '@iconify/react';

export default function CancelButton({ onClick, title = 'Cancelar', className = '', ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 text-pink-800 font-extrabold uppercase tracking-wide rounded-lg shadow hover:from-pink-300 hover:to-pink-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 text-base sm:text-sm ${className}`}
      style={{ minHeight: '40px' }}
      {...rest}
    >
      <Icon icon="mdi:close" className="h-5 w-5" />
      <span className="drop-shadow-sm">{title}</span>
    </button>
  );
}
