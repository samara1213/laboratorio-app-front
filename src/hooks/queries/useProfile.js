import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteSignatureDB, getSignatureDB, updateProfileDB, uploadSignatureDB } from '../../services';
import { sessionKey } from './useSession';

// userId vacío = el usuario de la sesión
export const signatureKey = (userId) => ['signature', userId ?? 'propia'];

/**
 * URL temporal (5 min) para ver la firma; null si no tiene
 */
export function useSignature(userId, { enabled = true } = {}) {
  return useQuery({
    queryKey: signatureKey(userId),
    enabled,
    staleTime: 4 * 60_000,
    queryFn: async () => (await getSignatureDB(userId)).data.data.url,
  });
}

/**
 * Tras cambiar una firma se refresca su vista previa, la sesión (tiene firma o no)
 * y la lista de usuarios
 */
function useSignatureMutation(mutationFn, userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: signatureKey(userId) }),
        queryClient.invalidateQueries({ queryKey: sessionKey }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
      ]),
  });
}

export const useUploadSignature = (userId) => useSignatureMutation((file) => uploadSignatureDB(userId, file), userId);

export const useDeleteSignature = (userId) => useSignatureMutation(() => deleteSignatureDB(userId), userId);

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateProfileDB(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionKey }),
  });
}
