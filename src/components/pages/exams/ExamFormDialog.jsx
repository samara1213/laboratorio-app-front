import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAlliances, useExamClassifications, useSaveExam } from '../../../hooks/queries/useCatalog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

/**
 * Crear o editar un examen: nombre, precio, clasificación (sección del PDF) y convenio opcional
 * @param {{ open: boolean, onClose: () => void, exam?: object }} props
 */
export default function ExamFormDialog({ open, onClose, exam }) {
  const save = useSaveExam();
  const { data: classifications = [] } = useExamClassifications(undefined, { enabled: open });
  const { data: alliances = [] } = useAlliances({ enabled: open });
  const editing = Boolean(exam);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // activas, y la actual del examen aunque se haya desactivado
  const options = classifications.filter((cla) => cla.cla_active || cla.cla_id === exam?.classification?.cla_id);

  useEffect(() => {
    if (!open) return;
    reset({
      exa_name: exam?.exa_name ?? '',
      exa_description: exam?.exa_description ?? '',
      exa_price: exam?.exa_price ?? '',
      classification: exam?.classification?.cla_id ?? '',
      alliance: exam?.alliance?.ali_id ?? '',
    });
  }, [open, exam, reset]);

  const onSubmit = (values) => {
    const data = {
      exa_name: values.exa_name.trim(),
      exa_description: values.exa_description.trim(),
      exa_price: Number(values.exa_price),
      classification: values.classification || null,
      alliance: values.alliance || null,
    };
    save.mutate(
      { id: exam?.exa_id, data },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || 'Examen guardado');
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar el examen.')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="xl"
        title={editing ? 'Editar examen' : 'Nuevo examen'}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="exam-form" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear examen'}
            </Button>
          </>
        }
      >
        <form id="exam-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Nombre" error={errors.exa_name?.message} className="sm:col-span-2">
            {(field) => (
              <Input
                autoComplete="off"
                maxLength={50}
                placeholder="Por ejemplo: Hemograma completo"
                {...field}
                {...register('exa_name', { required: 'Escribe el nombre', validate: (v) => v.trim().length >= 2 || 'Usa al menos 2 caracteres' })}
              />
            )}
          </Field>
          <Field label="Descripción (opcional)" hint="Ayuda a encontrarlo al crear una orden." className="sm:col-span-2">
            {(field) => <Textarea rows={2} maxLength={250} {...field} {...register('exa_description')} />}
          </Field>
          <Field label="Precio (COP)" error={errors.exa_price?.message}>
            {(field) => (
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                {...field}
                {...register('exa_price', {
                  required: 'Escribe el precio',
                  validate: (v) => (Number(v) >= 0 && Number(v) <= 99_999_999) || 'Precio no válido',
                })}
              />
            )}
          </Field>
          <Field label="Clasificación" hint="Sección del PDF donde se imprime." error={errors.classification?.message}>
            {(field) => (
              <Select {...field} {...register('classification', { required: 'Elige la clasificación' })}>
                <option value="">Elige una clasificación</option>
                {options.map((cla) => (
                  <option key={cla.cla_id} value={cla.cla_id}>
                    {cla.cla_name}
                    {cla.cla_show_images ? ' · con imágenes adjuntas' : ''}
                    {cla.laboratory ? '' : ' (sistema)'}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Convenio (opcional)" className="sm:col-span-2">
            {(field) => (
              <Select {...field} {...register('alliance')}>
                <option value="">Sin convenio</option>
                {alliances.map((alliance) => (
                  <option key={alliance.ali_id} value={alliance.ali_id}>
                    {alliance.ali_nombre}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  );
}
