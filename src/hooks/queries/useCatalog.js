import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAllAlliancesDB,
  createExamClassificationDB,
  createExamDB,
  createParamExamDB,
  getAllAlliancesDB,
  getAllExamsDB,
  getAllParamExamsDB,
  getExamClassificationsDB,
  updateAllAlliancesDB,
  updateExamClassificationDB,
  updateExamDB,
  updateParamExamDB,
} from '../../services';

export const catalogKeys = {
  exams: ['catalog', 'exams'],
  classifications: (labId) => ['catalog', 'classifications', labId ?? 'propio'],
  alliances: ['catalog', 'alliances'],
  parameters: (examId) => ['catalog', 'parameters', examId],
};

/**
 * Mutación del catálogo que al terminar refresca las consultas indicadas (por prefijo)
 */
function useCatalogMutation(mutationFn, invalidate) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}

/**
 * Crear o editar un examen
 */
export const useSaveExam = () =>
  useCatalogMutation(({ id, data }) => (id ? updateExamDB(id, data) : createExamDB(data)), [catalogKeys.exams, ['catalog', 'classifications']]);

/**
 * Convenios del laboratorio de la sesión
 */
export function useAlliances({ enabled = true } = {}) {
  return useQuery({
    queryKey: catalogKeys.alliances,
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => (await getAllAlliancesDB()).data.data ?? [],
  });
}

/**
 * Crear o editar un convenio (los exámenes muestran su nombre)
 */
export const useSaveAlliance = () =>
  useCatalogMutation(({ id, data }) => (id ? updateAllAlliancesDB(id, data) : createAllAlliancesDB(data)), [catalogKeys.alliances, catalogKeys.exams]);

/**
 * Parámetros de un examen (en el orden del PDF)
 */
export function useExamParameters(examId) {
  return useQuery({
    queryKey: catalogKeys.parameters(examId),
    enabled: Boolean(examId),
    queryFn: async () => (await getAllParamExamsDB(examId)).data.data ?? [],
  });
}

/**
 * Crear o editar un parámetro (los exámenes muestran cuántos tienen)
 */
export const useSaveParameter = () =>
  useCatalogMutation(({ id, data }) => (id ? updateParamExamDB(id, data) : createParamExamDB(data)), [['catalog', 'parameters'], catalogKeys.exams]);

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
