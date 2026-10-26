import { ActionIconButton } from './buttons';

/**
 * Botón de ícono "Enviar correo" (44 px, con nombre accesible)
 */
export default function MailButton({ onClick, title = 'Enviar correo', className = '', ...rest }) {
  return <ActionIconButton icon="mdi:email-fast-outline" title={title} onClick={onClick} className={className} tone="default" {...rest} />;
}
