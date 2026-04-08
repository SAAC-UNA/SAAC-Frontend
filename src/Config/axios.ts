import axios, { AxiosHeaders } from "axios";
import { authService } from "@/Services/AuthService";
import { getOperationalContextSnapshot } from "@/Services/OperationalContextStore";

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

const shouldAttachOperationalContext = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  return !(
    url.startsWith("/contexto/filtros-globales") ||
    url.startsWith("/auth/") ||
    url.startsWith("/sanctum/")
  );
};

axiosInstance.interceptors.request.use((config) => {
  if (!shouldAttachOperationalContext(config.url)) {
    return config;
  }

  const contextIds = getOperationalContextSnapshot();
  if (!contextIds) {
    return config;
  }

  const headerPatch: Record<string, string> = {};

  if (contextIds.careerCampusId !== null) {
    headerPatch["X-Context-Career-Campus-Id"] = String(
      contextIds.careerCampusId,
    );
  }
  if (contextIds.cycleId !== null) {
    headerPatch["X-Context-Cycle-Id"] = String(contextIds.cycleId);
  }
  if (contextIds.processId !== null) {
    headerPatch["X-Context-Process-Id"] = String(contextIds.processId);
  }

  const headers = config.headers ?? AxiosHeaders.from({});
  for (const [key, value] of Object.entries(headerPatch)) {
    headers.set(key, value);
  }
  config.headers = headers;

  if (String(config.method || "get").toLowerCase() === "get") {
    const params = (config.params ?? {}) as Record<string, unknown>;
    config.params = {
      ...params,
      ...(contextIds.careerCampusId !== null
        ? { career_campus_id: contextIds.careerCampusId }
        : {}),
      ...(contextIds.cycleId !== null
        ? { ciclo_acreditacion_id: contextIds.cycleId }
        : {}),
      ...(contextIds.processId !== null
        ? { proceso_id: contextIds.processId }
        : {}),
    };
  }

  return config;
});

// Interceptor para manejar errores de autenticación (sesión expirada)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipSessionRedirect =
      error?.config?.headers?.["X-Skip-Session-Redirect"] === "true";

    // Códigos 401 (No autorizado) o 419 (Token CSRF expirado) indican sesión inválida
    if (
      !skipSessionRedirect &&
      error.response &&
      [401, 419].includes(error.response.status)
    ) {
      // Prevenir llamadas repetitivas si ya se está redirigiendo
      if (!window.location.href.includes("/login")) {
        authService.logoutAndRedirect();
      }

      // Importante: no dejar la promesa pendiente, para evitar loaders infinitos.
      // Se mantiene la redirección, pero el caller puede ejecutar catch/finally.
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

// Ya NO se necesita interceptor para agregar Bearer token
// Las cookies httpOnly se envían automáticamente

export { axiosInstance };
