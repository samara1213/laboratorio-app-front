// Login.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../hooks/authStore';
import { loginUserDB } from '../services';
import AuthLayout, { PasswordInput } from './auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

function Login() {
  const { startLogin } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await loginUserDB(data.email, data.password);
      // primer ingreso: debe cambiar la contraseña asignada antes de entrar
      if (response.data.data.use_primer_ingreso) {
        navigate(`/change-password/${encodeURIComponent(response.data.data.use_correo)}`);
        return;
      }
      startLogin(response.data.data, response.data.token);
    } catch (error) {
      toast.error(errorMessage(error, 'No fue posible iniciar sesión. Intenta de nuevo en unos minutos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Ingresa a tu cuenta" description="Usa el correo con el que te registró el administrador del laboratorio.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Field label="Correo electrónico" error={errors.email?.message} id="email">
          {(field) => (
            <Input
              type="email"
              autoComplete="username"
              placeholder="nombre@laboratorio.com"
              className="h-12"
              {...field}
              {...register('email', {
                required: 'Escribe tu correo',
                pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Revisa el correo: no tiene un formato válido' },
              })}
            />
          )}
        </Field>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="text-[15px] font-semibold">
              Contraseña
            </label>
            <Link to="/forgot-password" className="text-[15px] font-semibold text-primary hover:underline">
              ¿La olvidaste?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', { required: 'Escribe tu contraseña' })}
          />
          {errors.password && (
            <span id="password-error" className="text-sm text-danger-ink">
              {errors.password.message}
            </span>
          )}
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
      <p className="text-sm text-muted">¿No tienes cuenta? Pídela al administrador de tu laboratorio.</p>
    </AuthLayout>
  );
}

export default Login;
