import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useCreatePdfTemplate } from '../../../hooks/queries/usePdfTemplates';
import { previewPdfTemplateFileDB } from '../../../services';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

const MAX_SIZE = 256 * 1024;

/**
 * Errores que devuelve el backend al validar una plantilla (puede ser una lista)
 */
function problemsOf(error, fallback) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  if (status && status < 500 && Array.isArray(message)) return message;
  return [errorMessage(error, fallback)];
}

/**
 * Subir una plantilla nueva: se puede ver la vista previa antes de guardarla.
 * Se guarda inactiva; se activa desde el listado
 * @param {{ open: boolean, onClose: () => void, laboratories: object[], defaultLabId?: string,
 *   preview: (title: string, fetchPdf: Function, onError?: Function) => Promise<boolean> }} props
 */
export default function UploadTemplateDialog({ open, onClose, laboratories, defaultLabId, preview }) {
  const create = useCreatePdfTemplate();
  const [problems, setProblems] = useState([]);
  const [previewing, setPreviewing] = useState(false);
  const { register, handleSubmit, reset, watch, getValues, trigger, formState: { errors } } = useForm();

  useEffect(() => {
    if (!open) return;
    reset({ tpl_name: '', tpl_description: '', laboratory: defaultLabId ?? '', file: undefined });
    setProblems([]);
  }, [open, defaultLabId, reset]);

  const files = watch('file');
  const file = files?.[0];

  const fileRules = {
    validate: (list) => {
      const selected = list?.[0];
      if (!selected) return 'Elige el archivo .html';
      if (!/\.html?$/i.test(selected.name)) return 'El archivo debe ser .html';
      if (selected.size > MAX_SIZE) return 'El archivo supera los 256 KB';
      return true;
    },
  };

  const showPreview = async () => {
    if (!(await trigger('file'))) return;
    setProblems([]);
    setPreviewing(true);
    const { laboratory } = getValues();
    await preview(`Vista previa · ${file.name}`, () => previewPdfTemplateFileDB(file, laboratory || undefined), (error) =>
      setProblems(problemsOf(error, 'No fue posible generar la vista previa.')),
    );
    setPreviewing(false);
  };

  const onSubmit = (values) => {
    setProblems([]);
    create.mutate(
      {
        file: values.file[0],
        tpl_name: values.tpl_name.trim(),
        tpl_description: values.tpl_description.trim(),
        laboratory: values.laboratory,
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || 'Plantilla guardada');
          onClose();
        },
        onError: (error) => setProblems(problemsOf(error, 'No fue posible guardar la plantilla.')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="xl"
        title="Subir plantilla"
        description="Se guarda inactiva. Revísala con la vista previa y actívala desde el listado."
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={showPreview} disabled={previewing || create.isPending}>
              <Icon icon="mdi:file-eye-outline" className="size-5" aria-hidden="true" />
              {previewing ? 'Generando…' : 'Vista previa'}
            </Button>
            <Button type="submit" form="template-form" disabled={create.isPending || previewing}>
              {create.isPending ? 'Guardando…' : 'Guardar plantilla'}
            </Button>
          </>
        }
      >
        <form id="template-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="Archivo de la plantilla" hint="HTML en UTF-8, hasta 256 KB." error={errors.file?.message}>
            {(field) => <Input type="file" accept=".html,.htm,text/html" {...field} {...register('file', fileRules)} />}
          </Field>
          <Field label="Nombre" error={errors.tpl_name?.message}>
            {(field) => (
              <Input
                autoComplete="off"
                maxLength={80}
                placeholder="Por ejemplo: Membrete 2026"
                {...field}
                {...register('tpl_name', { required: 'Escribe el nombre', validate: (v) => v.trim().length >= 2 || 'Usa al menos 2 caracteres' })}
              />
            )}
          </Field>
          <Field label="Laboratorio" hint="Sin laboratorio es la plantilla del sistema: la usan los laboratorios que no tienen una propia.">
            {(field) => (
              <Select {...field} {...register('laboratory')}>
                <option value="">Sistema (todos los laboratorios sin plantilla propia)</option>
                {laboratories.map((lab) => (
                  <option key={lab.lab_id} value={lab.lab_id}>
                    {lab.lab_name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Descripción (opcional)">
            {(field) => <Textarea rows={2} maxLength={250} {...field} {...register('tpl_description')} />}
          </Field>

          {problems.length > 0 && (
            <div role="alert" className="rounded-control border-2 border-danger bg-surface px-4 py-3">
              <p className="flex items-center gap-2 font-semibold text-danger-ink">
                <Icon icon="mdi:alert-circle-outline" className="size-5" aria-hidden="true" />
                {problems.length === 1 ? 'Revisa la plantilla' : `Revisa la plantilla (${problems.length} problemas)`}
              </p>
              <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-6 text-[15px]">
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
