# Conexión con Backend LDAP - Guía de Configuración

## Cambios Realizados

### 1. **AuthService.ts** - Actualizado para conectarse al backend
- ❌ Removido: Mock de usuarios locales
- ✅ Añadido: Conexión real con endpoint `/api/auth/login` del backend
- ✅ Cambios clave:
  - Las credenciales se envían en texto plano (cedula y password) como requiere LDAP
  - El backend maneja la autenticación contra LDAP
  - Se recibe token y datos del usuario como respuesta
  - Se guardan en localStorage para mantener la sesión

### 2. **AuthContext.tsx** - Actualizado tipos
- Importa tipos reales del `AuthService` (Role, Career, User)
- Ya no depende de usuarios mock
- Mantiene la lógica de persistencia en localStorage

### 3. **app.config.ts** - Nuevo archivo de configuración
- Define URL base del API
- Lee desde variable de entorno `VITE_API_URL`
- Valor por defecto: `http://localhost:8000/api`

### 4. **.env.example** - Variables de entorno
- Ya existe y tiene `VITE_API_URL`
- Usa por defecto: `http://127.0.0.1:8000/api`

## Cómo Configurar

### Opción 1: Desarrollo Local (Recomendado)
1. Asegúrate que tu backend está corriendo en `http://localhost:8000`
2. El frontend automáticamente hará requests a `http://localhost:8000/api`

### Opción 2: URL Personalizada
1. Crea archivo `.env` en la raíz del frontend (si no existe)
2. Añade o modifica:
   ```
   VITE_API_URL=http://tu-url-del-backend:puerto/api
   ```
3. Reinicia el servidor de desarrollo

## Flujo de Autenticación

### Formulario Login → AuthService → Backend LDAP

```
1. Usuario ingresa cédula y contraseña en formulario
   ↓
2. handleSubmit en Login.tsx llama a authContext.login()
   ↓
3. AuthContext.login() llama a authService.loginWithCedula(cedula, password)
   ↓
4. AuthService hace POST a /api/auth/login
   └─ Headers: Content-Type: application/json
   └─ Body: { cedula: "203948609", password: "password123" }
   ↓
5. Backend valida contra LDAP
   └─ Si éxito: retorna { user: {...}, token: "..." }
   └─ Si error: retorna { message: "Credenciales inválidas" }
   ↓
6. AuthService guarda token y usuario en localStorage
   ↓
7. AuthContext actualiza estado y redirige al home
```

## Usuarios de Prueba

Basados en el seeder del backend, usa cedulas:
- **203849675** - SuperUsuario (acceso total)
- **203948609** - Administrador (carrera Ingeniería)
- **208738943** - Administrador (carrera Química)

**Contraseña**: `password123` (o la que definió tu compañero)

## Respuesta del Backend

Cuando la autenticación es exitosa, el backend retorna:

```json
{
  "user": {
    "usuario_id": 1,
    "cedula": "203849675",
    "nombre": "Pablo Castillo Quesada",
    "email": "pablo.castillo.quesada@una.cr",
    "roles": [
      {
        "id": 1,
        "name": "SuperUsuario"
      }
    ],
    "careers": []
  },
  "token": "1|abcdef..."
}
```

## Errores Comunes

### ❌ "CORS error" o "Cannot reach server"
- Backend no está corriendo
- URL en `.env` es incorrecta
- Revisa que el backend esté en `http://localhost:8000`

### ❌ "Credenciales incorrectas"
- Cédula o contraseña incorrecta
- La cédula debe tener 9 dígitos
- Verifica que el usuario exista en LDAP

### ❌ "Respuesta inválida del servidor"
- El backend no está retornando `user` y `token`
- Revisa los logs del backend

## Bitácora (Auditoría)

El backend automáticamente registra:
- ✅ Intentos exitosos de login
- ❌ Intentos fallidos de login
- Usuario, IP, fecha y hora
- Resultado del intento

**El frontend no necesita hacer nada**, el backend lo maneja todo.

## Próximos Pasos

Cuando el equipo IT te dé acceso directo al servidor LDAP de la universidad:
1. Actualizar credenciales en `.env` del backend
2. Cambiar configuración LDAP en `config/ldap.php`
3. El frontend no necesita cambios
