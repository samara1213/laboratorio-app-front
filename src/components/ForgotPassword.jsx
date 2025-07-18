// ForgotPassword.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import MuiInput from './mui/MuiInput';

function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');

  const onSubmit = (data) => {
    setMessage('Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 px-2 sm:px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#29313B] rounded-full p-3 mb-2">
            <Icon icon="ph:lock-key-fill" className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29313B] mb-1 text-center">¿Olvidaste tu contraseña?</h2>
          <p className="text-gray-500 text-sm">Ingresa tu correo para restablecer el acceso</p>
        </div>
        {message && <div className="mb-4 text-green-600 text-sm text-center">{message}</div>}
        <div className="mb-6">
          <MuiInput
            label="Correo electrónico"
            type="email"
            name="email"
            placeholder="usuario@ejemplo.com"
            {...register('email', { required: 'El correo es obligatorio', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Correo inválido' } })}
            error={errors.email?.message}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#29313B] text-white py-2 rounded-lg font-semibold hover:bg-[#1e232a] transition text-lg shadow-md"
        >
          Enviar instrucciones
        </button>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-[#29313B] hover:underline flex items-center justify-center gap-1"><Icon icon="mdi:arrow-left" className="inline w-4 h-4" /> Volver al login</Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
