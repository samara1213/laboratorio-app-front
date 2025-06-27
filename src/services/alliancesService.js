import { laboratorioApi } from '../api';

export const getAllAlliancesDB = async (lab_id) => {
    return await laboratorioApi.get(`/alliance/laboratory/${lab_id}`);
}
export const createAllAlliancesDB = async (data) => {    
    return await laboratorioApi.post('/alliance', data)
}
export const updateAllAlliancesDB = async (lab_id, data) => {
    return await laboratorioApi.patch(`/alliance/${lab_id}`, data)
}