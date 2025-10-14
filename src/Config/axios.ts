import axios from 'axios';

// URL base del backend de Laravel
axios.defaults.baseURL = 'http://localhost:8000';

// Headers por defecto
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Interceptor para manejar CSRF token si es necesario
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);