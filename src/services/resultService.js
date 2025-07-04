import { laboratorioApi } from '../api';

export const createResultDB = async (data) => {
    return await laboratorioApi.post('/results', data);
}
export const updateResultExamDB = async (examId, data) => {
    return await laboratorioApi.patch(`/results/${examId}`, data);
}