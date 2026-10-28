import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createExamClassificationDB, getAllExamsDB, getExamClassificationsDB, updateExamClassificationDB } from '../../services';

export const catalogKeys = {
  exams: ['catalog', 'exams'],
  classifications: (labId) => ['catalog', 'classifications', labId ?? 'propio'],
};

/**
 * Exámenes del laboratorio de la sesión (para armar órdenes)
 */
export function useExams() {
  return useQuery({
    queryKey: catalogKeys.exams,
    staleTime: 5 * 60_000,
    queryFn: async () => (await getAllExamsDB()).data.data ?? [],
  });
}

/**
 * Clasificaciones de exámenes (secciones del PDF): las del sistema + las del laboratorio.
 * El super administrador puede indicar otro laboratorio
 */
export function useExamClassifications(labId, { enabled = true } = {}) {
  return useQuery({
    queryKey: catalogKeys.classifications(labId),
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => (await getExamClassificationsDB(labId)).data.data ?? [],
  });
}

/**
 * Crea o actualiza una clasificación (también refresca los exámenes, que muestran su nombre)
 */
export function useSaveExamClassification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => (id ? updateExamClassificationDB(id, data) : createExamClassificationDB(data)),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['catalog', 'classifications'] }),
        queryClient.invalidateQueries({ queryKey: catalogKeys.exams }),
      ]),
  });
}
