import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getResultsByOrderIdDB, saveResultsBatchDB } from '../../services';
import { orderKeys } from './useOrders';

export const resultKeys = {
  order: (orderId) => ['results', orderId],
};

/**
 * Orden con sus exámenes, parámetros, resultados y el firmante de cada examen
 */
export function useOrderResults(orderId) {
  return useQuery({
    queryKey: resultKeys.order(orderId),
    enabled: Boolean(orderId),
    queryFn: async () => (await getResultsByOrderIdDB(orderId)).data.data,
  });
}

/**
 * Guarda todos los resultados de la orden en una sola petición
 */
export function useSaveResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => saveResultsBatchDB(data),
    onSuccess: (_response, { order }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: resultKeys.order(order) }),
        // la orden cambia a "Pendiente de PDF"
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
      ]),
  });
}
