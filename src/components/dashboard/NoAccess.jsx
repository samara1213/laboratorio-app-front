import { Link } from 'react-router-dom';
import LayoutDashboard from './LayoutDashboard';
import { Panel } from '@/components/ui/panel';
import { buttonVariants } from '@/components/ui/button';

/**
 * Pantalla para una ruta que el rol del usuario no puede ver
 */
function NoAccess() {
  return (
    <LayoutDashboard title="Sin acceso">
      <Panel className="flex flex-col items-start gap-4 p-6 sm:p-8">
        <p className="max-w-prose text-[15px] text-ink">
          Tu rol no tiene permiso para ver esta pantalla. Si la necesitas, pide al administrador de tu laboratorio que lo agregue a tu rol.
        </p>
        <Link to="/dashboard" className={buttonVariants({ variant: 'secondary' })}>
          Ir al inicio
        </Link>
      </Panel>
    </LayoutDashboard>
  );
}

export default NoAccess;
