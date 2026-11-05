import { laboratorioApi } from '../api';

export const getAllLaboratoriesDB = async () => {
    return await laboratorioApi.get('/laboratory');
};

export const updateLaboratoryDB = async (lab_id, data) => {
    return await laboratorioApi.patch(`/laboratory/${lab_id}`, data);
}

export const createLaboratoryDB = async (data) => {
    return await laboratorioApi.post('/laboratory', data);
};

// "Mi laboratorio": el de la sesión
export const getMyLaboratoryDB = async () => {
    return await laboratorioApi.get('/laboratory/me');
};

// logo: labId vacío = el laboratorio de la sesión; con labId lo administra el super administrador
const logoPath = (labId) => (labId ? `/laboratory/${labId}/logo` : '/laboratory/me/logo');

export const getLabLogoDB = async (labId) => {
    return await laboratorioApi.get(logoPath(labId));
};

export const uploadLabLogoDB = async (labId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await laboratorioApi.put(logoPath(labId), formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteLabLogoDB = async (labId) => {
    return await laboratorioApi.delete(logoPath(labId));
};

