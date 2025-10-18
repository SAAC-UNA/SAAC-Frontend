# 🔒 Manejo de Variables de Entorno (.env) - Guía Completa

## 📋 Tabla de Contenidos
1. [¿Qué es un archivo .env?](#qué-es-un-archivo-env)
2. [¿Por qué NO debe estar en Git?](#por-qué-no-debe-estar-en-git)
3. [Diferencias: Desarrollo vs Producción](#diferencias-desarrollo-vs-producción)
4. [Cómo funciona .gitignore](#cómo-funciona-gitignore)
5. [Patrón recomendado](#patrón-recomendado)
6. [Implementación paso a paso](#implementación-paso-a-paso)
7. [Caso especial: Proyecto SAAC](#caso-especial-proyecto-saac)

---

## 🎯 ¿Qué es un archivo .env?

Un archivo `.env` contiene **variables de entorno** que configuran tu aplicación según el contexto donde se ejecuta.

### Ejemplo básico:
```env
# Desarrollo local
VITE_API_URL=http://127.0.0.1:8000/api
DB_HOST=localhost
DB_PASSWORD=12345678
SECRET_KEY=mi-clave-super-secreta
```

### ¿Para qué sirve?

1. **Separar configuración del código**
   - El código no tiene URLs "hardcoded"
   - Puedes cambiar configuración sin modificar código

2. **Diferentes ambientes**
   - Desarrollo: base de datos local, URLs locales
   - Pruebas: servidor de pruebas
   - Producción: servidores reales, contraseñas reales

3. **Seguridad**
   - Mantener secretos fuera del código fuente
   - Cada desarrollador puede tener su propia configuración

---

## ⚠️ ¿Por qué NO debe estar en Git?

### Problema 1: Exposición de Secretos

Si subes `.env` a GitHub, **cualquiera puede ver tus secretos**:

```env
# ❌ NUNCA subir a Git:
DB_PASSWORD=produccion_password_2024
AWS_SECRET_KEY=AKIAIOSFODNN7EXAMPLE
STRIPE_SECRET_KEY=sk_live_51HxYz...
JWT_SECRET=mi-clave-jwt-super-secreta
ADMIN_EMAIL_PASSWORD=admin@123
```

**Consecuencias:**
- 🔓 Acceso no autorizado a tu base de datos
- 💳 Robo de credenciales de pago
- 🚨 Bots escanean GitHub buscando claves API
- 💰 Cargos fraudulentos en servicios de terceros
- 🏴‍☠️ Hackers pueden comprometer todo tu sistema

### Ejemplo Real:

```bash
# Alguien sube por error:
STRIPE_SECRET_KEY=sk_live_51HxYz2BPx...

# En minutos:
# 1. Bot de GitHub lo detecta
# 2. Hackers usan la clave
# 3. Hacen compras fraudulentas
# 4. Tu cuenta Stripe queda en rojo
```

**Casos reales famosos:**
- Uber: $100,000 de multa por exponer AWS keys en GitHub
- Toyota: Código fuente expuesto con credenciales
- Samsung: Claves privadas subidas accidentalmente

### Problema 2: Configuraciones Diferentes

```env
# Desarrollo (Juan)
VITE_API_URL=http://localhost:3000/api
DB_HOST=localhost

# Desarrollo (María)
VITE_API_URL=http://127.0.0.1:8080/api
DB_HOST=192.168.1.100

# Producción
VITE_API_URL=https://api.saac.una.ac.cr/api
DB_HOST=prod-db-server.una.ac.cr
```

Si `.env` está en Git, cada desarrollador tendría que:
1. Pull del repo
2. Cambiar `.env` a su configuración local
3. **NO hacer commit** (pero es fácil olvidarlo)
4. Riesgo de subir configuración local por error

---

## 🔄 Diferencias: Desarrollo vs Producción

### Entorno de Desarrollo (Local)

```env
# .env (LOCAL - NO en Git)
VITE_API_URL=http://127.0.0.1:8000/api
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=saac
DB_USERNAME=root
DB_PASSWORD=12345678

# Configuraciones para debugging
APP_DEBUG=true
LOG_LEVEL=debug

# URLs locales
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://127.0.0.1:8000
```

**Características:**
- ✅ Contraseñas simples (no importa seguridad)
- ✅ Debug activado para ver errores
- ✅ Servicios locales (localhost)
- ✅ Sin HTTPS

---

### Entorno de Producción (Servidor Real)

```env
# .env (PRODUCCIÓN - NO en Git)
VITE_API_URL=https://api.saac.una.ac.cr/api
DB_HOST=prod-mysql-server.una.ac.cr
DB_PORT=3306
DB_DATABASE=saac_production
DB_USERNAME=saac_prod_user
DB_PASSWORD=uj8#mK9$nL2@pQ5w  # Contraseña fuerte

# Configuraciones de producción
APP_DEBUG=false
LOG_LEVEL=error

# URLs públicas
FRONTEND_URL=https://saac.una.ac.cr
BACKEND_URL=https://api.saac.una.ac.cr

# Claves secretas REALES
JWT_SECRET=aH8kL9mN4pQ7rT2vX5yZ8bC1dF3gJ6
SESSION_SECRET=9pL6mK3nH8jG5fD2sA4qW7eR1tY0
```

**Características:**
- 🔒 Contraseñas **MUY fuertes** y únicas
- 🔒 Debug **desactivado** (no mostrar errores internos)
- 🔒 Solo logs de errores críticos
- 🔒 HTTPS obligatorio
- 🔒 Certificados SSL/TLS

---

## 🛡️ Cómo funciona .gitignore

El archivo `.gitignore` le dice a Git **qué archivos NO debe versionar**.

### Agregar .env a .gitignore

```bash
# .gitignore
# Variables de entorno (nunca versionar)
.env
.env.local
.env.production
.env.*.local

# Dependencias
node_modules/
vendor/

# Archivos del sistema
.DS_Store
Thumbs.db
```

### Cómo funciona:

```bash
# 1. Crear .gitignore
echo ".env" > .gitignore

# 2. Git ahora IGNORA .env
git status
# No aparece .env en la lista de cambios

# 3. Intentar agregar .env
git add .env
# Git te advierte que está ignorado

# 4. Verificar qué ignora Git
git check-ignore -v .env
# Output: .gitignore:1:.env    .env
```

### ⚠️ PROBLEMA: Si ya subiste .env antes

```bash
# Si ya hiciste commit de .env antes de agregarlo a .gitignore:

# 1. Agregar a .gitignore
echo ".env" >> .gitignore

# 2. Remover del tracking de Git (SIN eliminar archivo local)
git rm --cached .env

# 3. Commit
git add .gitignore
git commit -m "fix: Remover .env del repositorio y agregarlo a .gitignore"

# 4. Push
git push origin development

# Ahora .env está:
# ✅ En tu máquina local (puedes usarlo)
# ❌ NO en el repositorio Git
```

---

## ✅ Patrón Recomendado

### Estructura de Archivos

```
proyecto/
├── .env                    # ❌ NO en Git (configuración personal)
├── .env.example            # ✅ SÍ en Git (plantilla)
├── .env.development        # ❌ NO en Git (valores desarrollo)
├── .env.production         # ❌ NO en Git (valores producción)
├── .gitignore              # ✅ SÍ en Git (incluye .env)
└── README.md               # ✅ SÍ en Git (documenta setup)
```

### 1. .env.example (SÍ versionar)

```env
# .env.example
# Copiar este archivo como .env y configurar valores apropiados

# URL del API Backend
VITE_API_URL=

# Base de datos
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

# Claves secretas (generar valores únicos)
JWT_SECRET=
SESSION_SECRET=

# Configuración
APP_DEBUG=
LOG_LEVEL=
```

**Propósito:**
- ✅ Documenta qué variables se necesitan
- ✅ Muestra la estructura esperada
- ✅ **NO contiene valores reales**
- ✅ Seguro para versionar

### 2. .env (NO versionar)

```env
# .env (archivo personal de cada desarrollador)
VITE_API_URL=http://127.0.0.1:8000/api
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=saac
DB_USERNAME=root
DB_PASSWORD=12345678
JWT_SECRET=clave-local-no-importa
SESSION_SECRET=session-local
APP_DEBUG=true
LOG_LEVEL=debug
```

**Propósito:**
- ✅ Valores reales para tu máquina local
- ✅ Cada desarrollador tiene el suyo
- ❌ **NUNCA subir a Git**

### 3. .gitignore (SÍ versionar)

```bash
# .gitignore
.env
.env.local
.env.*.local
!.env.example
```

**Nota importante:**
- `!.env.example` significa "excepción: SÍ versionar .env.example"

---

## 🚀 Implementación Paso a Paso

### Para un Proyecto NUEVO

```bash
# 1. Crear .gitignore PRIMERO (antes de crear .env)
cat > .gitignore << 'EOF'
# Variables de entorno
.env
.env.local
.env.*.local
!.env.example

# Dependencias
node_modules/
vendor/

# Build
dist/
build/
EOF

# 2. Crear .env.example (plantilla)
cat > .env.example << 'EOF'
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=SAAC
VITE_APP_VERSION=1.0.0
EOF

# 3. Copiar plantilla a .env (para trabajar)
cp .env.example .env

# 4. Editar .env con tus valores reales
nano .env

# 5. Verificar que .env NO se versionará
git status
# .env NO debe aparecer

# 6. Commit de .gitignore y .env.example
git add .gitignore .env.example
git commit -m "chore: Configurar variables de entorno"
git push
```

### Para un Proyecto EXISTENTE (como SAAC)

Ya subiste `.env` por error. Así lo corriges:

```bash
# 1. Verificar que .gitignore existe y tiene .env
cat .gitignore | grep ".env"

# Si no existe, agregar:
echo -e "\n# Variables de entorno\n.env\n.env.local\n.env.*.local\n!.env.example" >> .gitignore

# 2. Remover .env del tracking de Git (conservar archivo local)
git rm --cached .env

# 3. Crear .env.example si no existe
cp .env .env.example

# 4. Limpiar valores sensibles de .env.example
# Editar .env.example y dejar solo nombres de variables:
nano .env.example
# Cambiar:
#   VITE_API_URL=http://127.0.0.1:8000/api
# Por:
#   VITE_API_URL=

# 5. Commit de cambios
git add .gitignore .env.example
git commit -m "fix: Remover .env del repositorio

- Agregar .env a .gitignore para evitar subir configuración local
- Crear .env.example como plantilla
- Remover .env del tracking de Git (conservado localmente)

BREAKING CHANGE: Desarrolladores deben copiar .env.example a .env"

# 6. Push
git push origin development

# 7. Avisar al equipo
# Cada desarrollador debe ejecutar:
# cp .env.example .env
# Editar .env con sus valores locales
```

---

## 🎓 Caso Especial: Proyecto SAAC

### Situación Actual

```
✅ Ya existe: .env (con valores)
✅ Ya existe: .env.example (plantilla)
❌ Problema: .env está en Git (commit 675f885)
```

### ¿Qué hacer?

Hay **dos opciones**:

#### Opción 1: Mantener como está (para aprendizaje)

**Ventajas:**
- ✅ Equipo puede clonar y funciona inmediatamente
- ✅ Útil para proyecto académico/educativo
- ✅ No hay datos sensibles reales (solo desarrollo)

**Desventajas:**
- ❌ No es práctica profesional
- ❌ Si alguien pone contraseña real, se expondrá

**Cuándo usar:**
- Proyecto educativo (como SAAC actualmente)
- Solo desarrollo local
- No hay datos de producción

#### Opción 2: Corregir para buenas prácticas

**Pasos:**

```bash
# 1. Agregar .env a .gitignore
cd C:\Users\ian19\Desktop\SAAC\SAAC-Frontend

# Verificar contenido de .gitignore
Get-Content .gitignore

# Agregar al final:
Add-Content .gitignore "`n# Variables de entorno`n.env`n.env.local`n.env.*.local`n!.env.example"

# 2. Remover .env del tracking
git rm --cached .env

# 3. Verificar .env.example tiene plantilla correcta
Get-Content .env.example

# 4. Commit
git add .gitignore
git commit -m "fix: Remover .env del repositorio y agregarlo a .gitignore

- Agregar .env a .gitignore para seguir buenas prácticas
- Mantener .env.example como plantilla versionada
- .env permanece localmente pero no se versionará

Instrucciones para desarrolladores:
1. Copiar: cp .env.example .env
2. Configurar valores según ambiente local"

# 5. Push
git push origin development
```

**Ventajas:**
- ✅ Práctica profesional correcta
- ✅ Cada desarrollador configura su entorno
- ✅ Preparado para producción

**Desventajas:**
- ⚠️ Nuevos clones requieren configuración manual
- ⚠️ Necesita documentar en README

---

## 📚 Documentar en README.md

Agregar al README del proyecto:

```markdown
## ⚙️ Configuración de Variables de Entorno

### Desarrollo Local

1. Copiar archivo de plantilla:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Editar `.env` con tus valores locales:
   \`\`\`env
   VITE_API_URL=http://127.0.0.1:8000/api
   \`\`\`

3. Reiniciar servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

### Producción

Las variables de entorno de producción se configuran directamente en el servidor/hosting.

**NUNCA** subir `.env` con valores de producción a Git.
```

---

## 🔐 Variables de Entorno en Producción

### Métodos según plataforma:

#### 1. Servidor propio (Linux/Ubuntu)

```bash
# En el servidor, crear .env manualmente:
cd /var/www/saac-frontend
nano .env

# Pegar valores de producción:
VITE_API_URL=https://api.saac.una.ac.cr/api
VITE_APP_NAME=SAAC
VITE_APP_VERSION=1.0.0

# Construir aplicación:
npm run build

# El build incluirá las variables de entorno
```

#### 2. Vercel / Netlify

```
Panel de administración → Project Settings → Environment Variables

Agregar:
VITE_API_URL: https://api.saac.una.ac.cr/api
VITE_APP_NAME: SAAC
VITE_APP_VERSION: 1.0.0
```

#### 3. Docker

```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
COPY . .

# Build time: usa ARG
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm ci
RUN npm run build
```

```bash
# docker-compose.yml
services:
  frontend:
    build:
      context: .
      args:
        VITE_API_URL: https://api.saac.una.ac.cr/api
    ports:
      - "80:80"
```

#### 4. GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
        run: |
          npm ci
          npm run build
```

Configurar secrets en:
GitHub → Settings → Secrets and variables → Actions → New secret

---

## 🎯 Resumen y Recomendaciones

### ✅ Buenas Prácticas

1. **SIEMPRE agregar `.env` a `.gitignore`**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **SIEMPRE tener `.env.example` versionado**
   ```bash
   cp .env .env.example
   # Limpiar valores sensibles
   git add .env.example
   ```

3. **Documentar variables requeridas**
   - En `.env.example`
   - En `README.md`

4. **Usar nombres descriptivos**
   ```env
   # ✅ Bien
   VITE_API_URL=http://127.0.0.1:8000/api
   
   # ❌ Mal
   API=http://127.0.0.1:8000/api
   ```

5. **Valores diferentes por ambiente**
   ```env
   # Desarrollo
   APP_DEBUG=true
   
   # Producción
   APP_DEBUG=false
   ```

### ❌ Errores Comunes

1. **Subir `.env` a Git**
   - Solución: `git rm --cached .env`

2. **No tener `.env.example`**
   - Solución: Crear plantilla

3. **Hardcodear valores en código**
   ```typescript
   // ❌ Mal
   const API_URL = 'http://127.0.0.1:8000/api';
   
   // ✅ Bien
   const API_URL = import.meta.env.VITE_API_URL;
   ```

4. **Olvidar reiniciar servidor después de cambiar `.env`**
   - Vite solo lee `.env` al iniciar
   - Solución: `Ctrl+C` y `npm run dev`

---

## 📖 Para Profundizar

- [The Twelve-Factor App - Config](https://12factor.net/config)
- [Vite - Env Variables and Modes](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Fecha:** 17 de octubre de 2025  
**Proyecto:** SAAC - UNA  
**Autor:** Documentación técnica para el equipo
