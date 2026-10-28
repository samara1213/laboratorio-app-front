import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSaveExamClassification } from '../../../hooks/queries/useCatalog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

/**
 * Crear o editar una clasificación de exámenes.
 * El super administrador elige si es del sistema o de un laboratorio (solo al crearla)
 * @param {{ open: boolean, onClose: () => void, classification?: object, laboratories: object[], defaultLabId?: string }} props
 *   laboratories: vacío para quien no es super administrador (crea en su laboratorio)
 */
export default function ClassificationFormDialog({ open, onClose, classification, laboratories, defaultLabId }) {
  const save = useSaveExamClassification();
  const editing = Boolean(classification);
  const chooseScope = !editing && laboratories.length > 0;
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (!open) return;
    reset({
      cla_name: classification?.cla_name ?? '',
      cla_order: classification?.cla_order ?? '',
      cla_show_images: classification?.cla_show_images ?? false,
      cla_active: classification?.cla_active ?? true,
      laboratory: defaultLabId ?? '',
    });
  }, [open, classification, defaultLabId, reset]);

  const showImages = watch('cla_show_images');
  const active = watch('cla_active');

  const onSubmit = (values) => {
    const data = {
      cla_name: values.cla_name.trim(),
      cla_order: values.cla_order === '' ? 0 : Number(values.cla_order),
      cla_show_images: values.cla_show_images,
      cla_active: values.cla_active,
      // solo el super administrador envía el alcance: vacío = del sistema
      ...(chooseScope && values.laboratory && { laboratory: values.laboratory }),
    };
    save.mutate(
      { id: classification?.cla_id, data },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || 'Clasificación guardada');
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar la clasificación.')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="lg"
        title={editing ? 'Editar clasificación' : 'Nueva clasificación'}
        description="Es el título de la sección del PDF donde se imprimen sus exámenes."
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="classification-form" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear clasificación'}
            </Button>
          </>
        }
      >
        <form id="classification-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-[1fr_9rem]" noValidate>
          <Field label="Nombre" error={errors.cla_name?.message}>
            {(field) => (
              <Input
                autoComplete="off"
                maxLength={60}
                placeholder="Por ejemplo: QUÍMICA"
                {...field}
                {...register('cla_name', { required: 'Escribe el nombre', validate: (v) => v.trim().length >= 2 || 'Usa al menos 2 caracteres' })}
              />
            )}
          </Field>
          <Field label="Posición" hint="Menor primero" error={errors.cla_order?.message}>
            {(field) => (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={999}
                {...field}
                {...register('cla_order', {
                  validate: (v) => v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 999) || 'Entre 0 y 999',
                })}
              />
            )}
          </Field>
          {chooseScope && (
            <Field label="Disponible para" hint="Las del sistema las ven todos los laboratorios." className="sm:col-span-2">
              {(field) => (
                <Select {...field} {...register('laboratory')}>
                  <option value="">Todos los laboratorios (sistema)</option>
                  {laboratories.map((lab) => (
                    <option key={lab.lab_id} value={lab.lab_id}>
                      Solo {lab.lab_name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Checkbox
              checked={Boolean(showImages)}
              onChange={(checked) => setValue('cla_show_images', checked)}
              label="Incluir las imágenes adjuntas a la orden en esta sección"
              className="justify-start"
            />
            <Checkbox
              checked={Boolean(active)}
              onChange={(checked) => setValue('cla_active', checked)}
              label="Activa (se puede asignar a exámenes)"
              className="justify-start"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
