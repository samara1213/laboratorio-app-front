import { laboratorioApi } from '../api';

export const uploadFile = async (file, orderId) => {
    const formData = new FormData();
    formData.append('file', file);    
    return await laboratorioApi.post(`/attached/upload/${orderId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};