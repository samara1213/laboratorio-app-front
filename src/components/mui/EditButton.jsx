import React from 'react';
import { Icon } from '@iconify/react';

export default function EditButton({ onClick, title = 'Editar', className = '' }) {
  return (
    <button
      className={`flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${className}`}
      onClick={onClick}
      title={title}
      type="button"
      style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
    >
      <Icon icon="mdi:pencil" className="w-5 h-5" />
    </button>
  );
}
