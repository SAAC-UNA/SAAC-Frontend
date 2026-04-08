/*
  Configuración de Alias de Rutas
  
  ¿Por qué usar path.resolve(process.cwd(), './src')?
  1. PROBLEMA con '/src':
    - '/src' es una ruta absoluta del sistema (ej: C:\src)
    - No existe en la mayoría de sistemas
    - Causa errores: "No se encuentra el módulo"
  2. SOLUCIÓN con path.resolve(process.cwd(), './src'):
    - process.cwd() = directorio actual del proyecto
    - './src' = ruta relativa desde el proyecto
    - path.resolve() = combina en ruta absoluta correcta
    - Resultado: C:\Users\ian19\Desktop\SAAC\SAAC-Frontend\src
  3. BENEFICIOS:
    - Funciona en cualquier sistema operativo
    - Ruta absoluta correcta del proyecto
    - Compatible con TypeScript y Vite
    - Permite importaciones limpias: import { } from '@/components/...'
  4. ALTERNATIVAS (también válidas):
    - '@': './src' (más simple pero menos explícita)
    - '@': path.join(__dirname, 'src') (requiere config ESM)
*/

/*
  Opción 1: __dirname (requiere configuración adicional en ESM)
  '@': path.resolve(__dirname, 'src')

  Opción 2: import.meta.url (ESM moderno)
  '@': new URL('./src', import.meta.url).pathname

  Opción 3: Ruta relativa simple (también funciona)
  '@': './src'
*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
      "@/components": path.resolve(process.cwd(), "./src/Components"),
      "@/context": path.resolve(process.cwd(), "./src/Context"),
      "@/hooks": path.resolve(process.cwd(), "./src/Hooks"),
      "@/pages": path.resolve(process.cwd(), "./src/Pages"),
      "@/types": path.resolve(process.cwd(), "./src/Types"),
      "@/utils": path.resolve(process.cwd(), "./src/Utils"),
      "@/constants": path.resolve(process.cwd(), "./src/Constants"),
      "@/Services": path.resolve(process.cwd(), "./src/Services"),
    },
  },
});
