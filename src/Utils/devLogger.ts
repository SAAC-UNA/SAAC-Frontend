/**
 * Utilidades para logging en desarrollo
 * Evita spam en la consola cuando se usa fallback a datos mock
 * (se agregó para EvidenceAssignment pero puede ser útil en otros lados)
 */

// Cache para evitar logs repetitivos
const logCache = new Set<string>();

interface DevLogOptions {
  once?: boolean; // Solo loggear una vez por sesión
  force?: boolean; // Forzar el log aunque ya se haya mostrado
}

export const devLog = {
  info: (message: string, options: DevLogOptions = {}) => {
    if (!import.meta.env.DEV) return;
    
    const key = `info:${message}`;
    if (options.once && logCache.has(key) && !options.force) return;
    
    console.log(`🔧 [DEV] ${message}`);
    
    if (options.once) {
      logCache.add(key);
    }
  },

  warn: (message: string, options: DevLogOptions = {}) => {
    if (!import.meta.env.DEV) return;
    
    const key = `warn:${message}`;
    if (options.once && logCache.has(key) && !options.force) return;
    
    console.warn(`🔧 [DEV] ${message}`);
    
    if (options.once) {
      logCache.add(key);
    }
  },

  error: (message: string, error?: any, options: DevLogOptions = {}) => {
    if (!import.meta.env.DEV) return;
    
    const key = `error:${message}`;
    if (options.once && logCache.has(key) && !options.force) return;
    
    console.error(`🔧 [DEV] ${message}`, error || '');
    
    if (options.once) {
      logCache.add(key);
    }
  },

  clear: () => {
    logCache.clear();
  }
};
