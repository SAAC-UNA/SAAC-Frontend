# 📋 Guía de Componentes de Selección

## ✅ **Único Componente: CustomSelect**

El `CustomSelect` es el **único componente** para todas las selecciones en la aplicación.

```tsx
import { CustomSelect } from '@/Components/Ui';

// ✅ Uso estándar
<CustomSelect
  label="Selecciona una opción"
  value={selectedValue}
  options={options}
  onChange={setSelectedValue}
  // variant="floating" es el default
/>
```

## 🚫 **Select nativo - ELIMINADO**

El componente `Select` nativo ha sido completamente eliminado del proyecto.

```tsx
// ❌ Ya no existe
import { Select } from '@/Components/Ui'; // Error!

// ✅ Usar siempre:
import { CustomSelect } from '@/Components/Ui';
```

## 🎨 **Características del CustomSelect**

- **🎯 Floating labels** por defecto (igual que Input y Textarea)
- **🎨 Diseño consistente** con el sistema
- **📱 Responsive** y accesible
- **🔧 API simple** y predecible
- **⚡ Optimizado** para rendimiento

## 🎨 **Características del CustomSelect**

- **🎯 Floating labels** por defecto (igual que Input y Textarea)
- **🎨 Diseño consistente** con el sistema
- **📱 Responsive** y accesible
- **🔧 API simple** y predecible
- **⚡ Optimizado** para rendimiento

## � **Propiedades Disponibles**

```tsx
interface CustomSelectProps {
  label: string;                    // Label requerido
  value?: string;                   // Valor seleccionado
  placeholder?: string;             // Placeholder (default: "Seleccionar...")
  options: SelectOption[];          // Opciones disponibles
  variant?: 'default' | 'floating'; // Default: 'floating'
  size?: ComponentSize;             // Default: 'sm'
  disabled?: boolean;               // Estado deshabilitado
  error?: string;                   // Mensaje de error
  className?: string;               // Clases adicionales
  required?: boolean;               // Campo requerido
  onChange?: (value: string) => void; // Callback de cambio
}
```

## ✨ **Beneficios de la Unificación**

- 📉 **Menos código**: Eliminadas ~240 líneas redundantes
- 🎨 **Consistencia visual** en toda la aplicación
- 🛠️ **Mantenimiento simplificado**
- 🚀 **Bundle más pequeño**
- 👥 **Sin confusión**: Un solo componente select

---

*Actualizado: Octubre 2025 - Select nativo completamente eliminado*