import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activatePdfTemplateDB,
  createPdfTemplateDB,
  deactivatePdfTemplateDB,
  deletePdfTemplateDB,
  getDefaultPdfTemplateDB,
  getPdfTemplatesDB,
  updatePdfTemplateDB,
} from '../../services';

// plantillas del PDF de resultados (solo super administrador)
export const pdfTemplateKeys = {
  list: (filter) => ['pdf-templates', 'list', filter ?? 'todas'],
  base: ['pdf-templates', 'base'],
};

/**
 * Plantillas registradas (sin contenido)
 * @param {string} [filter] 'system', un id de laboratorio o vacío (todas)
 */
export function usePdfTemplates(filter) {
  return useQuery({
    queryKey: pdfTemplateKeys.list(filter),
    queryFn: async () => (await getPdfTemplatesDB(filter)).data.data ?? [],
  });
}

/**
 * Plantilla base del sistema, helpers permitidos y tamaño máximo (no cambian mientras corre el backend)
 */
export function useBasePdfTemplate({ enabled = true } = {}) {
  return useQuery({
    queryKey: pdfTemplateKeys.base,
    enabled,
    staleTime: Infinity,
    queryFn: async () => (await getDefaultPdfTemplateDB()).data.data,
  });
}

function useTemplateMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pdf-templates', 'list'] }),
  });
}

export const useCreatePdfTemplate = () => useTemplateMutation(createPdfTemplateDB);
export const useUpdatePdfTemplate = () => useTemplateMutation(({ id, data }) => updatePdfTemplateDB(id, data));
export const useTogglePdfTemplate = () =>
  useTemplateMutation(({ id, active }) => (active ? activatePdfTemplateDB(id) : deactivatePdfTemplateDB(id)));
export const useDeletePdfTemplate = () => useTemplateMutation(deletePdfTemplateDB);
