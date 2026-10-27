import { laboratorioApi } from '../api';

export const getAllMenusDB = async () => {
    return await laboratorioApi.get('/menu');
}
export const createMenuDB = async (data) => {
    return await laboratorioApi.post('/menu', data);
}
export const updateMenuDB = async (men_id, data) => {
    return await laboratorioApi.patch(`/menu/${men_id}`, data);
}
// mueve la opción antes ('up') o después ('down') de su vecina
export const moveMenuDB = async (men_id, direction) => {
    return await laboratorioApi.patch(`/menu/${men_id}/move`, { direction });
}
export const deleteMenuDB = async (men_id) => {
    return await laboratorioApi.delete(`/menu/${men_id}`);
}
