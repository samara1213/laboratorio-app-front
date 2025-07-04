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
    console.log('changeStatusOrderDB', data);
    return await laboratorioApi.patch(`/orders/change/status`, data);
}