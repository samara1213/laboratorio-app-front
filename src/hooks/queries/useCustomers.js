import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCustomerDB, getCustomersDB, updateCustomerDB } from '../../services';

export const customerKeys = {
  all: ['customers'],
  list: (params) => ['customers', 'list', params],
};

/**
 * Pacientes del laboratorio paginados en el servidor; mientras llega la página nueva se muestra la anterior
 * @param {{ page: number, limit: number, search?: string }} params
 */
export function useCustomers(params) {
  return useQuery({
    queryKey: customerKeys.list(params),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { search, ...rest } = params;
      const response = await getCustomersDB({ ...rest, ...(search?.trim() && { search: search.trim() }) });
      return { data: response.data.data ?? [], meta: response.data.meta };
    },
  });
}

/**
 * Registrar o actualizar un paciente
 */
export function useSaveCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => (id ? updateCustomerDB(id, data) : createCustomerDB(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}
