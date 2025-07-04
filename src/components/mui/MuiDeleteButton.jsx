import { Icon } from '@iconify/react';

export default function MuiDeleteButton({ onClick, title = 'Eliminar', className = '', ...props }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`flex items-center justify-center p-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-800 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${className}`}
            style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
            {...props}
        >
            <Icon icon="mdi:delete" className="w-5 h-5" />
        </button>
    );
}
