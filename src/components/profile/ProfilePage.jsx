import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import LayoutDashboard from '../dashboard/LayoutDashboard';
import SignatureField from './SignatureField';
import { useAuthStore } from '../../hooks/authStore';
import { useUpdateProfile } from '../../hooks/queries/useProfile';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { errorMessage } from '@/lib/utils';

const FIELDS = ['use_primer_nombre', 'use_primer_apellido', 'use_documento', 'use_telefono', 'use_cargo', 'use_registro_profesional'];

/**
 * "Mi perfil": datos del usuario, cargo y registro profesional (van bajo la firma en
 * el PDF) y su firma
 */
export default function ProfilePage() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    reset(Object.fromEntries(FIELDS.map((key) => [key, user?.[key] ?? ''])));
  }, [user, reset]);

  const onSubmit = (values) => {
    const data = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
    updateProfile.mutate(data, {
      onSuccess: (response) => toast.success(response.data.message || 'Datos actualizados'),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar tus datos.')),
    });
  };

  const required = (message) => ({ validate: (v) => v.trim() !== '' || message });

  return (
    <LayoutDashboard title="Mi perfil">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <Panel>
          <PanelHeader title="Tus datos" description={`${user?.use_correo ?? ''} · ${user?.role?.rol_nombre ?? ''}`} />
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5" noValidate>
            <Field label="Nombre" error={errors.use_primer_nombre?.message}>
              {(field) => <Input autoComplete="given-name" maxLength={50} {...field} {...register('use_primer_nombre', required('Escribe tu nombre'))} />}
            </Field>
            <Field label="Apellido" error={errors.use_primer_apellido?.message}>
              {(field) => <Input autoComplete="family-name" maxLength={50} {...field} {...register('use_primer_apellido', required('Escribe tu apellido'))} />}
            </Field>
            <Field label="Documento">
              {(field) => <Input inputMode="numeric" maxLength={20} {...field} {...register('use_documento')} />}
            </Field>
            <Field label="Teléfono">
              {(field) => <Input type="tel" autoComplete="tel" maxLength={20} {...field} {...register('use_telefono')} />}
            </Field>
            <Field label="Cargo" hint="Aparece bajo tu firma. Ejemplo: Bacterióloga">
              {(field) => <Input maxLength={60} {...field} {...register('use_cargo')} />}
            </Field>
            <Field label="Registro profesional" hint="Aparece bajo tu firma.">
              {(field) => <Input maxLength={40} {...field} {...register('use_registro_profesional')} />}
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
                {updateProfile.isPending ? 'Guardando…' : 'Guardar datos'}
              </Button>
            </div>
          </form>
        </Panel>

        <Panel>
          <PanelHeader title="Tu firma" />
          <div className="p-4 sm:p-5">
            <SignatureField />
          </div>
        </Panel>
      </div>
    </LayoutDashboard>
  );
}
