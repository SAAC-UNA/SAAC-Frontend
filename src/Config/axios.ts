import axios from "axios";
import { authService } from "@/Services/AuthService";

// Crear instancia con configuración personalizada
// IMPORTANTE: Usar 'localhost' (no 127.0.0.1) para consistencia con cookies
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // Enviar cookies automáticamente
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // Laravel detecta SPA
  },
});

// Interceptor para manejar errores de autenticación (sesión expirada)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Códigos 401 (No autorizado) o 419 (Token CSRF expirado) indican sesión inválida
    if (error.response && [401, 419].includes(error.response.status)) {
      // Prevenir llamadas repetitivas si ya se está redirigiendo
      if (!window.location.href.includes("/login")) {
        authService.logoutAndRedirect();
      }
    }
    return Promise.reject(error);
  },
);

// Ya NO se necesita interceptor para agregar Bearer token
// Las cookies httpOnly se envían automáticamente

export { axiosInstance };
