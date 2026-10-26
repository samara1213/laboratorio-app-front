import { ActionIconButton } from './buttons';

/**
 * Botón de ícono "Guardar" (44 px, con nombre accesible)
 */
export default function SaveButton({ onClick, title = 'Guardar', className = '', ...rest }) {
  return <ActionIconButton icon="mdi:content-save-outline" title={title} onClick={onClick} className={className} tone="default" {...rest} />;
}
