// Sidebar.jsx
import { Icon } from '@iconify/react';
import { useAuthStore } from '../../hooks/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({ open, onClose }) {
  const { startLogout, user } = useAuthStore();
  const navigate = useNavigate();
  // Estado para menús expandidos
  const [expandedMenus, setExpandedMenus] = useState([]);

  const handleLogout = (e) => {
    e.preventDefault();
    startLogout();
    navigate('/', { replace: true });
  };

  // Menús del usuario desde Redux (estructura anidada en user.role.menus)
  const menuTree = user?.role?.menus || [];

  // Handler para expandir/colapsar
  const handleToggle = (id) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  // Renderizado recursivo de menú (soporta children anidados y colapsado con animación)
  const renderMenu = (menus, level = 0) => menus.map(menu => {
    const hasChildren = menu.children && menu.children.length > 0;
    const expanded = expandedMenus.includes(menu.men_id);
    return (
      <div key={menu.men_id} className={`pl-${level * 2}`}>
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition hover:scale-[1.04] duration-150 ${hasChildren ? 'cursor-pointer hover:bg-[#1e232a]' : 'hover:bg-[#232f3e]'} `}
          onClick={hasChildren ? () => handleToggle(menu.men_id) : undefined}
          style={{ transitionProperty: 'background, transform' }}
        >
          {menu.men_icon && <Icon icon={menu.men_icon} className="w-5 h-5" />}
          {menu.men_url ? (
            <Link to={menu.men_url} className="flex-1">
              {menu.men_name}
            </Link>
          ) : (
            <span className="flex-1">{menu.men_name}</span>
          )}
          {hasChildren && (
            <Icon icon={expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'} className="w-4 h-4 ml-auto" />
          )}
        </div>
        {hasChildren && (
          <div
            className={`ml-2 border-l border-gray-700 overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            style={{ transitionProperty: 'max-height, opacity' }}
          >
            {/* Siempre renderiza los hijos, solo oculta/expone visualmente */}
            {renderMenu(menu.children, level + 1)}
          </div>
        )}
      </div>
    );
  });

  // Responsive sidebar: hidden on mobile, overlay when open
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={onClose}></div>
      )}
      <aside className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-[#232A34] text-white flex flex-col min-h-screen transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#232A34]">
          <button className="flex items-center gap-2 focus:outline-none" onClick={() => navigate('/dashboard')}>
            <Icon icon="ph:flask-fill" className="w-7 h-7 text-white" />
            <span className="font-bold text-lg">Dashboard</span>
          </button>
          <button className="ml-auto md:hidden text-white" onClick={onClose}>
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        {/* Ajuste: nav ocupa el espacio entre header y footer, con scroll solo en menú */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-144px)]">
          {menuTree.length > 0 ? renderMenu(menuTree) : <span className="text-gray-400">Sin menús asignados</span>}
        </nav>
        <div className="px-4 pb-6 mt-auto">
          <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e232a] transition"><Icon icon="mdi:logout" className="w-5 h-5" /> Log Out</a>
        </div>
      </aside>
    </>
  );
}
