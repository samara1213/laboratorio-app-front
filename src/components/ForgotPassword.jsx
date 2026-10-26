// ForgotPassword.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from './auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';

// La recuperación por correo se implementa en el backend en la Fase 3 (T3.3);
// mientras tanto la pantalla indica que se debe pedir al administrador.
function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout title="Recupera tu acceso" description="Escribe el correo de tu cuenta.">
      {sent ? (
        <div role="status" className="rounded-panel border border-border bg-surface p-5 text-[15px]">
          Por ahora el restablecimiento lo hace el administrador de tu laboratorio. Contáctalo para que te asigne una contraseña temporal.
        </div>
      ) : (
        <form onSubmit={handleSubmit(() => setSent(true))} className="flex flex-col gap-5" noValidate>
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
          <Button type="submit" size="lg" className="w-full">
            Continuar
          </Button>
        </form>
      )}
      <Link to="/" className="text-[15px] font-semibold text-primary hover:underline">
        Volver al inicio de sesión
      </Link>
    </AuthLayout>
  );
}

export default ForgotPassword;
