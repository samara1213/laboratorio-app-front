import { Button } from '@/components/ui/button';

/**
 * Botón secundario para cancelar o cerrar.
 * Props: onClick, title (texto), className, ...rest
 */
export default function CancelButton({ onClick, title = 'Cancelar', className = '', ...rest }) {
  return (
    <Button variant="secondary" onClick={onClick} className={className} {...rest}>
      {title}
    </Button>
  );
}
