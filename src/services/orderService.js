import { laboratorioApi } from '../api';
export const createOrderDB = async (data) => {
    return await laboratorioApi.post('/orders', data);
}