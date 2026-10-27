import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { changeStatusOrderDB, deleteOrderDB, getOrderByIdDB, getOrdersByStatusDB, uploadFile } from '../../services';

// estados que se consideran "en curso" en el dashboard, en el orden de la gradilla
export const ACTIVE_STATUSES = ['PENDIENTE', 'PROCESANDO', 'ORDEN CON ADJUNTO', 'PENDIENTE PDF'];

export const orderKeys = {
  all: ['orders'],
  active: (labId) => ['orders', 'active', labId],
  detail: (orderId) => ['orders', 'detail', orderId],
};

/**
 * Órdenes en curso del laboratorio (una consulta por estado, en paralelo)
 * @param {string} labId laboratorio del usuario
 */
export function useActiveOrders(labId) {
  return useQuery({
    queryKey: orderKeys.active(labId),
    enabled: Boolean(labId),
    queryFn: async () => {
      const responses = await Promise.all(ACTIVE_STATUSES.map((ord_status) => getOrdersByStatusDB({ ord_status })));
      return responses.flatMap((res) => res.data?.data ?? []);
    },
  });
}

/**
 * Detalle de una orden (exámenes y parámetros); se pide solo cuando hay id
 */
export function useOrder(orderId) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    enabled: Boolean(orderId),
    queryFn: async () => (await getOrderByIdDB(orderId)).data.data,
  });
}

/**
 * Cancelar una orden
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => deleteOrderDB(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

/**
 * Cambiar el estado de una orden
 */
export function useChangeOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ord_id, ord_status }) => changeStatusOrderDB({ ord_id, ord_status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

/**
 * Adjuntar un archivo a la orden y marcarla "con adjunto"
 */
export function useAttachFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, file }) => {
      const response = await uploadFile(file, orderId);
      await changeStatusOrderDB({ ord_id: orderId, ord_status: 'ORDEN CON ADJUNTO' });
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
