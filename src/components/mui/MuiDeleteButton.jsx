import { ActionIconButton } from './buttons';

/**
 * Botón de ícono "Eliminar" (44 px, con nombre accesible)
 */
export default function MuiDeleteButton({ onClick, title = 'Eliminar', className = '', ...rest }) {
  return <ActionIconButton icon="mdi:delete-outline" title={title} onClick={onClick} className={className} tone="danger" {...rest} />;
}
