import React, { useState } from 'react';
import { Input, Textarea, MultiSelect, Button } from '@/components/Ui/Index';
import { useSidebar } from '@/context/SidebarContext';
import { useBreakpoint } from '@/hooks/UseBreakpoint';

interface CreateRoleFormProps {
  onSubmit?: (roleData: RoleFormData) => void;
  onCancel?: () => void;
}

interface RoleFormData {
  name: string;
  description: string;
  privileges: string[];
}

// Lista de privilegios disponibles (basado en el screenshot y requerimientos)
const AVAILABLE_PRIVILEGES = [
  { 
    id: 'view_users', 
    label: 'Ver usuarios',
    description: 'Permite visualizar la lista de usuarios'
  },
  { 
    id: 'create_roles', 
    label: 'Crear roles',
    description: 'Permite crear nuevos roles de usuario'
  },
  { 
    id: 'edit_roles', 
    label: 'Editar roles',
    description: 'Permite modificar roles existentes'
  },
  { 
    id: 'delete_roles', 
    label: 'Eliminar roles',
    description: 'Permite eliminar roles del sistema'
  },
  { 
    id: 'view_roles', 
    label: 'Ver roles',
    description: 'Permite visualizar la lista de roles'
  },
  { 
    id: 'manage_courses', 
    label: 'Gestionar cursos',
    description: 'Permite crear, editar y eliminar cursos'
  },
  { 
    id: 'view_reports', 
    label: 'Ver reportes',
    description: 'Permite acceder a reportes del sistema'
  },
  { 
    id: 'system_admin', 
    label: 'Administración del sistema',
    description: 'Acceso completo a configuración del sistema'
  }
];

export const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const { isCollapsed } = useSidebar();
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useBreakpoint();
  
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    privileges: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});

  const handleInputChange = (field: keyof RoleFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RoleFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (formData.description.trim() && formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    if (formData.privileges.length === 0) {
      newErrors.privileges = 'Debe seleccionar al menos un privilegio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  // Calcular ancho dinámico basado en pantalla y sidebar
  const getFormWidth = () => {
    if (isMobile) {
      return 'w-full max-w-none'; // Ancho completo en móvil
    }
    
    if (isTablet) {
      return isCollapsed ? 'w-full max-w-4xl' : 'w-full max-w-2xl';
    }
    
    if (isDesktop) {
      if (isLargeScreen) {
        return isCollapsed ? 'w-full max-w-7xl' : 'w-full max-w-4xl';
      }
      return isCollapsed ? 'w-full max-w-6xl' : 'w-full max-w-3xl';
    }
    
    return 'w-full max-w-2xl'; // fallback
  };

  // Calcular padding interno responsive
  const getFormPadding = () => {
    if (isMobile) return 'p-4';
    if (isTablet) return 'p-5';
    return 'p-6'; // Desktop
  };

  return (
    <div className={`bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 ${getFormWidth()}`}>

      {/* Contenido del formulario */}
      <form onSubmit={handleSubmit} className={`${getFormPadding()}`}>
        
        {isDesktop ? (
          // Layout de Desktop: Estructura compleja
          <div className="space-y-6">
            {/* Grid principal: Columna izquierda (Nombre + Privilegios) y Columna derecha (Descripción) */}
            <div className="grid grid-cols-2 gap-6">
              {/* Columna izquierda: Nombre del rol + Privilegios */}
              <div className="space-y-6">
                {/* Nombre del rol */}
                <Input
                  label="Nombre del Rol"
                  placeholder="Ej: Administrador, Profesor..."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  required
                  size="sm"
                />

                {/* Privilegios */}
                <MultiSelect
                  label="Privilegios del Rol"
                  options={AVAILABLE_PRIVILEGES}
                  selectedValues={formData.privileges}
                  onChange={(values) => handleInputChange('privileges', values)}
                  error={errors.privileges}
                  required
                  maxHeight="lg"
                  showCounter
                />
              </div>

              {/* Columna derecha: Descripción */}
              <div className="w-full">
                <Textarea
                  label="Descripción"
                  placeholder="Descripción del rol..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={errors.description}
                  rows={4}
                  resize="vertical"
                  size="sm"
                />
              </div>
            </div>

            {/* Botones de acción - Alineados a la derecha */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                responsive
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                responsive
              >
                Crear Rol
              </Button>
            </div>
          </div>
        ) : (


          // Layout Mobile/Tablet: Layout vertical simple
          <div className="space-y-6">
            {/* Campo: Nombre del rol */}
            <Input
              label="Nombre del Rol"
              placeholder="Ej: Administrador, Profesor..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
              size="sm"
            />

            {/* Campo: Descripción */}
            <Textarea
              label="Descripción"
              placeholder="Descripción del rol..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={errors.description}
              rows={4}
              resize="vertical"
              size="sm"
            />

            {/* Campo: Privilegios */}
            <MultiSelect
              label="Privilegios del Rol"
              options={AVAILABLE_PRIVILEGES}
              selectedValues={formData.privileges}
              onChange={(values) => handleInputChange('privileges', values)}
              error={errors.privileges}
              required
              maxHeight="lg"
              showCounter
            />

            {/* Botones de acción - Ancho completo en móvil */}
            <div className="flex gap-4 pt-4 ">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                responsive
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                responsive
              >
                Crear Rol
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};