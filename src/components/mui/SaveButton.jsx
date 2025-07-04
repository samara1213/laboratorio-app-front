import React from 'react';
import { Icon } from '@iconify/react';

export default function SaveButton({ onClick, title = 'Guardar', className = '' }) {
  return (
    <button
      className={`flex items-center justify-center p-2 bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-800 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${className}`}
      onClick={onClick}
      title={title}
      type="button"
      style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
    >
      <Icon icon="mdi:content-save" className="w-5 h-5" />
    </button>
  );
}
