// ChangePassword.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { changePasswordDB } from '../services';
import AuthLayout, { PasswordField } from './auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/utils';

export default function ChangePassword() {
  const { email } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await changePasswordDB(email, data.oldPassword, data.password);
      toast.success('Contraseña actualizada. Ingresa con tu nueva contraseña.');
      navigate('/');
    } catch (error) {
      toast.error(errorMessage(error, 'No fue posible cambiar la contraseña. Intenta de nuevo en unos minutos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Crea tu contraseña" description={`Es tu primer ingreso como ${email}. Cambia la contraseña que recibiste por correo.`}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <PasswordField
          id="oldPassword"
          label="Contraseña recibida por correo"
          autoComplete="current-password"
          error={errors.oldPassword?.message}
          registration={register('oldPassword', { required: 'Escribe la contraseña que recibiste' })}
        />
        <PasswordField
          id="password"
          label="Nueva contraseña"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres."
          error={errors.password?.message}
          registration={register('password', {
            required: 'Escribe la nueva contraseña',
            minLength: { value: 8, message: 'Usa al menos 8 caracteres' },
            maxLength: { value: 64, message: 'Usa máximo 64 caracteres' },
          })}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirma la nueva contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          registration={register('confirmPassword', {
            required: 'Vuelve a escribir la nueva contraseña',
            validate: (value, values) => value === values.password || 'Las contraseñas no coinciden',
          })}
        />
        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </form>
      <Link to="/" className="text-[15px] font-semibold text-primary hover:underline">
        Volver al inicio de sesión
      </Link>
    </AuthLayout>
  );
}
