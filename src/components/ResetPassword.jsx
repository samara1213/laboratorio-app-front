// ResetPassword.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { resetPasswordDB } from '../services';
import AuthLayout, { PasswordField } from './auth/AuthLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { errorMessage } from '@/lib/utils';

/**
 * Crear contraseña nueva con el enlace del correo de recuperación (?token=...)
 */
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const validLink = /^[0-9a-f]{64}$/i.test(token);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await resetPasswordDB(token, data.password);
      toast.success(response.data.message || 'Contraseña actualizada. Ya puedes ingresar.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, 'No fue posible cambiar la contraseña. Intenta de nuevo en unos minutos.'));
    } finally {
      setLoading(false);
    }
  };

  if (!validLink) {
    return (
      <AuthLayout title="El enlace no es válido" description="Revisa que abriste el enlace completo del correo, o solicita uno nuevo.">
        <Link to="/forgot-password" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
          Solicitar un enlace nuevo
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crea una contraseña nueva" description="El enlace vence 30 minutos después de solicitarlo y solo se puede usar una vez.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
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
