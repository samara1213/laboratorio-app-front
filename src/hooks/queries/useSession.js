import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { getMeDB } from '../../services';
import { loginSuccess } from '../../store/authSlice';

export const sessionKey = ['session'];

/**
 * Mantiene al día la sesión (permisos y menú) con /auth/me: al entrar, al volver
 * a la pestaña y cada 5 minutos. Así un cambio de rol se aplica sin cerrar sesión
 * @param {boolean} enabled hay sesión iniciada
 */
export function useSession(enabled) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: sessionKey,
    enabled,
    queryFn: async () => (await getMeDB()).data.data,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (query.data) dispatch(loginSuccess({ user: query.data }));
  }, [query.data, dispatch]);

  return query;
}
