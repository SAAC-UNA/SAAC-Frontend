# SAAC Frontend — Guía de Despliegue en Producción

**Sistema de Acreditación y Autoevaluación de Carreras**  
Universidad Nacional de Costa Rica — Grupo 03-2025

---

## 1. Requisitos del Servidor / Entorno de Build

| Herramienta | Versión mínima recomendada | Notas |
|---|---|---|
| **Node.js** | `>= 20.x` (probado con `v24.13.1`) | [nodejs.org](https://nodejs.org) — usar LTS |
| **npm** | `>= 10.x` (incluido con Node) | Probado con `v11.10.1` |
| **Servidor web** | Nginx / Apache / cualquier servidor estático | Solo sirve archivos del `dist/` |

> **Importante:** Node.js y npm solo se necesitan para **compilar** el proyecto. El resultado final (`dist/`) es HTML, CSS y JS estático puro — no se necesita Node en producción para servirlo.

---

## 2. Variables de Entorno

Antes de compilar, crear un archivo **`.env`** en la raíz del proyecto basado en `.env.example`:

```env
# URL del API Backend
# Para producción: https://api.saac.una.ac.cr/api (o la URL que corresponda)
VITE_API_URL=https://<dominio-backend>/api

# Nombre y versión de la app
VITE_APP_NAME=SAAC
VITE_APP_VERSION=1.0.0
```

> Las variables deben comenzar con `VITE_` para que Vite las exponga al bundle.

---

## 3. Dependencias del Proyecto (`npm install`)

Al ejecutar `npm install` se instalan automáticamente todas las dependencias listadas en `package.json`.

### 3.1 Dependencias de producción (incluidas en el bundle)

| Paquete | Versión | Descripción |
|---|---|---|
| `react` | `^18.3.1` | Librería principal de UI |
| `react-dom` | `^18.3.1` | Renderizado de React en el DOM |
| `react-router-dom` | `^7.9.4` | Enrutamiento SPA (client-side routing) |
| `axios` | `^1.12.2` | Cliente HTTP para consumir el API |
| `framer-motion` | `^12.38.0` | Animaciones y transiciones |
| `tailwindcss` | `^4.1.13` | Framework de estilos CSS utilitarios |
| `@headlessui/react` | `^2.2.9` | Componentes UI accesibles sin estilos |
| `@radix-ui/react-avatar` | `^1.1.11` | Componente Avatar de Radix UI |
| `react-hot-toast` | `^2.6.0` | Notificaciones / toasts |
| `clsx` | `^2.1.1` | Utilidad para combinar clases CSS |
| `class-variance-authority` | `^0.7.1` | Gestión de variantes de clase CSS |
| `tailwind-merge` | `^3.3.1` | Combina clases Tailwind sin conflictos |
| `@types/react-router-dom` | `^5.3.3` | Tipos TypeScript para react-router |

### 3.2 Dependencias de desarrollo (solo para build/tests, NO van al servidor)

| Paquete | Versión | Descripción |
|---|---|---|
| `vite` | `^8.0.3` | Bundler / compilador del proyecto |
| `@vitejs/plugin-react-swc` | `^4.3.0` | Plugin Vite para React (compilador SWC) |
| `@tailwindcss/vite` | `^4.2.2` | Integración Tailwind con Vite |
| `vite-plugin-svgr` | `^5.2.0` | Importar SVGs como componentes React |
| `typescript` | `^6.0.2` | Compilador TypeScript |
| `@types/react` | `^19.1.10` | Tipos TypeScript para React |
| `@types/react-dom` | `^19.1.7` | Tipos TypeScript para React DOM |
| `eslint` | `^9.33.0` | Linter de código |
| `jest` + ecosystem | `^29.x` | Framework de pruebas unitarias |

---

## 4. Pasos para Compilar y Desplegar

```bash
# 1. Clonar / copiar el proyecto al servidor de build
git clone <repositorio> saac-frontend
cd saac-frontend

# 2. Instalar TODAS las dependencias (incluyendo devDependencies para el build)
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env con los valores de producción (ver sección 2)

# 4. Compilar para producción
npm run build
```

El comando `npm run build` ejecuta internamente:
```
tsc -b && vite build
```
- `tsc -b`: verifica tipos TypeScript
- `vite build`: genera el bundle optimizado

### Resultado

Se genera la carpeta **`dist/`** con los archivos estáticos listos para servir:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      ← JS compilado y minificado
│   ├── index-[hash].css     ← CSS compilado y minificado
│   └── ...                  ← Imágenes, fuentes, etc.
```

---

## 5. Configuración del Servidor Web

### Nginx (recomendado)

```nginx
server {
    listen 80;
    server_name saac.una.ac.cr;  # Reemplazar con el dominio

    root /var/www/saac-frontend/dist;
    index index.html;

    # Necesario para SPA (React Router) — redirige todas las rutas al index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets con hash (inmutable)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

> **Fundamental:** La directiva `try_files $uri $uri/ /index.html` es INDISPENSABLE. Sin ella, al hacer F5 en cualquier ruta distinta de `/` devolverá 404.

### Apache (alternativa)

Crear un archivo `.htaccess` dentro de `dist/`:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## 6. Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo local (puerto 5173) |
| `npm run build` | Compilación para producción → genera `dist/` |
| `npm run preview` | Sirve localmente el `dist/` para verificar el build |
| `npm run lint` | Análisis estático del código |
| `npm test` | Ejecutar pruebas unitarias |
| `npm run test:coverage` | Pruebas con reporte de cobertura |

---

## 7. Comunicación con el Backend

El frontend se comunica exclusivamente con el backend mediante la URL configurada en `VITE_API_URL`.

- **Desarrollo:** `http://localhost:8000/api`
- **Producción:** URL del API backend de la UNA

> Verificar que el backend tenga configurado **CORS** permitiendo el dominio del frontend.  
> No usar `127.0.0.1` — usar `localhost` para evitar problemas con cookies de sesión.

---

## 8. Verificación rápida post-despliegue

1. Abrir el navegador en el dominio configurado → debe cargar el login.
2. Navegar a una ruta interna (ej. `/dashboard`) y hacer F5 → **no debe dar 404**.
3. Verificar en DevTools → Network que las llamadas al API (`VITE_API_URL`) respondan correctamente.
