import { laboratorioApi } from '../api';

// usuarios del laboratorio de la sesión (el super administrador puede pedir otro laboratorio)
export const getAllUsersDB = async (laboratory) => {
    return await laboratorioApi.get('/auth/users', { params: laboratory ? { laboratory } : {} });
};
export const createUserDB = async (data) => {
    return await laboratorioApi.post(`/auth/register`, data);
};
export const updateUserDB = async (id_user, user) => {
    return await laboratorioApi.patch(`/auth/${id_user}`, user);
};
export const changeUserStatusDB = async (id_user, use_estado) => {
    return await laboratorioApi.patch(`/auth/${id_user}/status`, { use_estado });
};
export const resetUserPasswordDB = async (id_user) => {
    return await laboratorioApi.post(`/auth/${id_user}/reset-password`);
};
