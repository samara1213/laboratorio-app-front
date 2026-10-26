import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

// solo las acciones de crear llevan el ícono "+"; "Guardar", "Buscar" o "Siguiente" no
const CREATE_ACTION = /^(crear|nuev[oa]|agregar|añadir)/i;

/**
 * Botón de acción principal.
 * Props: onClick, title (texto del botón), className, type, disabled, ...rest
 */
export default function CreateButton({ onClick, title = 'Crear', className = '', type = 'button', ...rest }) {
  const showPlus = typeof title === 'string' && CREATE_ACTION.test(title.trim());
  return (
    <Button type={type} onClick={onClick} className={className} {...rest}>
      {showPlus && <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />}
      {/* conserva el texto tal cual, con la primera letra en mayúscula ("procesar" -> "Procesar") */}
      <span className="first-letter:uppercase">{title}</span>
    </Button>
  );
}
