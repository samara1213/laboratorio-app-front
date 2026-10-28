import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSaveParameter } from '../../../hooks/queries/useCatalog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

export const RANGE_GROUPS = [
  ['man', 'Hombres'],
  ['woman', 'Mujeres'],
  ['child', 'Niños'],
];

const toNumber = (value) => (value === '' || value === null || value === undefined ? undefined : Number(String(value).replace(',', '.')));
const validNumber = (value) => value === '' || !Number.isNaN(toNumber(value)) || 'Número no válido';

/**
 * Crear o editar un parámetro de un examen. Un subtítulo (nombre con «*» en la base) agrupa
 * filas en la captura y en el PDF y no lleva resultado
 * @param {{ open: boolean, onClose: () => void, examId: string, parameter?: object, nextOrder: number }} props
 */
export default function ParameterFormDialog({ open, onClose, examId, parameter, nextOrder }) {
  const save = useSaveParameter();
  const editing = Boolean(parameter);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (!open) return;
    const isTitle = parameter?.par_name?.startsWith('*') ?? false;
    reset({
      kind: isTitle ? 'title' : 'result',
      par_name: isTitle ? parameter.par_name.slice(1).trim() : (parameter?.par_name ?? ''),
      par_order: parameter?.par_order ?? nextOrder,
      par_unit_extent: parameter?.par_unit_extent ?? '',
      par_default_value: parameter?.par_default_value ?? '',
      par_range: parameter?.par_range ?? false,
      par_reference_value: parameter?.par_reference_value ?? '',
      ...Object.fromEntries(
        RANGE_GROUPS.flatMap(([group]) => [
          [`par_min_${group}`, parameter?.[`par_min_${group}`] ?? ''],
          [`par_max_${group}`, parameter?.[`par_max_${group}`] ?? ''],
        ]),
      ),
    });
  }, [open, parameter, nextOrder, reset]);

  const kind = watch('kind');
  const range = watch('par_range');
  const isTitle = kind === 'title';

  const onSubmit = (values) => {
    const name = values.par_name.trim();
    const data = isTitle
      ? { exam: examId, par_name: `*${name}`, par_order: Number(values.par_order), par_range: false }
      : {
          exam: examId,
          par_name: name,
          par_order: Number(values.par_order),
          par_unit_extent: values.par_unit_extent.trim(),
          par_default_value: values.par_default_value.trim(),
          par_range: values.par_range,
          par_reference_value: values.par_range ? '' : values.par_reference_value.trim(),
          ...(values.par_range &&
            Object.fromEntries(
              // vacío = sin límite (null borra el valor anterior)
              RANGE_GROUPS.flatMap(([group]) => [
                [`par_min_${group}`, toNumber(values[`par_min_${group}`]) ?? null],
                [`par_max_${group}`, toNumber(values[`par_max_${group}`]) ?? null],
              ]),
            )),
        };
    save.mutate(
      { id: parameter?.par_id, data },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || 'Parámetro guardado');
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar el parámetro.')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="2xl"
        title={editing ? 'Editar parámetro' : 'Nuevo parámetro'}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="parameter-form" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear parámetro'}
            </Button>
          </>
        }
      >
        <form id="parameter-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-[1fr_9rem]" noValidate>
          <Field label="Tipo" className="sm:col-span-2">
            {(field) => (
              <Select {...field} {...register('kind')}>
                <option value="result">Resultado (se registra un valor)</option>
                <option value="title">Subtítulo de sección (agrupa los siguientes)</option>
              </Select>
            )}
          </Field>
          <Field label={isTitle ? 'Subtítulo' : 'Nombre'} error={errors.par_name?.message}>
            {(field) => (
              <Input
                autoComplete="off"
                maxLength={49}
                placeholder={isTitle ? 'Por ejemplo: Serie roja' : 'Por ejemplo: Hemoglobina'}
                {...field}
                {...register('par_name', { required: 'Escribe el nombre', validate: (v) => v.trim().length >= 2 || 'Usa al menos 2 caracteres' })}
              />
            )}
          </Field>
          <Field label="Posición" hint="Orden en la captura y el PDF" error={errors.par_order?.message}>
            {(field) => (
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                {...field}
                {...register('par_order', { required: 'Escribe la posición', validate: (v) => (Number.isInteger(Number(v)) && Number(v) >= 1) || 'Número entero desde 1' })}
              />
            )}
          </Field>

          {!isTitle && (
            <>
              <Field label="Unidad (opcional)">{(field) => <Input autoComplete="off" placeholder="g/dL, %, /mm³…" {...field} {...register('par_unit_extent')} />}</Field>
              <Field label="Valor por defecto (opcional)" hint="Se propone al registrar">
                {(field) => <Input autoComplete="off" {...field} {...register('par_default_value')} />}
              </Field>
              <div className="sm:col-span-2">
                <Checkbox
                  checked={Boolean(range)}
                  onChange={(checked) => setValue('par_range', checked)}
                  label="Tiene rangos de referencia por grupo (hombres, mujeres, niños)"
                  className="justify-start"
                />
              </div>
              {range ? (
                <fieldset className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
                  <legend className="sr-only">Rangos de referencia</legend>
                  {RANGE_GROUPS.map(([group, label]) => (
                    <div key={group} className="flex flex-col gap-2 rounded-control border border-border p-3">
                      <span className="font-semibold">{label}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Mínimo" error={errors[`par_min_${group}`]?.message}>
                          {(field) => <Input inputMode="decimal" autoComplete="off" {...field} {...register(`par_min_${group}`, { validate: validNumber })} />}
                        </Field>
                        <Field label="Máximo" error={errors[`par_max_${group}`]?.message}>
                          {(field) => <Input inputMode="decimal" autoComplete="off" {...field} {...register(`par_max_${group}`, { validate: validNumber })} />}
                        </Field>
                      </div>
                    </div>
                  ))}
                </fieldset>
              ) : (
                <Field label="Valor de referencia (opcional)" hint="Texto libre, por ejemplo «Negativo» o «70 - 100»" className="sm:col-span-2">
                  {(field) => <Input autoComplete="off" {...field} {...register('par_reference_value')} />}
                </Field>
              )}
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
