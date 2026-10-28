import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSaveCustomer } from '../../../hooks/queries/useCustomers';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

export const DOCUMENT_TYPES = [
  ['CC', 'Cédula de ciudadanía'],
  ['TI', 'Tarjeta de identidad'],
  ['RC', 'Registro civil'],
  ['CE', 'Cédula de extranjería'],
  ['PA', 'Pasaporte'],
];
export const GENDERS = [
  ['F', 'Femenino'],
  ['M', 'Masculino'],
  ['O', 'Otro'],
];

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

/**
 * Registrar o editar un paciente (los rangos de referencia del PDF dependen de su género y edad)
 * @param {{ open: boolean, onClose: () => void, patient?: object, initialDocument?: string,
 *   onSaved?: (data: object) => boolean | void }} props
 *   onSaved: devuelve true si se encarga de salir (no se llama a onClose)
 */
export default function PatientFormDialog({ open, onClose, patient, initialDocument, onSaved }) {
  const save = useSaveCustomer();
  const editing = Boolean(patient);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!open) return;
    reset({
      cus_document_type: patient?.cus_document_type ?? 'CC',
      cus_document_number: patient?.cus_document_number ?? initialDocument ?? '',
      cus_first_name: patient?.cus_first_name ?? '',
      cus_second_name: patient?.cus_second_name ?? '',
      cus_first_lastname: patient?.cus_first_lastname ?? '',
      cus_second_lastname: patient?.cus_second_lastname ?? '',
      cus_gender: patient?.cus_gender ?? '',
      cus_birthdate: patient?.cus_birthdate ? String(patient.cus_birthdate).slice(0, 10) : '',
      cus_phone: patient?.cus_phone ?? '',
      cus_email: patient?.cus_email ?? '',
      cus_address: patient?.cus_address ?? '',
    });
  }, [open, patient, initialDocument, reset]);

  const onSubmit = (values) => {
    const data = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
    save.mutate(
      { id: patient?.cus_id, data },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || 'Paciente guardado');
          // onSaved devuelve true si ya llevó a otra pantalla
          if (onSaved?.(data) !== true) onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar el paciente.')),
      },
    );
  };

  const text = (name, label, rules = {}, props = {}) => (
    <Field label={label} error={errors[name]?.message} className={props.wide ? 'sm:col-span-2' : undefined}>
      {(field) => <Input autoComplete="off" {...props.input} {...field} {...register(name, rules)} />}
    </Field>
  );
  const required = (message) => ({ required: message, validate: (v) => v.trim().length > 0 || message });

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="2xl"
        title={editing ? 'Editar paciente' : 'Registrar paciente'}
        description="El género y la fecha de nacimiento definen los rangos de referencia del PDF."
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="patient-form" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar paciente'}
            </Button>
          </>
        }
      >
        <form id="patient-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Tipo de documento" error={errors.cus_document_type?.message}>
            {(field) => (
              <Select {...field} {...register('cus_document_type', { required: 'Elige el tipo de documento' })}>
                {DOCUMENT_TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {text(
            'cus_document_number',
            'Número de documento',
            { ...required('Escribe el número de documento'), maxLength: { value: 15, message: 'Máximo 15 caracteres' } },
            { input: { inputMode: 'numeric', maxLength: 15 } },
          )}
          {text('cus_first_name', 'Primer nombre', { ...required('Escribe el primer nombre'), maxLength: { value: 25, message: 'Máximo 25 caracteres' } }, { input: { maxLength: 25, autoCapitalize: 'words' } })}
          {text('cus_second_name', 'Segundo nombre (opcional)', {}, { input: { maxLength: 25, autoCapitalize: 'words' } })}
          {text('cus_first_lastname', 'Primer apellido', { ...required('Escribe el primer apellido'), maxLength: { value: 25, message: 'Máximo 25 caracteres' } }, { input: { maxLength: 25, autoCapitalize: 'words' } })}
          {text('cus_second_lastname', 'Segundo apellido (opcional)', {}, { input: { maxLength: 25, autoCapitalize: 'words' } })}
          <Field label="Género" error={errors.cus_gender?.message}>
            {(field) => (
              <Select {...field} {...register('cus_gender', { required: 'Elige el género' })}>
                <option value="">Elige una opción</option>
                {GENDERS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {text(
            'cus_birthdate',
            'Fecha de nacimiento',
            { required: 'Escribe la fecha de nacimiento', validate: (v) => v <= today() || 'La fecha no puede ser futura' },
            { input: { type: 'date', max: today() } },
          )}
          {text(
            'cus_phone',
            'Celular o teléfono',
            { ...required('Escribe el teléfono'), pattern: { value: /^\d{5,10}$/, message: 'Entre 5 y 10 dígitos, sin espacios' } },
            { input: { type: 'tel', inputMode: 'numeric', maxLength: 10 } },
          )}
          {text(
            'cus_email',
            'Correo electrónico',
            { ...required('Escribe el correo: allí se envían los resultados'), pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Correo no válido' } },
            { input: { type: 'email', inputMode: 'email', autoCapitalize: 'none' } },
          )}
          {text('cus_address', 'Dirección', { ...required('Escribe la dirección'), minLength: { value: 5, message: 'Mínimo 5 caracteres' } }, { wide: true })}
        </form>
      </DialogContent>
    </Dialog>
  );
}
