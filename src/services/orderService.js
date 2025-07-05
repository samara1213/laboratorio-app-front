import { laboratorioApi } from '../api';

export const createOrderDB = async (data) => {
    return await laboratorioApi.post('/orders', data);
}
export const getOrdersByStatusDB = async (data) => {
    return await laboratorioApi.post('/orders/laboratory', data);
}
export const deleteOrderDB = async (orderId) => {
    return await laboratorioApi.delete(`/orders/${orderId}`);
}
export const getOrderByIdDB = async (orderId) => {
    return await laboratorioApi.get(`/orders/${orderId}`);
}
export const changeStatusOrderDB = async (data) => {
    
    return await laboratorioApi.patch(`/orders/change/status`, data);
}
export const getOrdersByCustomerIdDB = async (data) => {
    return await laboratorioApi.post(`/orders/customers/laboaratory`, data);
}
export const getResultsByOrderIdDB = async (orderId) => {
    return await laboratorioApi.get(`/orders/results/${orderId}`);
}
export const generatePdfOrderDB = async (orderId) => {
    return await laboratorioApi.get(`/orders/generates/results/${orderId}`);
}
export const sendResultsOrderDB = async (orderId) => {
    return await laboratorioApi.get(`/orders/emails/${orderId}`);
}
export const getUrlPrefirredOrderDB = async (orderId) => {
    return await laboratorioApi.get(`/orders/urlprefirmate/${orderId}`);
}