import { ActionIconButton } from './buttons';

/**
 * Botón de ícono "Imprimir" (44 px, con nombre accesible)
 */
export default function PrintButton({ onClick, title = 'Imprimir', className = '', ...rest }) {
  return <ActionIconButton icon="mdi:printer-outline" title={title} onClick={onClick} className={className} tone="default" {...rest} />;
}
