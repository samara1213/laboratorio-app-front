import { laboratorioApi } from '../api';

// roles visibles para el usuario (el super administrador puede filtrar por laboratorio)
export const getAllRolesDB = async (laboratory) => {
    return await laboratorioApi.get('/role', { params: laboratory ? { laboratory } : {} });
}
// catálogo de módulos para la matriz de permisos
export const getRoleModulesDB = async () => {
    return await laboratorioApi.get('/role/modules');
}
export const createRoleDB = async (data) => {
    return await laboratorioApi.post('/role', data);
}
export const updateRoleDB = async (rol_id, data) => {
    return await laboratorioApi.patch(`/role/${rol_id}`, data);
}
export const deleteRoleDB = async (rol_id) => {
    return await laboratorioApi.delete(`/role/${rol_id}`);
}
