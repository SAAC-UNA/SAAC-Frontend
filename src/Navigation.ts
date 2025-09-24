import type { NavItem } from './Types/CommonTypes';

export const navigationItems: NavItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: '🏠',
    href: '/',
    isActive: false
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: '❤️',
    href: '/roles',
    isActive: true // Página actual
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: '👥',
    href: '/usuarios',
    isExpandable: true,
    children: [
      {
        id: 'usuarios-listar',
        label: 'Listar Usuarios',
        icon: '📋',
        href: '/usuarios/listar'
      },
      {
        id: 'usuarios-crear',
        label: 'Crear Usuario',
        icon: '➕',
        href: '/usuarios/crear'
      }
    ]
  },
  {
    id: 'cursos',
    label: 'Cursos',
    icon: '📚',
    href: '/cursos',
    isExpandable: true,
    children: [
      {
        id: 'cursos-listar',
        label: 'Ver Cursos',
        icon: '📖',
        href: '/cursos/listar'
      },
      {
        id: 'cursos-crear',
        label: 'Nuevo Curso',
        icon: '📝',
        href: '/cursos/crear'
      }
    ]
  },
  {
    id: 'estructura-repositorio',
    label: 'Estructura del Repositorio',
    icon: '📦',
    href: '/estructura-repositorio',
    isExpandable: true,
    children: [
      {
        id: 'estructura-ver',
        label: 'Ver Estructura',
        icon: '🗂️',
        href: '/estructura/ver'
      },
      {
        id: 'estructura-modificar',
        label: 'Modificar',
        icon: '⚙️',
        href: '/estructura/modificar'
      }
    ]
  },
  {
    id: 'gestion-estructura',
    label: 'Gestión de Estructura',
    icon: '⚙️',
    href: '/gestion-estructura',
    isExpandable: true,
    children: [
      {
        id: 'gestion-configurar',
        label: 'Configuración',
        icon: '🔧',
        href: '/gestion/configurar'
      }
    ]
  },
  {
    id: 'bitacora',
    label: 'Bitácora',
    icon: '📊',
    href: '/bitacora',
    isExpandable: true,
    children: [
      {
        id: 'bitacora-ver',
        label: 'Ver Registros',
        icon: '📈',
        href: '/bitacora/ver'
      },
      {
        id: 'bitacora-exportar',
        label: 'Exportar',
        icon: '💾',
        href: '/bitacora/exportar'
      }
    ]
  }
];