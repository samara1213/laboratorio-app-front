import { laboratorioApi } from '../api';

export const getAllRolesDB = async () => {
    return await laboratorioApi.get('/role');
}
export const createRoleDB = async (data) => {
    return await laboratorioApi.post('/role', data);
}
export const updateRoleDB = async (rol_id, data) => {
    return await laboratorioApi.patch(`/role/${rol_id}`, data);
}