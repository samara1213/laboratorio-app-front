import { laboratorioApi } from '../api';

// convenios del laboratorio de la sesión
export const getAllAlliancesDB = async () => {
    return await laboratorioApi.get('/alliance');
}
export const createAllAlliancesDB = async (data) => {
    return await laboratorioApi.post('/alliance', data)
}
export const updateAllAlliancesDB = async (ali_id, data) => {
    return await laboratorioApi.patch(`/alliance/${ali_id}`, data)
}
