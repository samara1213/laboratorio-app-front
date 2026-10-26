import { Field, Select } from '@/components/ui/field';
import { cn } from '@/lib/utils';

/**
 * Select con etiqueta y mensaje de error.
 * Props: label, name, value, onChange, error, hint, className, children (opciones), ...rest (select)
 */
export default function MuiSelect({ label, name, error = '', hint, className = '', children, ...rest }) {
  return (
    <Field label={label} error={error} hint={hint} id={rest.id || name} className={cn('mb-4', className)}>
      {(field) => (
        <Select name={name} {...field} {...rest}>
          {children}
        </Select>
      )}
    </Field>
  );
}
