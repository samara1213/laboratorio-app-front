// Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuthStore } from '../../hooks/authStore';
import { cn } from '@/lib/utils';

/**
 * Logo del laboratorio (matraz sobre fondo hematoxilina)
 */
export function BrandMark({ className }) {
  return (
    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-panel bg-primary text-on-primary', className)} aria-hidden="true">
      <Icon icon="mdi:flask-outline" className="size-6" />
    </span>
  );
}

/**
 * Hojas del árbol de menú (opciones con url), para la barra colapsada
 */
function flattenLeaves(menus) {
  return menus.flatMap((menu) => (menu.children?.length ? flattenLeaves(menu.children) : menu.men_url ? [menu] : []));
}

/**
 * Enlace de una opción del menú
 */
function NavLink({ menu, active, collapsed, onNavigate, nested = false }) {
  return (
    <Link
      to={menu.men_url}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? menu.men_name : undefined}
      title={collapsed ? menu.men_name : undefined}
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-control text-[15px] transition-colors',
        collapsed ? 'size-12 justify-center' : nested ? 'pr-3 pl-11' : 'px-3',
        active ? 'bg-tint font-bold text-primary' : 'font-medium text-ink hover:bg-ground',
      )}
    >
      {!nested && <Icon icon={menu.men_icon || 'mdi:circle-small'} className="size-5 shrink-0" aria-hidden="true" />}
      {!collapsed && <span className="min-w-0 truncate">{menu.men_name}</span>}
    </Link>
  );
}

/**
 * Opción de segundo nivel con hijos: se expande para mostrar el tercer nivel
 */
function NavBranch({ menu, pathname, onNavigate }) {
  const containsActive = menu.children.some((child) => child.men_url === pathname);
  const [open, setOpen] = useState(containsActive);
  const panelId = `menu-${menu.men_id}`;
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 items-center gap-3 rounded-control px-3 text-left text-[15px] font-medium text-ink hover:bg-ground"
      >
        <Icon icon={menu.men_icon || 'mdi:folder-outline'} className="size-5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{menu.men_name}</span>
        <Icon icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="size-5 text-muted" aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className="flex flex-col">
          {menu.children.map((child) => (
            <NavLink key={child.men_id} menu={child} active={child.men_url === pathname} onNavigate={onNavigate} nested />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Contenido de la barra lateral: marca, menú dinámico del rol y usuario.
 * Se usa fijo en portátil/escritorio (expandido o colapsado) y dentro del panel deslizable en celular/tablet.
 * @param {{ collapsed?: boolean, onNavigate?: () => void, onToggleCollapsed?: () => void }} props
 */
export default function Sidebar({ collapsed = false, onNavigate, onToggleCollapsed }) {
  const { user, startLogout } = useAuthStore();
  const { pathname } = useLocation();
  const menuTree = user?.role?.menus || [];
  const fullName = [user?.use_primer_nombre, user?.use_primer_apellido].filter(Boolean).join(' ') || user?.use_correo;
  const initials = (fullName || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const renderNode = (menu) => {
    if (!menu.children?.length) {
      return menu.men_url ? <NavLink key={menu.men_id} menu={menu} active={menu.men_url === pathname} onNavigate={onNavigate} /> : null;
    }
    // primer nivel con hijos: título de grupo
    return (
      <div key={menu.men_id} className="flex flex-col gap-0.5">
        <span className="px-3 pt-1 pb-1.5 text-[13px] font-semibold text-muted">{menu.men_name}</span>
        {menu.children.map((child) =>
          child.children?.length ? (
            <NavBranch key={child.men_id} menu={child} pathname={pathname} onNavigate={onNavigate} />
          ) : child.men_url ? (
            <NavLink key={child.men_id} menu={child} active={child.men_url === pathname} onNavigate={onNavigate} />
          ) : null,
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex h-full flex-col gap-5 py-4', collapsed ? 'items-center px-2' : 'px-3')}>
      <Link to="/dashboard" onClick={onNavigate} className={cn('flex items-center gap-3 rounded-control', !collapsed && 'px-2')} aria-label="Ir al inicio">
        <BrandMark />
        {!collapsed && (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-base font-bold">{user?.laboratory?.lab_name || 'Laboratorio clínico'}</span>
            {user?.laboratory?.lab_nit && <span className="tabular truncate text-[13px] text-muted">NIT {user.laboratory.lab_nit}</span>}
          </span>
        )}
      </Link>

      <nav aria-label="Menú principal" className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto', collapsed ? 'items-center gap-1' : 'gap-4')}>
        {menuTree.length === 0 ? (
          !collapsed && <span className="px-3 text-[15px] text-muted">Tu rol no tiene opciones de menú asignadas.</span>
        ) : collapsed ? (
          flattenLeaves(menuTree).map((menu) => <NavLink key={menu.men_id} menu={menu} active={menu.men_url === pathname} collapsed onNavigate={onNavigate} />)
        ) : (
          menuTree.map(renderNode)
        )}
      </nav>

      {onToggleCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className={cn(
            'flex min-h-11 items-center gap-3 rounded-control border border-border text-[15px] font-medium text-muted hover:bg-ground',
            collapsed ? 'size-12 justify-center' : 'px-3',
          )}
        >
          <Icon icon={collapsed ? 'mdi:chevron-double-right' : 'mdi:chevron-double-left'} className="size-5" aria-hidden="true" />
          {!collapsed && 'Colapsar menú'}
        </button>
      )}

      {!collapsed && (
        <div className="flex items-center gap-3 border-t border-border px-1 pt-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tint font-bold text-primary" aria-hidden="true">
            {initials}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px] font-semibold">{fullName}</span>
            <span className="truncate text-[13px] text-muted">{user?.role?.rol_nombre}</span>
          </span>
          <button
            type="button"
            onClick={startLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="flex size-11 items-center justify-center rounded-control text-muted hover:bg-ground"
          >
            <Icon icon="mdi:logout" className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
