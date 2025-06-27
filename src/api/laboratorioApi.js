import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';


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

export default laboratorioApi;