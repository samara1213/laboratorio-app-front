// Topbar.jsx
import { Icon } from '@iconify/react';
import { useAuthStore } from '../../hooks/authStore';
import { useState, useRef, useEffect } from 'react';

export default function Topbar({ onMenuClick }) {
  const { user, startLogout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <header className="flex items-center justify-between bg-white px-4 sm:px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <button className="md:hidden text-[#29313B] focus:outline-none" onClick={onMenuClick}>
          <Icon icon="mdi:menu" className="w-6 h-6" />
        </button>
        
      </div>
      <div className="flex items-center gap-2 sm:gap-4 relative" ref={dropdownRef}>
        <Icon icon="mdi:bell-outline" className="w-6 h-6 text-gray-400" />
        <button
          className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden focus:outline-none border-2 border-transparent focus:border-[#00B4D8] transition"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú de usuario"
        >
          <Icon icon="mdi:account-circle" className="w-8 h-8 text-[#29313B]" />
        </button>
        <div className="hidden md:flex flex-col items-start">
          <span className="font-medium text-[#29313B]">{user?.name || 'Usuario'}</span>    
        </div>
        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-12 mt-2 w-72 bg-gradient-to-br from-white via-[#e0f7fa] to-[#caf0f8] rounded-2xl shadow-2xl border border-[#00B4D8] z-50 animate-fade-in p-0.5">
            <div className="flex flex-col items-center py-7 px-6 bg-white bg-opacity-90 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-2 border-4 border-[#00B4D8] shadow-lg">
                <Icon icon="mdi:account-circle" className="w-12 h-12 text-[#29313B]" />
              </div>
              <span className="font-bold text-[#232A34] text-lg mb-0.5 truncate w-full text-center flex items-center justify-center gap-1">
                <Icon icon="mdi:account-badge-outline" className="w-5 h-5 text-[#00B4D8]" />
                {user?.name || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500 mb-2 truncate w-full text-center">{user?.use_correo || 'Sin correo'}</span>
              <div className="w-full border-t border-[#00B4D8] my-3"></div>
              <button
                onClick={startLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 rounded-xl shadow-md transition-all duration-200"
              >
                <Icon icon="mdi:logout-variant" className="w-5 h-5 text-white" /> Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
