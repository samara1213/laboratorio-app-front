// Login.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '../hooks/authStore';
import { loginUserDB } from '../services';
import MuiInput from './mui/MuiInput';

function Login() {
  const { startLogin } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setError('');   

    try {
      const response = await loginUserDB(data.email, data.password);      
      if (response.data.data.use_primer_ingreso) {
       navigate(`/change-password/${encodeURIComponent(response.data.data.use_correo)}`);
       return;
      }
      startLogin(response.data.data, response.data.token);
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      if (error.response.status === 401) {
        toast.error(error.response.data.message || 'Credenciales incorrectas');
      } else {
        toast.error('Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 px-2 sm:px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#29313B] rounded-full p-3 mb-2">
            <Icon icon="ph:flask-fill" className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29313B] mb-1 text-center">Iniciar Sesión</h2>
          <p className="text-gray-500 text-sm">Accede a tu cuenta del laboratorio</p>
        </div>
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <div className="mb-4">
          <MuiInput
            label="Correo electrónico"
            type="email"
            name="email"
            placeholder="usuario@ejemplo.com"
            {...register('email', { required: 'El correo es obligatorio', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Correo inválido' } })}
            error={errors.email?.message}
          />
        </div>
        <div className="mb-6">
          <MuiInput
            label="Contraseña"
            type="password"
            name="password"
            placeholder="••••••••"
            {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
            error={errors.password?.message}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#29313B] text-white py-2 rounded-lg font-semibold hover:bg-[#1e232a] transition text-lg shadow-md"
        >
          Ingresar
        </button>
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-[#29313B] hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
