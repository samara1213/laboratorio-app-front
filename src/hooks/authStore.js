// hooks/authStore.js
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../store/authSlice';

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
    localStorage.clear();
  };

  return {
    isAuthenticated,
    user,    
    startLogin,
    startLogout,
  };
}
