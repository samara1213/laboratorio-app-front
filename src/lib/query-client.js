import { QueryClient } from '@tanstack/react-query';

/**
 * Caché de datos del servidor (TanStack Query).
 * - Los errores 4xx no se reintentan (no van a cambiar al repetir la petición).
 * - Los datos se consideran frescos 30 s para no repetir consultas al navegar.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
