// ForgotPassword.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { forgotPasswordDB } from '../services';
import AuthLayout from './auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

/**
 * Solicitud del enlace para crear una contraseña nueva. La respuesta es la misma
 * exista o no el correo (no revela qué correos están registrados)
 */
function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [sentMessage, setSentMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const response = await forgotPasswordDB(email.trim());
      setSentMessage(response.data.message);
    } catch (error) {
      toast.error(errorMessage(error, 'No fue posible enviar la solicitud. Intenta de nuevo en unos minutos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recupera tu acceso" description="Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.">
      {sentMessage ? (
        <div role="status" className="rounded-panel border border-border bg-surface p-5 text-[15px] leading-relaxed">
          {sentMessage}
        </div>
      ) : (
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
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? 'Enviando…' : 'Enviar enlace'}
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
