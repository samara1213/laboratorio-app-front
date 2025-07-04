import { laboratorioApi } from '../api';

export const createResultDB = async (data) => {
    return await laboratorioApi.post('/results', data);
}