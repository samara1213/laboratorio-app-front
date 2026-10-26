import { ActionIconButton } from './buttons';

/**
 * Botón de ícono "Generar PDF" (44 px, con nombre accesible)
 */
export default function PdfButton({ onClick, title = 'Generar PDF', className = '', ...rest }) {
  return <ActionIconButton icon="mdi:file-pdf-box" title={title} onClick={onClick} className={className} tone="default" {...rest} />;
}
