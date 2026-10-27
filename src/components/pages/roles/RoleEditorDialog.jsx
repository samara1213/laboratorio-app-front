import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import PermissionMatrix from './PermissionMatrix';
import { usePermissions } from '../../../hooks/usePermissions';
import { useLaboratories, useRoleModules, useSaveRole } from '../../../hooks/queries/useAdmin';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Spinner } from '@/components/ui/panel';
import { errorMessage } from '@/lib/utils';

/**
 * Crear, editar o ver un rol con su matriz de permisos.
 * - Super administrador: elige si el rol es global o de un laboratorio (solo al crear).
 * - Los demás crean roles de su laboratorio y no pueden conceder lo que no tienen
 * @param {{ open: boolean, onClose: () => void, role?: object, readOnly?: boolean }} props
 */
export default function RoleEditorDialog({ open, onClose, role, readOnly = false }) {
  const { can, isSystem } = usePermissions();
  const { data: modules = [], isLoading } = useRoleModules();
  const { data: laboratories = [] } = useLaboratories({ enabled: isSystem && open && !role });
  const saveRole = useSaveRole();
  const editing = Boolean(role);
  const [permissions, setPermissions] = useState({});
  const [active, setActive] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!open) return;
    reset({ rol_nombre: role?.rol_nombre ?? '', rol_description: role?.rol_description ?? '', laboratory: '' });
    setPermissions(role?.permissions ?? {});
    setActive(role?.rol_active ?? true);
  }, [open, role, reset]);

  const onSubmit = (values) => {
    const data = {
      rol_nombre: values.rol_nombre.trim(),
      rol_description: values.rol_description.trim() || undefined,
      rol_active: active,
      permissions: modules.map((module) => ({
        module: module.mod_slug,
        view: Boolean(permissions[module.mod_slug]?.view),
        create: Boolean(permissions[module.mod_slug]?.create),
        update: Boolean(permissions[module.mod_slug]?.update),
        delete: Boolean(permissions[module.mod_slug]?.delete),
      })),
    };
    if (!editing && isSystem && values.laboratory) data.laboratory = values.laboratory;

    saveRole.mutate(
      { id: role?.rol_id, data },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || (editing ? 'Rol actualizado' : 'Rol creado'));
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar el rol.')),
      },
    );
  };

  const title = readOnly ? role?.rol_nombre : editing ? 'Editar rol' : 'Nuevo rol';

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="4xl"
        title={title}
        description={
          readOnly
            ? 'Solo lectura: este rol no lo puedes modificar.'
            : 'Marca qué puede hacer el rol en cada módulo. Crear, editar o eliminar incluyen ver.'
        }
        footer={
          readOnly ? (
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" form="role-form" disabled={saveRole.isPending || isLoading}>
                {saveRole.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear rol'}
              </Button>
            </>
          )
        }
      >
        <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {!readOnly && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" error={errors.rol_nombre?.message}>
                {(field) => (
                  <Input
                    autoComplete="off"
                    maxLength={50}
                    {...field}
                    {...register('rol_nombre', {
                      required: 'Escribe el nombre del rol',
                      validate: (v) => v.trim().length >= 2 || 'Usa al menos 2 caracteres',
                    })}
                  />
                )}
              </Field>
              {!editing && isSystem ? (
                <Field label="Disponible para" hint="Un rol global lo pueden asignar todos los laboratorios.">
                  {(field) => (
                    <Select {...field} {...register('laboratory')}>
                      <option value="">Todos los laboratorios (global)</option>
                      {laboratories.map((lab) => (
                        <option key={lab.lab_id} value={lab.lab_id}>
                          Solo {lab.lab_name}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              ) : (
                <div className="flex items-end">
                  <Checkbox checked={active} onChange={setActive} label="Rol activo (se puede asignar y da permisos)" className="justify-start" />
                </div>
              )}
              <Field label="Descripción (opcional)" className="sm:col-span-2">
                {(field) => <Textarea rows={2} maxLength={200} {...field} {...register('rol_description')} />}
              </Field>
            </div>
          )}

          {isLoading ? (
            <Spinner label="Cargando módulos…" />
          ) : (
            <PermissionMatrix
              modules={modules}
              value={permissions}
              onChange={setPermissions}
              readOnly={readOnly}
              canGrant={(permission) => isSystem || can(permission)}
            />
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
