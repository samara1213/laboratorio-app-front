import { laboratorioApi } from '../api';

export const getAllExamsDB = async (lab_id) => {
    return await laboratorioApi.get(`/exams/companies/${lab_id}`);
}
export const createExamDB = async (data) => {
    return await laboratorioApi.post('/exams', data);
}
export const updateExamDB = async (id, data) => {
    return await laboratorioApi.patch(`/exams/${id}`, data);
}

