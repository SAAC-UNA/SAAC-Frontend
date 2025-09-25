import React from 'react';
import { PageHeader, Button } from '@/components/Ui/Index';

// Ejemplo 1: Página simple con solo título y descripción
export const DashboardPage: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title="Dashboard"
        description="Resumen general del sistema SAAC-UNA"
      />
      {/* Contenido del dashboard */}
    </div>
  );
};

// Ejemplo 2: Página con título, subtítulo y botones de acción
export const UserManagementPage: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title="Gestión de Usuarios"
        subtitle="Administración de cuentas"
        description="Administra usuarios, permisos y roles del sistema"
      >
        {/* Botones de acción */}
        <Button variant="primary">
          Crear Usuario
        </Button>
        <Button variant="secondary">
          Importar Usuarios
        </Button>
      </PageHeader>
      {/* Contenido de la página */}
    </div>
  );
};

// Ejemplo 3: Página con breadcrumbs (usando children)
export const RoleEditPage: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title="Editar Rol"
        description="Modifica los permisos y configuración del rol seleccionado"
      >
        {/* Breadcrumb o navegación */}
        <div className="text-sm text-gris-una">
          <span>Roles</span> / <span>Editar</span> / <span className="text-azul-una">Administrador</span>
        </div>
      </PageHeader>
      {/* Formulario de edición */}
    </div>
  );
};

// Ejemplo 4: Página de reportes con filtros en el header
export const ReportsPage: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title="Reportes del Sistema"
        subtitle="Análisis y estadísticas"
        description="Genera y visualiza reportes de actividad del sistema"
      >
        {/* Filtros rápidos */}
        <select className="px-3 py-2 border border-gris-una/30 rounded-lg">
          <option>Último mes</option>
          <option>Últimos 3 meses</option>
          <option>Año actual</option>
        </select>
        <Button variant="outline">
          Exportar PDF
        </Button>
      </PageHeader>
      {/* Gráficos y tablas */}
    </div>
  );
};