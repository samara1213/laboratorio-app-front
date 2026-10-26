// hooks/authStore.js
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../store/authSlice';
import { queryClient } from '../lib/query-client';

export function useAuthStore() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const startLogin = (user, token) => {
    dispatch(loginSuccess({ user }));
    if (token) {
      localStorage.setItem('auth', token);
    }
  };

  const startLogout = () => {
    dispatch(logout());
    // el reducer logout ya borra la sesión; se conservan preferencias como el tema.
    // se vacía la caché para que el siguiente usuario no vea datos del anterior
    queryClient.clear();
  };

  return {
    isAuthenticated,
    user,    
    startLogin,
    startLogout,
  };
}
