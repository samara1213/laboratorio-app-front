import { laboratorioApi } from '../api';

// exámenes del laboratorio de la sesión
export const getAllExamsDB = async () => {
    return await laboratorioApi.get('/exams');
}
export const createExamDB = async (data) => {
    return await laboratorioApi.post('/exams', data);
}
export const updateExamDB = async (id, data) => {
    return await laboratorioApi.patch(`/exams/${id}`, data);
}
