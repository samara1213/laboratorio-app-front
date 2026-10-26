// LayoutDashboard.jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../../hooks/authStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const SIDEBAR_KEY = 'lab.sidebar';

/**
 * Busca en el árbol de menú el nombre de la opción cuya url es la ruta actual
 */
function findMenuName(menus = [], pathname) {
  for (const menu of menus) {
    if (menu.men_url === pathname) return menu.men_name;
    const found = findMenuName(menu.children, pathname);
    if (found) return found;
  }
  return null;
}

/**
 * Estado inicial de la barra lateral: la preferencia guardada o, si no hay,
 * expandida en escritorio (≥ 1440 px) y colapsada en portátil
 */
function initialCollapsed() {
  try {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    if (saved) return saved === 'collapsed';
  } catch {
    // sin almacenamiento disponible
  }
  return window.innerWidth < 1440;
}

/**
 * Estructura de las pantallas privadas.
 * - Celular y tablet (< 1024 px): menú en panel deslizable con botón hamburguesa.
 * - Portátil y escritorio: barra lateral fija, colapsable a íconos.
 * @param {{ title?: string, actions?: JSX.Element, children: JSX.Element }} props
 */
export default function LayoutDashboard({ title, actions, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const { user } = useAuthStore();
  const { pathname } = useLocation();
  // sin título explícito se usa el nombre de la opción de menú de la ruta actual
  const pageTitle = title ?? findMenuName(user?.role?.menus, pathname) ?? 'Laboratorio clínico';

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, value ? 'expanded' : 'collapsed');
      } catch {
        // sin almacenamiento: solo dura la sesión
      }
      return !value;
    });
  };

  return (
    <div className="flex min-h-dvh bg-ground">
      <aside
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 border-r border-border bg-surface transition-[width] duration-200 lg:block',
          collapsed ? 'w-[76px]' : 'w-[264px]',
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </aside>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent title="Menú principal">
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={pageTitle} actions={actions} onMenuClick={() => setDrawerOpen(true)} />
        <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:gap-7 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
