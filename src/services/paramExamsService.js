import { laboratorioApi } from '../api';

export const getAllParamExamsDB = async (exa_id) => {
    return await laboratorioApi.get(`/params-exams/exam/${exa_id}`);
}

export const createParamExamDB = async (data) => {
    return await laboratorioApi.post('/params-exams', data);
};

export const updateParamExamDB = async (par_id, data) => {
    return await laboratorioApi.patch(`/params-exams/${par_id}`, data);
};