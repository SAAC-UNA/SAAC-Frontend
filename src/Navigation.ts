import type { NavItem } from './Types/CommonTypes';
import homeIcon from './assets/Icons/home.svg';
import rolesIcon from './assets/Icons/shield.svg';
import usersIcon from './assets/Icons/user.svg';
import courseIcon from './assets/Icons/bag.svg';

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
    href: '/roles',
    isActive: false // Ya no hardcodeado
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
    //     id: 'usuarios-listar',
    //     label: 'Listar Usuarios',
    //     icon: '📋',
    //     href: '/usuarios/listar'
    //   },
    //   {
    //     id: 'usuarios-crear',
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
  //       id: 'cursos-listar',
  //       label: 'Ver Cursos',
  //       icon: '📖',
  //       href: '/cursos/listar'
  //     },
  //     {
  //       id: 'cursos-crear',
  //       label: 'Nuevo Curso',
  //       icon: '📝',
  //       href: '/cursos/crear'
  //     }
  //   ]
  // },
  // {
  //   id: 'estructura-repositorio',
  //   label: 'Estructura del Repositorio',
  //   icon: '📦',
  //   href: '/estructura-repositorio',
  //   isExpandable: true,
  //   children: [
  //     {
  //       id: 'estructura-ver',
  //       label: 'Ver Estructura',
  //       icon: '🗂️',
  //       href: '/estructura/ver'
  //     },
  //     {
  //       id: 'estructura-modificar',
  //       label: 'Modificar',
  //       icon: '⚙️',
  //       href: '/estructura/modificar'
  //     }
  //   ]
  // },
  // {
  //   id: 'gestion-estructura',
  //   label: 'Gestión de Estructura',
  //   icon: '⚙️',
  //   href: '/gestion-estructura',
  //   isExpandable: true,
  //   children: [
  //     {
  //       id: 'gestion-configurar',
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
  //       id: 'bitacora-ver',
  //       label: 'Ver Registros',
  //       icon: '📈',
  //       href: '/bitacora/ver'
  //     },
  //     {
  //       id: 'bitacora-exportar',
  //       label: 'Exportar',
  //       icon: '💾',
  //       href: '/bitacora/exportar'
  //     }
  //   ]
  }
];