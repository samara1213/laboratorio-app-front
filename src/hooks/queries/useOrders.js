import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeStatusOrderDB,
  deleteAttachmentDB,
  deleteOrderDB,
  generatePdfOrderDB,
  getAttachmentsDB,
  getOrderByIdDB,
  getOrdersByStatusDB,
  searchOrdersDB,
  sendResultsOrderDB,
  uploadFile,
} from '../../services';

// estados que se consideran "en curso" en el dashboard, en el orden de la gradilla
export const ACTIVE_STATUSES = ['PENDIENTE', 'PROCESANDO', 'ORDEN CON ADJUNTO', 'PENDIENTE PDF'];

// estados en los que adjuntar un archivo marca la orden "con adjunto" (después ya no cambia el estado)
const ATTACH_MARKS_STATUS = ['PENDIENTE', 'PROCESANDO'];

export const orderKeys = {
  all: ['orders'],
  active: (labId) => ['orders', 'active', labId],
  search: (params) => ['orders', 'search', params],
  detail: (orderId) => ['orders', 'detail', orderId],
  attachments: (orderId) => ['orders', 'attachments', orderId],
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
 * Búsqueda paginada en el servidor; mientras llega la página nueva se muestra la anterior
 * @param {{ page: number, limit: number, search?: string, status?: string[], from?: string, to?: string }} params
 * @returns {{ data?: { data: object[], meta: { page, limit, total, pages, status_counts } } }}
 */
export function useOrderSearch(params) {
  return useQuery({
    queryKey: orderKeys.search(params),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { status, search, from, to, ...rest } = params;
      const response = await searchOrdersDB({
        ...rest,
        ...(search?.trim() && { search: search.trim() }),
        ...(status?.length && { status: status.join(',') }),
        ...(from && { from }),
        ...(to && { to }),
      });
      return { data: response.data.data ?? [], meta: response.data.meta };
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
 * Mutación sobre órdenes que al terminar refresca los listados
 */
function useOrderMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

/**
 * Cancelar una orden
 */
export const useCancelOrder = () => useOrderMutation((orderId) => deleteOrderDB(orderId));

/**
 * Cambiar el estado de una orden
 */
export const useChangeOrderStatus = () => useOrderMutation(({ ord_id, ord_status }) => changeStatusOrderDB({ ord_id, ord_status }));

/**
 * Generar (o volver a generar) el PDF de resultados
 */
export const useGeneratePdf = () => useOrderMutation((orderId) => generatePdfOrderDB(orderId));

/**
 * Enviar el enlace del PDF al correo del paciente
 */
export const useSendResults = () => useMutation({ mutationFn: (orderId) => sendResultsOrderDB(orderId) });

/**
 * Adjuntos de una orden
 */
export function useAttachments(orderId) {
  return useQuery({
    queryKey: orderKeys.attachments(orderId),
    enabled: Boolean(orderId),
    queryFn: async () => (await getAttachmentsDB(orderId)).data.data ?? [],
  });
}

/**
 * Adjuntar un archivo a la orden (reemplaza el anterior). Si la orden aún no se procesa,
 * queda "con adjunto"
 */
export const useAttachFile = () =>
  useOrderMutation(async ({ order, file }) => {
    const response = await uploadFile(file, order.ord_id);
    if (ATTACH_MARKS_STATUS.includes(order.ord_status))
      await changeStatusOrderDB({ ord_id: order.ord_id, ord_status: 'ORDEN CON ADJUNTO' });
    return response;
  });

/**
 * Eliminar un adjunto (y su archivo)
 */
export const useDeleteAttachment = () => useOrderMutation((attId) => deleteAttachmentDB(attId));
