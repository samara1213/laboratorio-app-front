import { laboratorioApi } from '../api';

// con responseType blob un error también llega como blob: se convierte a JSON para leer el mensaje
const withJsonError = async (request) => {
    try {
        return await request;
    } catch (error) {
        const data = error?.response?.data;
        if (data instanceof Blob) {
            try {
                error.response.data = JSON.parse(await data.text());
            } catch {
                // sin cuerpo JSON: se deja el error como llegó
            }
        }
        throw error;
    }
}

// plantillas del PDF de resultados (solo super administrador)
// laboratory: 'system' (solo del sistema), un id (solo ese laboratorio) o vacío (todas)
export const getPdfTemplatesDB = async (laboratory) => {
    return await laboratorioApi.get('/pdf-templates', { params: laboratory ? { laboratory } : undefined });
}
// plantilla base del sistema, helpers permitidos y tamaño máximo
export const getDefaultPdfTemplateDB = async () => {
    return await laboratorioApi.get('/pdf-templates/default');
}
export const getPdfTemplateDB = async (id) => {
    return await laboratorioApi.get(`/pdf-templates/${id}`);
}
// sube un .html (multipart): { file, tpl_name, tpl_description?, laboratory? }
export const createPdfTemplateDB = async ({ file, ...fields }) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(fields).forEach(([key, value]) => value && form.append(key, value));
    return await laboratorioApi.post('/pdf-templates', form);
}
// vista previa de un archivo sin guardar: devuelve el PDF (blob)
export const previewPdfTemplateFileDB = async (file, laboratory) => {
    const form = new FormData();
    form.append('file', file);
    if (laboratory) form.append('laboratory', laboratory);
    return await withJsonError(laboratorioApi.post('/pdf-templates/preview', form, { responseType: 'blob' }));
}
// vista previa de una plantilla guardada: devuelve el PDF (blob)
export const previewPdfTemplateDB = async (id) => {
    return await withJsonError(laboratorioApi.get(`/pdf-templates/${id}/preview`, { responseType: 'blob' }));
}
export const updatePdfTemplateDB = async (id, data) => {
    return await laboratorioApi.patch(`/pdf-templates/${id}`, data);
}
export const activatePdfTemplateDB = async (id) => {
    return await laboratorioApi.patch(`/pdf-templates/${id}/activate`);
}
export const deactivatePdfTemplateDB = async (id) => {
    return await laboratorioApi.patch(`/pdf-templates/${id}/deactivate`);
}
export const deletePdfTemplateDB = async (id) => {
    return await laboratorioApi.delete(`/pdf-templates/${id}`);
}
