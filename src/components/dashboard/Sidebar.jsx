// Sidebar.jsx
import { Icon } from '@iconify/react';
import { useAuthStore } from '../../hooks/authStore';
import { useNavigate, Link } from 'react-router-dom';

export default function Sidebar({ open, onClose }) {
  const { startLogout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    startLogout();
    navigate('/', { replace: true });
  };

  // Responsive sidebar: hidden on mobile, overlay when open
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={onClose}></div>
      )}
      <aside className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-[#232A34] text-white flex flex-col min-h-screen transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#232A34]">
          <Icon icon="ph:flask-fill" className="w-7 h-7 text-white" />
          <span className="font-bold text-lg">Dashboard</span>
          <button className="ml-auto md:hidden text-white" onClick={onClose}>
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/users" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:account-group" className="w-5 h-5" /> Users</Link>
          <Link to="/laboratories" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:hospital-building" className="w-5 h-5" /> Laboratorios</Link>
          <Link to="/menus" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:menu" className="w-5 h-5" /> Menús</Link>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:file-document-edit" className="w-5 h-5" /> Articles</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:chart-bar" className="w-5 h-5" /> Reports</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:cog" className="w-5 h-5" /> Settings</a>
          <Link to="/roles" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:shield-account" className="w-5 h-5" /> Roles</Link>
          <Link to="/alliances" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:handshake" className="w-5 h-5" /> Aliados</Link>
          <Link to="/exams" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:flask-outline" className="w-5 h-5" /> Exámenes</Link>
          <Link to="/param-exams" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:flask" className="w-5 h-5" /> Parámetros de Exámenes</Link>
          <Link to="/customers/create" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:account-plus" className="w-5 h-5" /> Crear Cliente</Link>
          <Link to="/customers/edit" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:account-edit" className="w-5 h-5" /> Editar Cliente</Link>
          <Link to="/orders/create" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition">
            <Icon icon="mdi:clipboard-plus-outline" className="w-5 h-5" /> Crear Orden
          </Link>
        </nav>
        <div className="px-4 pb-6 mt-auto">
          <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:logout" className="w-5 h-5" /> Log Out</a>
        </div>
      </aside>
    </>
  );
}
