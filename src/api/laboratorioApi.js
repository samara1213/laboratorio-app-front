import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';
import { toast } from 'react-toastify';


const { VITE_URL_API } = getEnvVariables();

const laboratorioApi = axios.create({

    baseURL: VITE_URL_API
})

// Todo: configurar interceptores
laboratorioApi.interceptors.request.use( config => {

    config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${localStorage.getItem('auth')}`,
    }

    return config;
})

let isSessionExpired = false;

// Interceptor de respuesta para desloguear si el código es 401
laboratorioApi.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response && error.response.status === 401 && !isSessionExpired) {
            isSessionExpired = true;
            localStorage.removeItem('auth');
            toast.info('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            setTimeout(() => {
                window.location.href = '/';
                isSessionExpired = false;
            }, 3000);
        }
        return Promise.reject(error);
    }
);

export default laboratorioApi;