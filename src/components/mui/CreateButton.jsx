import React from 'react';
import { Icon } from '@iconify/react';

export default function CreateButton({ onClick, title = 'Crear', className = '', type = 'button', ...rest }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-extrabold uppercase tracking-wide rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 text-base sm:text-sm ${className}`}
      onClick={onClick}
      type={type}
      title={title}
      {...rest}
    >
      <Icon icon="mdi:plus" className="h-5 w-5" />
      <span className="drop-shadow-sm text-white">{title}</span>
    </button>
  );
}
