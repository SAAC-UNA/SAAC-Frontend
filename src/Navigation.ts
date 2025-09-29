import type { NavItem } from './Types/CommonTypes';

const homeIcon = 'system-icon:home';
const rolesIcon = 'system-icon:shield';
const usersIcon = 'system-icon:user';
const courseIcon = 'system-icon:bag';
const rolesListIcon = 'system-icon:contacts';
const addRoles = 'system-icon:add';

/*
  isActive: true // Indica la página actual
  isExpandable: true // Indica si el elemento tiene subelementos
  children: NavItem[] // Los subelementos del elemento

  Los valores de icon se manejan en SidebarItem.tsx que indica iconType si es SVG o emoji
  En Sidebar.tsx se detecta si es URL o emoji para renderizarlo correctamente con 
*/

export const navigationItems: NavItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: homeIcon,
    href: '/',
    isActive: false
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: rolesIcon,
    href: '/',
    isActive: false,
    isExpandable: true,
    children: [
      {
        id: 'rolesCrear',
        label: 'Crear Rol',
        icon: addRoles,
        href: '/roles/crear'
      },
      {
        id: 'rolesListar',
        label: 'Listar Roles',
        icon: rolesListIcon,
        href: '/roles/listar'
      }
    ]
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: usersIcon,
    href: '/usuarios',
    isActive: false,
    isExpandable: true
    // ,
    // children: [
    //   {
    //     id: 'usuariosListar',
    //     label: 'Listar Usuarios',
    //     icon: '📋',
    //     href: '/usuarios/listar'
    //   },
    //   {
    //     id: 'usuariosCrear',
    //     label: 'Crear Usuario',
    //     icon: '➕',
    //     href: '/usuarios/crear'
    //   }
    // ]
  },
  {
    id: 'cursos',
    label: 'Cursos',
    icon: courseIcon,
    href: '/cursos',
    isActive: false,
    isExpandable: true
  //   ,
  //   children: [
  //     {
  //       id: 'cursosListar',
  //       label: 'Ver Cursos',
  //       icon: '📖',
  //       href: '/cursos/listar'
  //     },
  //     {
  //       id: 'cursosCrear',
  //       label: 'Nuevo Curso',
  //       icon: '📝',
  //       href: '/cursos/crear'
  //     }
  //   ]
  // },
  // {
  //   id: 'estructuraRepositorio',
  //   label: 'Estructura del Repositorio',
  //   icon: '📦',
  //   href: '/estructura-repositorio',
  //   isExpandable: true,
  //   children: [
  //     {
  //       id: 'estructuraVer',
  //       label: 'Ver Estructura',
  //       icon: '🗂️',
  //       href: '/estructura/ver'
  //     },
  //     {
  //       id: 'estructuraModificar',
  //       label: 'Modificar',
  //       icon: '⚙️',
  //       href: '/estructura/modificar'
  //     }
  //   ]
  // },
  // {
  //   id: 'gestionEstructura',
  //   label: 'Gestión de Estructura',
  //   icon: '⚙️',
  //   href: '/gestion-estructura',
  //   isExpandable: true,
  //   children: [
  //     {
  //       id: 'gestionConfigurar',
  //       label: 'Configuración',
  //       icon: '🔧',
  //       href: '/gestion/configurar'
  //     }
  //   ]
  // },
  // {
  //   id: 'bitacora',
  //   label: 'Bitácora',
  //   icon: '📊',
  //   href: '/bitacora',
  //   isExpandable: true,
  //   children: [
  //     {
  //       id: 'bitacoraVer',
  //       label: 'Ver Registros',
  //       icon: '📈',
  //       href: '/bitacora/ver'
  //     },
  //     {
  //       id: 'bitacoraExportar',
  //       label: 'Exportar',
  //       icon: '💾',
  //       href: '/bitacora/exportar'
  //     }
  //   ]
  }
];