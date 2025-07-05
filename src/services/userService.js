import { laboratorioApi } from '../api';

export const getAllUsersDB = async (lab_id) => {
    return await laboratorioApi.get(`/auth/${lab_id}`);
};
export const createUserDB = async (data) => {
    return await laboratorioApi.post(`/auth/register`, data);
};
export const updateUserDB = async (id_user,user) => { 
    return await laboratorioApi.patch(`/auth/${id_user}`, user);
};