import type { NavItem } from './Types/CommonTypes';

const homeIcon = 'system-icon:home';
const rolesIcon = 'system-icon:shield';
// const rolesListIcon = 'system-icon:contacts';
// const addRoles = 'system-icon:add';
const nutIcon = 'system-icon:nut';
const plusIcon = 'system-icon:plus';
const trashIcon = 'system-icon:trash-can';
const editIcon = 'system-icon:edit-element';
const boxIcon = 'system-icon:box-archive';
const userIcon = 'system-icon:user';

/**
 * isActive: true // Es la página actual
 * isExpandable: true // Es expandible si tiene subelementos
 * children: NavItem[] // Los subelementos del elemento
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
    href: '/roles/listar',
    isActive: false
    /*isExpandable: true,
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
    ]*/
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: userIcon,
    href: '/usuarios/listar',
    isActive: false,
  },
  {
    id: 'estructuraVer',
    label: 'Estructura del Repositorio',
    icon: boxIcon,
    href: '/estructura/repositorio',
    isActive: false,
    isExpandable: false
  },
  {
    id: 'estructura',
    label: 'Gestión de Estructura',
    icon: nutIcon,
    href: '/estructura',
    isActive: false,
    isExpandable: true,
    children: [
      {
        id: 'estructuraCrear',
        label: 'Crear Elemento',
        icon: plusIcon,
        href: '/estructura/crear'
      },
      {
        id: 'estructuraEditar',
        label: 'Editar Elemento',
        icon: editIcon,
        href: '/estructura/editar'
      },
      {
        id: 'deleteElements',
        label: 'Eliminar Elementos',
        icon: trashIcon,
        href: '/estructura/eliminar'
      }
    ]
  },
];