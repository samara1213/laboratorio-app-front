import { Field, Input } from '@/components/ui/field';
import { cn } from '@/lib/utils';

/**
 * Componente de input con etiqueta y mensaje de error (compatible con react-hook-form: en React 19
 * `ref` llega como prop y se pasa al <input>).
 * Props: label, type, name, value, onChange, placeholder, error, hint, className, ...rest (input)
 */
export default function MuiInput({ label, type = 'text', name, error = '', hint, className = '', ...rest }) {
  return (
    <Field label={label} error={error} hint={hint} id={rest.id || name} className={cn('mb-4', className)}>
      {(field) => <Input type={type} name={name} {...field} {...rest} />}
    </Field>
  );
}
