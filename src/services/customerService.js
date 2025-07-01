import { laboratorioApi } from '../api';

export const createCustomerDB = async (data) => {
    return await laboratorioApi.post('/customers', data);
}
export const searchCustomerByDocumentDB = async (data) => {
    return await laboratorioApi.post(`/customers/searches`, data);
}
export const updateCustomerDB = async (customer_id, data) => {  
    return await laboratorioApi.patch(`/customers/${customer_id}`, data);
}