import React from 'react';
import { Icon } from '@iconify/react';

export default function PdfButton({ onClick, title = 'Generar PDF', className = '' }) {
  return (
    <button
      className={`flex items-center justify-center p-2 bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white rounded-lg shadow-md hover:from-pink-600 hover:to-pink-800 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 ${className}`}
      onClick={onClick}
      title={title}
      type="button"
      style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
    >
      <Icon icon="mdi:file-pdf-box" className="w-5 h-5" />
    </button>
  );
}
