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
// adjuntos de una orden (sin la ruta del archivo)
export const getAttachmentsDB = async (orderId) => {
    return await laboratorioApi.get('/attached/order/' + orderId);
};
// URL temporal (10 min) para ver un adjunto: no se guarda
export const getAttachmentUrlDB = async (attId) => {
    return await laboratorioApi.get('/attached/' + attId + '/url');
};
export const deleteAttachmentDB = async (attId) => {
    return await laboratorioApi.delete('/attached/' + attId);
};
