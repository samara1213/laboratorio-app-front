import { ActionIconButton } from './buttons';

/**
 * Botón de ícono "Adjuntar archivo" (44 px, con nombre accesible)
 */
export default function UploadButton({ onClick, title = 'Adjuntar archivo', className = '', ...rest }) {
  return <ActionIconButton icon="mdi:paperclip" title={title} onClick={onClick} className={className} tone="default" {...rest} />;
}
