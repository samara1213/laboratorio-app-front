import React from 'react';
import { Icon } from '@iconify/react';

export default function PrintButton({ onClick, title = 'Imprimir', className = '' }) {
  return (
    <button
      className={`flex items-center justify-center p-2 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700 text-white rounded-lg shadow-md hover:from-gray-500 hover:to-gray-800 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${className}`}
      onClick={onClick}
      title={title}
      type="button"
      style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
    >
      <Icon icon="mdi:printer" className="w-5 h-5" />
    </button>
  );
}
