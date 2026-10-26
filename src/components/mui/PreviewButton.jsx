import { ActionIconButton } from './buttons';

/**
 * Botón de ícono "Ver detalle" (44 px, con nombre accesible)
 */
export default function PreviewButton({ onClick, title = 'Ver detalle', className = '', ...rest }) {
  return <ActionIconButton icon="mdi:eye-outline" title={title} onClick={onClick} className={className} tone="default" {...rest} />;
}
