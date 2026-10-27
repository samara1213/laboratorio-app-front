import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { useSaveUser } from '../../../hooks/queries/useAdmin';
import { errorMessage } from '@/lib/utils';

const EMPTY = { use_primer_nombre: '', use_primer_apellido: '', use_correo: '', use_documento: '', use_telefono: '', use_cargo: '', use_registro_profesional: '', role: '' };

/**
 * Crear o editar un usuario. Solo se ofrecen los roles que el administrador puede asignar
 * @param {{ open: boolean, onClose: () => void, user?: object, roles: object[], laboratoryId?: string, isSelf?: boolean }} props
 */
export default function UserFormDialog({ open, onClose, user, roles, laboratoryId, isSelf = false }) {
  const saveUser = useSaveUser();
  const editing = Boolean(user);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? {
            use_primer_nombre: user.use_primer_nombre ?? '',
            use_primer_apellido: user.use_primer_apellido ?? '',
            use_correo: user.use_correo ?? '',
            use_documento: user.use_documento ?? '',
            use_telefono: user.use_telefono ?? '',
            use_cargo: user.use_cargo ?? '',
            use_registro_profesional: user.use_registro_profesional ?? '',
            role: user.role?.rol_id ?? '',
          }
        : EMPTY,
    );
  }, [open, user, reset]);

  // el rol actual siempre aparece, aunque el administrador no pueda asignarlo
  const options = roles.filter((role) => role.assignable || role.rol_id === user?.role?.rol_id);

  const onSubmit = (values) => {
    const data = { ...values };
    for (const key of ['use_documento', 'use_telefono', 'use_cargo', 'use_registro_profesional']) if (!data[key]) delete data[key];
    if (editing && data.role === user.role?.rol_id) delete data.role;
    if (!editing && laboratoryId) data.laboratory = laboratoryId;

    saveUser.mutate(
      { id: user?.use_id, data },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || (editing ? 'Usuario actualizado' : 'Usuario creado'));
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar el usuario.')),
      },
    );
  };

  const required = (message) => ({ required: message, validate: (v) => v.trim() !== '' || message });

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="xl"
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        description={editing ? undefined : 'Recibirá por correo una contraseña temporal que deberá cambiar al ingresar.'}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="user-form" disabled={saveUser.isPending}>
              {saveUser.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Nombre" error={errors.use_primer_nombre?.message}>
            {(field) => <Input autoComplete="off" maxLength={50} {...field} {...register('use_primer_nombre', required('Escribe el nombre'))} />}
          </Field>
          <Field label="Apellido" error={errors.use_primer_apellido?.message}>
            {(field) => <Input autoComplete="off" maxLength={50} {...field} {...register('use_primer_apellido', required('Escribe el apellido'))} />}
          </Field>
          <Field label="Correo electrónico" error={errors.use_correo?.message} className="sm:col-span-2">
            {(field) => (
              <Input
                type="email"
                autoComplete="off"
                maxLength={120}
                {...field}
                {...register('use_correo', {
                  required: 'Escribe el correo',
                  pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Revisa el correo: no tiene un formato válido' },
                })}
              />
            )}
          </Field>
          <Field label="Documento (opcional)">
            {(field) => <Input inputMode="numeric" autoComplete="off" maxLength={20} {...field} {...register('use_documento')} />}
          </Field>
          <Field label="Teléfono (opcional)">
            {(field) => <Input type="tel" autoComplete="off" maxLength={20} {...field} {...register('use_telefono')} />}
          </Field>
          <Field label="Cargo (opcional)" hint="Aparece bajo su firma en el PDF.">
            {(field) => <Input autoComplete="off" maxLength={60} {...field} {...register('use_cargo')} />}
          </Field>
          <Field label="Registro profesional (opcional)">
            {(field) => <Input autoComplete="off" maxLength={40} {...field} {...register('use_registro_profesional')} />}
          </Field>
          <Field
            label="Rol"
            error={errors.role?.message}
            hint={isSelf ? 'No puedes cambiar tu propio rol.' : 'Solo aparecen los roles que puedes asignar.'}
            className="sm:col-span-2"
          >
            {(field) => (
              <Select disabled={isSelf} {...field} {...register('role', { required: 'Elige un rol' })}>
                <option value="">Elige un rol</option>
                {options.map((role) => (
                  <option key={role.rol_id} value={role.rol_id}>
                    {role.rol_nombre}
                    {role.laboratory ? '' : ' (global)'}
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
