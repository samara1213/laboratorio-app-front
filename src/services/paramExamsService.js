import { laboratorioApi } from '../api';

export const getAllParamExamsDB = async (exa_id) => {
    return await laboratorioApi.get(`/params-exams/exam/${exa_id}`);
}