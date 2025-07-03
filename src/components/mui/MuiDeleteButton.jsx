import { Icon } from '@iconify/react';

export default function MuiDeleteButton({ onClick, title = 'Eliminar', className = '', ...props }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`flex items-center justify-center px-2 py-2 rounded bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition w-9 h-9 ${className}`}
            {...props}
        >
            <Icon icon="mdi:delete" className="w-5 h-5" />
        </button>
    );
}
