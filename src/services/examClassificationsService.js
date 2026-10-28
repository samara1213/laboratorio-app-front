import { laboratorioApi } from '../api';

// clasificaciones del sistema + las del laboratorio (el super administrador puede indicar otro laboratorio)
export const getExamClassificationsDB = async (labId) => {
    return await laboratorioApi.get('/exam-classifications', { params: labId ? { laboratory: labId } : undefined });
}
export const createExamClassificationDB = async (data) => {
    return await laboratorioApi.post('/exam-classifications', data);
}
export const updateExamClassificationDB = async (id, data) => {
    return await laboratorioApi.patch(`/exam-classifications/${id}`, data);
}
