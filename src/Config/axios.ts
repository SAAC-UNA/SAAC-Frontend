import axios from 'axios';

// Crear instancia con configuración personalizada
// IMPORTANTE: Usar 'localhost' (no 127.0.0.1) para consistencia con cookies
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true, // Enviar cookies automáticamente
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Laravel detecta SPA
    }
});

// Ya NO se necesita interceptor para agregar Bearer token
// Las cookies httpOnly se envían automáticamente

export { axiosInstance };