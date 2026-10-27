// Topbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuthStore } from '../../hooks/authStore';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getThemePreference, setThemePreference } from '@/lib/theme';
import { can } from '@/lib/permissions';

const THEMES = [
  { value: 'light', label: 'Tema claro', icon: 'mdi:white-balance-sunny' },
  { value: 'dark', label: 'Tema oscuro', icon: 'mdi:weather-night' },
  { value: 'system', label: 'Tema del sistema', icon: 'mdi:monitor' },
];

/**
 * Barra superior: botón de menú (celular/tablet), título de la página, acción "Nueva orden" y menú de usuario
 * @param {{ title?: string, onMenuClick: () => void, actions?: JSX.Element }} props
 */
export default function Topbar({ title, onMenuClick, actions }) {
  const { user, startLogout } = useAuthStore();
  const [theme, setTheme] = useState(getThemePreference);
  const fullName = [user?.use_primer_nombre, user?.use_primer_apellido].filter(Boolean).join(' ') || user?.use_correo;
  const initials = (fullName || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const canCreateOrder = can(user, 'orders:create');

  const changeTheme = (value) => {
    setThemePreference(value);
    setTheme(value);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface px-2 sm:gap-3 sm:px-4 lg:h-[72px] lg:px-8">
      <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Abrir menú" className="text-ink lg:hidden">
        <Icon icon="mdi:menu" className="size-6" aria-hidden="true" />
      </Button>

      <h1 className="min-w-0 flex-1 truncate text-lg font-bold sm:text-xl lg:text-2xl">{title}</h1>

      {actions}

      {canCreateOrder && (
        <Button asChild className="hidden sm:inline-flex">
          <Link to="/orders/create">
            <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
            Nueva orden
          </Link>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Menú de ${fullName}`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-tint text-[15px] font-bold text-primary"
          >
            {initials}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-ink">{fullName}</span>
            <span className="truncate">{user?.use_correo}</span>
            {user?.laboratory?.lab_name && <span className="truncate">{user.laboratory.lab_name}</span>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <Icon icon="mdi:account-circle-outline" aria-hidden="true" />
              <span className="flex-1">Mi perfil y firma</span>
              {!user?.has_signature && <span className="size-2 rounded-full bg-cap-pend" aria-label="sin firma" />}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {THEMES.map((t) => (
            <DropdownMenuItem key={t.value} onSelect={() => changeTheme(t.value)}>
              <Icon icon={t.icon} aria-hidden="true" />
              <span className="flex-1">{t.label}</span>
              {theme === t.value && <Icon icon="mdi:check" className="text-primary" aria-label="seleccionado" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={startLogout}>
            <Icon icon="mdi:logout" aria-hidden="true" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
