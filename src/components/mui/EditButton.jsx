import { ActionIconButton } from './buttons';

/**
 * Botón de ícono "Editar" (44 px, con nombre accesible)
 */
export default function EditButton({ onClick, title = 'Editar', className = '', ...rest }) {
  return <ActionIconButton icon="mdi:pencil-outline" title={title} onClick={onClick} className={className} tone="default" {...rest} />;
}
