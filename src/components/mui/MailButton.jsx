import React from 'react';
import { Icon } from '@iconify/react';

export default function MailButton({ onClick, title = 'Enviar correo', className = '' }) {
  return (
    <button
      className={`flex items-center justify-center p-2 bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-cyan-800 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 ${className}`}
      onClick={onClick}
      title={title}
      type="button"
      style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
    >
      <Icon icon="mdi:email-send" className="w-5 h-5" />
    </button>
  );
}
