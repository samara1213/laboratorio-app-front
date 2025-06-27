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

