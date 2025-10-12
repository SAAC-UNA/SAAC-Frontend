# Problemas de Layout Pendientes

## Problema: Inconsistencia de ancho en página EditUser

### Descripción
La página EditUser (`/src/Pages/Users/EditUser.tsx`) presenta un ancho más estrecho que otras páginas del sistema, a pesar de usar la misma estructura de contenedores ScreenContainer.

### Análisis realizado
1. **ScreenContainer funcionando correctamente**: Se confirma que ScreenContainer se renderiza y aplica las clases correctas
2. **Layout.tsx centralizado**: Se movió el padding y container a Layout.tsx para consistencia
3. **Grid unificado**: Se cambió el grid de EditUserForm de `grid-cols-1 lg:grid-cols-2` a `grid-cols-2` para consistencia
4. **Depuración visual**: Se aplicaron colores temporales para identificar los contenedores

### Estructura HTML identificada
```html
<div class="max-w-7xl mx-auto">
  <div class="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit">
    <div class="p-4 sm:p-6 lg:p-8">
      <!-- Contenido del formulario -->
    </div>
  </div>
</div>
```

### Problema persistente
A pesar de tener la misma estructura que otras páginas, EditUser sigue presentando un ancho más estrecho. El problema parece estar en:
- Posible contenedor adicional o anidamiento específico en EditUser
- Diferencias en el comportamiento del grid layout específico de esta página
- Estilos CSS específicos que se están aplicando solo a esta página

### Próximos pasos recomendados
1. Comparar pixel por pixel la estructura HTML entre EditUser y una página que funciona correctamente (ej: CreateRole)
2. Revisar si hay estilos CSS específicos aplicándose solo a EditUser
3. Verificar si el problema está en el componente EditUserForm o en la página EditUser
4. Considerar refactorizar el layout para usar un enfoque más simple y directo

### Archivos involucrados
- `/src/Pages/Users/EditUser.tsx`
- `/src/Pages/Users/Components/EditUserForm.tsx`
- `/src/Components/Ui/ScreenContainer.tsx`
- `/src/Components/Layout/Layout.tsx`

### Fecha del análisis
10 de octubre de 2025