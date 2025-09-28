# Guía de Arquitectura de Componentes SAAC Frontend

## 🏗️ **Principios Arquitectónicos**

### **Separación de Responsabilidades**
- **Pages** (Páginas): Coordinadores simples que orquestan componentes
- **Features** (Características): Componentes complejos y reutilizables con lógica de negocio
- **Ui** (Interfaz): Componentes básicos de interfaz reutilizables

---

## 📁 **Estructura de Directorios**

```
src/
├── Pages/                 # Coordinadores simples (20-60 líneas)
├── Components/
│   ├── Features/         # Componentes complejos con lógica de negocio (100+ líneas)
│   │   ├── Roles/        # Funcionalidades específicas de roles
│   │   ├── Users/        # Funcionalidades específicas de usuarios
│   │   └── Programs/     # Funcionalidades específicas de programas
│   └── Ui/              # Componentes básicos reutilizables (10-50 líneas)
```

---

## ✅ **Patrón Correcto: Pages como Coordinadores**

### **Ejemplo: RolesListPage.tsx (44 líneas)**
```tsx
import React from 'react';
import { RolesTable } from '../Components/Features/Roles/RolesTable';
import { Button } from '../Components/Ui';

const RolesListPage = () => {
  // Solo callbacks y coordinación
  const handleCreateRole = () => {
    console.log('Create new role');
  };

  const handleEditRole = (roleId: number) => {
    console.log('Edit role:', roleId);
  };

  // Layout y coordinación de componentes
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Roles</h1>
      </div>
      <RolesTable onEdit={handleEditRole} onDelete={handleDeleteRole} />
    </div>
  );
};
```

### **Ejemplo: RolesTable.tsx (Features)**
```tsx
// Componente complejo con lógica de negocio
const RolesTable = ({ onEdit, onDelete }) => {
  // Estados complejos
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lógica de negocio
  const loadRoles = async () => { /* ... */ };
  
  // Renderizado complejo
  return <DataTable ... />;
};
```

---

## ❌ **Anti-Patrón: Pages con Lógica Embedida**

### **Evitar: Páginas de 200+ líneas con:**
- Estados complejos embedidos
- Lógica de API directa
- Manejo de formularios complejos
- Lógica de paginación/filtrado
- Modales y estados complejos

---

## 🎯 **Guías de Implementación**

### **Para Pages (20-60 líneas)**
- ✅ Importar componentes Features
- ✅ Definir callbacks simples
- ✅ Layout básico y coordinación
- ✅ Navegación entre vistas
- ❌ Lógica de API directa
- ❌ Estados complejos
- ❌ Validaciones de formularios

### **Para Features (100+ líneas)**
- ✅ Lógica de negocio compleja
- ✅ Estados y efectos complejos
- ✅ Integración con APIs
- ✅ Manejo de formularios
- ✅ Paginación y filtrado
- ✅ Modales y dialogs

### **Para Ui (10-50 líneas)**
- ✅ Componentes básicos reutilizables
- ✅ Sin lógica de negocio
- ✅ Props simples
- ✅ Estilos consistentes

---

## 📊 **Métricas de Calidad**

### **Rangos de Líneas de Código**
- **Pages**: 20-60 líneas ✅
- **Features**: 100-300 líneas ✅
- **Ui**: 10-50 líneas ✅

### **Indicadores de Problemas**
- ⚠️ Page > 100 líneas: Extraer a Feature
- ⚠️ Feature > 400 líneas: Dividir en sub-componentes
- ⚠️ Ui > 80 líneas: Revisar responsabilidades

---

## 🔄 **Proceso de Refactoring**

### **1. Identificar Anti-Patrón**
```bash
# Buscar páginas con muchas líneas
Get-ChildItem -Path "src\Pages\*.tsx" | ForEach-Object { 
  $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
  if ($lines -gt 100) { Write-Host "$($_.Name): $lines líneas - REVISAR" }
}
```

### **2. Extraer a Feature**
- Crear componente en `Components/Features/{Modulo}/`
- Mover lógica compleja al Feature
- Simplificar Page a coordinador

### **3. Verificar Consistencia**
- Page: 20-60 líneas
- Feature: Lógica embedida extraída
- Mantenimiento: Fácil localización de cambios

---

## 📋 **Checklist de Revisión**

### **Al Crear Nueva Funcionalidad**
- [ ] ¿La Page es solo un coordinador? (< 60 líneas)
- [ ] ¿La lógica compleja está en Features?
- [ ] ¿Los componentes Ui son reutilizables?
- [ ] ¿La estructura sigue el patrón establecido?

### **Al Modificar Existente**
- [ ] ¿La Page sigue siendo simple después del cambio?
- [ ] ¿Se añadió lógica de negocio a la Page? → Mover a Feature
- [ ] ¿Se mantuvo la separación de responsabilidades?

---

## 🎨 **Beneficios del Patrón**

### **Mantenibilidad**
- Fácil localización de errores
- Cambios isolados por responsabilidad
- Testing más enfocado

### **Reutilización**
- Components Features reutilizables entre Pages
- Ui components consistentes
- Menos duplicación de código

### **Escalabilidad**
- Nuevos módulos siguen patrón consistente
- Onboarding más rápido para desarrolladores
- Arquitectura predecible

---

*Última actualización: 27 de septiembre de 2025*