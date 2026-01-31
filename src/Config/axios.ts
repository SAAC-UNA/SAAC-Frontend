import axios from 'axios';

// Crear instancia con configuración personalizada
const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Interceptor para manejar el token de autenticación
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export { axiosInstance };