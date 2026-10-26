import { Spinner } from '@/components/ui/panel';

/**
 * Indicador de carga con texto
 */
export default function MuiLoaderCircle({ text = 'Generando PDF…' }) {
  return <Spinner label={text} />;
}
