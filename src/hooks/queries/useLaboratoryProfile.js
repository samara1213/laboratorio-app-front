import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteLabLogoDB, getLabLogoDB, getMyLaboratoryDB, uploadLabLogoDB } from '../../services';
import { sessionKey } from './useSession';

// labId vacío = el laboratorio de la sesión ("Mi laboratorio")
export const labLogoKey = (labId) => ['laboratory', 'logo', labId ?? 'propio'];
const myLaboratoryKey = ['laboratory', 'me'];

/**
 * Datos del laboratorio de la sesión (sin rutas del bucket; has_logo indica si tiene logo)
 */
export function useMyLaboratory() {
  return useQuery({ queryKey: myLaboratoryKey, queryFn: async () => (await getMyLaboratoryDB()).data.data });
}

/**
 * URL temporal (5 min) para ver el logo; null si no tiene
 */
export function useLabLogo(labId, { enabled = true } = {}) {
  return useQuery({
    queryKey: labLogoKey(labId),
    enabled,
    staleTime: 4 * 60_000,
    queryFn: async () => (await getLabLogoDB(labId)).data.data.url,
  });
}

/**
 * Tras cambiar el logo se refrescan su vista previa, el laboratorio, la sesión y la lista de laboratorios
 */
function useLogoMutation(mutationFn, labId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: labLogoKey(labId) }),
        queryClient.invalidateQueries({ queryKey: myLaboratoryKey }),
        queryClient.invalidateQueries({ queryKey: sessionKey }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'laboratories'] }),
      ]),
  });
}

export const useUploadLabLogo = (labId) => useLogoMutation((file) => uploadLabLogoDB(labId, file), labId);

export const useDeleteLabLogo = (labId) => useLogoMutation(() => deleteLabLogoDB(labId), labId);
