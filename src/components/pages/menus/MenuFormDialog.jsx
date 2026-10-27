import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useRoleModules, useSaveMenu } from '../../../hooks/queries/useAdmin';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

/**
 * Crear o editar una opción del menú.
 * Sin url es un grupo (contiene otras opciones); con url necesita el módulo que da acceso
 * @param {{ open: boolean, onClose: () => void, menu?: object, parentId?: string, parents: object[] }} props
 *   parents: opciones que pueden contener a esta (nivel 1 y 2, sin la propia ni sus descendientes)
 */
export default function MenuFormDialog({ open, onClose, menu, parentId, parents }) {
  const saveMenu = useSaveMenu();
  const { data: modules = [] } = useRoleModules();
  const editing = Boolean(menu);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (!open) return;
    reset({
      men_name: menu?.men_name ?? '',
      men_parent: menu?.men_parent ?? parentId ?? '',
      men_url: menu?.men_url ?? '',
      men_icon: menu?.men_icon ?? '',
      module: menu?.module ?? '',
      men_active: menu?.men_active ?? true,
    });
  }, [open, menu, parentId, reset]);

  const url = watch('men_url');
  const icon = watch('men_icon');
  const active = watch('men_active');
  const validIcon = /^[a-z0-9-]+:[a-z0-9-]+$/.test(icon ?? '');

  const onSubmit = (values) => {
    const data = {
      men_name: values.men_name.trim(),
      men_parent: values.men_parent || null,
      men_url: values.men_url.trim() || null,
      men_icon: values.men_icon.trim() || null,
      module: values.men_url.trim() ? values.module || null : null,
      men_active: values.men_active,
    };
    saveMenu.mutate(
      { id: menu?.men_id, data },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || 'Opción guardada');
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar la opción del menú.')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="xl"
        title={editing ? 'Editar opción del menú' : 'Nueva opción del menú'}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="menu-form" disabled={saveMenu.isPending}>
              {saveMenu.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear opción'}
            </Button>
          </>
        }
      >
        <form id="menu-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Nombre" error={errors.men_name?.message}>
            {(field) => (
              <Input
                autoComplete="off"
                maxLength={50}
                {...field}
                {...register('men_name', { required: 'Escribe el nombre', validate: (v) => v.trim().length >= 2 || 'Usa al menos 2 caracteres' })}
              />
            )}
          </Field>
          <Field label="Dentro de" hint="Máximo 3 niveles.">
            {(field) => (
              <Select {...field} {...register('men_parent')}>
                <option value="">Primer nivel</option>
                {parents.map((parent) => (
                  <option key={parent.men_id} value={parent.men_id}>
                    {parent.men_level === 2 ? '— ' : ''}
                    {parent.men_name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Ruta (url)" hint="Déjala vacía si la opción es un grupo. Ejemplo: /orders/search" error={errors.men_url?.message}>
            {(field) => (
              <Input
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={100}
                {...field}
                {...register('men_url', { pattern: { value: /^\/?[a-zA-Z0-9\-/]*$/, message: 'Solo letras, números, "-" y "/"' } })}
              />
            )}
          </Field>
          <Field label="Módulo que da acceso" hint={url ? 'La ven los roles que pueden ver este módulo.' : 'Los grupos no tienen módulo.'} error={errors.module?.message}>
            {(field) => (
              <Select disabled={!url} {...field} {...register('module', { validate: (v, values) => !values.men_url?.trim() || Boolean(v) || 'Elige el módulo' })}>
                <option value="">Elige un módulo</option>
                {modules.map((module) => (
                  <option key={module.mod_slug} value={module.mod_slug}>
                    {module.mod_name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Ícono" hint="Nombre de Iconify, por ejemplo mdi:flask-outline" error={errors.men_icon?.message}>
            {(field) => (
              <div className="flex items-center gap-3">
                <Input
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={60}
                  {...field}
                  {...register('men_icon', { pattern: { value: /^([a-z0-9-]+:[a-z0-9-]+)?$/, message: 'Formato colección:nombre' } })}
                />
                <span className="flex size-11 shrink-0 items-center justify-center rounded-control border border-border bg-ground" aria-hidden="true">
                  {validIcon && <Icon icon={icon} className="size-6" />}
                </span>
              </div>
            )}
          </Field>
          <div className="flex items-end">
            <Checkbox checked={Boolean(active)} onChange={(checked) => setValue('men_active', checked)} label="Visible en el menú" className="justify-start" />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
