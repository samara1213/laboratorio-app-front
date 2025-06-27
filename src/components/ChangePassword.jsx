// ChangePassword.jsx
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { changePasswordDB } from '../services';
import MuiInput from './mui/MuiInput';

export default function ChangePassword() {
  const { email } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    
    try {

      setLoading(true);
      const response = await changePasswordDB(email, data.oldPassword, data.password);
      setLoading(false);
      navigate('/');

    } catch (error) {

      console.log('Error al cambiar la contraseña:', error);
      setLoading(false);
      toast.error('Error al cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.');
      
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 px-2 sm:px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#29313B] rounded-full p-3 mb-2">
            <Icon icon="mdi:lock-reset" className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29313B] mb-1 text-center">Cambiar Contraseña</h2>
          <p className="text-gray-500 text-sm">Usuario: <span className="font-semibold">{email}</span></p>
        </div>
        <div className="mb-4">
          <MuiInput
            label="Contraseña anterior"
            type="password"
            name="oldPassword"
            placeholder="••••••••"
            {...register('oldPassword', { required: 'La contraseña anterior es obligatoria' })}
            error={errors.oldPassword?.message}
          />
        </div>
        <div className="mb-4">
          <MuiInput
            label="Nueva contraseña"
            type="password"
            name="password"
            placeholder="••••••••"
            {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
            error={errors.password?.message}
          />
        </div>
        <div className="mb-6">
          <MuiInput
            label="Confirmar contraseña"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: value => value === watch('password') || 'Las contraseñas no coinciden',
            })}
            error={errors.confirmPassword?.message}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#29313B] text-white py-2 rounded-lg font-semibold hover:bg-[#1e232a] transition text-lg shadow-md disabled:opacity-60"
        >
          {loading ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}
