import { laboratorioApi } from '../api';

export const createResultDB = async (data) => {
    return await laboratorioApi.post('/results', data);
}
export const updateResultExamDB = async (examId, data) => {
    return await laboratorioApi.patch(`/results/${examId}`, data);
}
// todos los resultados de una orden en una transacción: { order, results: [{ exam, param, res_value, res_observation, res_reference }] }
export const saveResultsBatchDB = async (data) => {
    return await laboratorioApi.post('/results/batch', data);
}
