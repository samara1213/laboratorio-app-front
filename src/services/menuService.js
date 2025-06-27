import { laboratorioApi } from '../api';

export const getAllMenusDB = async () => {
    return await laboratorioApi.get('/menu');
}
export const getMenuByLevelDB = async (level) => {
    return await laboratorioApi.get(`/menu/${level}`);
}
export const createMenuDB = async (data) => {
    return await laboratorioApi.post('/menu', data);
}
export const updateMenuDB = async (men_id, data) => {
    return await laboratorioApi.patch(`/menu/${men_id}`, data);
}