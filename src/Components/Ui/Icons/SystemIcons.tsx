/**
 * SystemIcons - Sistema centralizado de iconos para toda la aplicación
 * 
 * Beneficios:
 * - Un solo lugar para todos los iconos del sistema
 * - Consistencia automática en toda la app
 * - Fácil cambio de biblioteca de iconos
 * - Control de tamaños y colores centralizado
 * - Tree-shaking automático
 * 
 * ESTANDARIZACIÓN DE COLORES:
 * Solo los iconos de ACCIONES (view, edit, delete, add, cancel, informationCircle)
 * tienen colores por defecto para uso en tablas y listas.
 * 
 * Los iconos del SIDEBAR (home, nut, plus, edit-element, trash-can, shield, box-archive, logout)
 * NO tienen colores por defecto porque usan currentColor para adaptarse dinámicamente
 * al estado activo/inactivo (blanco/rojo UNA).
 */

export interface IconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: string;
}

/**
/**
 * Obtiene las clases de tamaño según el size prop.
 * Retorna string vacío si size no fue pasado explícitamente,
 * para que className (con ICON_SIZES) sea el único que controla el tamaño.
 *
 * TODO: Una vez todos los íconos hayan migrado al nuevo estándar CSS (index.css),
 * eliminar esta función y el prop `size` de IconProps. Los tamaños se controlarán
 * únicamente mediante `className` con las clases CSS: size-icon-sm, size-icon-md,
 * size-icon-lg, size-icon-button (definidas en @layer utilities de index.css).
 * También eliminar los tamaños sin variable CSS: 'xs', 'xl', '2xl', '3xl'.
 */
const getSizeClasses = (size?: IconProps['size']): string => {
  if (!size) return 'flex-shrink-0';
  const sizes: Record<NonNullable<IconProps['size']>, string> = {
    xs: 'w-3 h-3 flex-shrink-0',
    sm: 'w-4 h-4 flex-shrink-0',
    md: 'w-5 h-5 flex-shrink-0',
    lg: 'w-6 h-6 flex-shrink-0',
    xl: 'w-8 h-8 flex-shrink-0',
    '2xl': 'w-12 h-12 flex-shrink-0',
    '3xl': 'w-16 h-16 flex-shrink-0'
  };
  return sizes[size];
};

/**
 * Sistema centralizado de iconos
 * Agrupa por categorías para mejor organización
 */
export const SystemIcons = {
  // ===== ACCIONES GENERALES =====
  // NOTA: Estos iconos tienen colores por defecto para uso en tablas/listas
  actions: {
    view: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 22 22"
        fill="currentColor"
      >
        <path d="M12 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
        <path fillRule="evenodd" d="M12 5.5c-2.618 0-4.972 1.051-6.668 2.353-.85.652-1.547 1.376-2.036 2.08-.48.692-.796 1.418-.796 2.067 0 .649.317 1.375.796 2.066.49.705 1.186 1.429 2.036 2.08C7.028 17.45 9.382 18.5 12 18.5c2.618 0 4.972-1.051 6.668-2.353.85-.652 1.547-1.376 2.035-2.08.48-.692.797-1.418.797-2.067 0-.649-.317-1.375-.797-2.066-.488-.705-1.185-1.429-2.035-2.08C16.972 6.55 14.618 5.5 12 5.5ZM8.25 12a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" clipRule="evenodd" />
      </svg>
    ),

    edit: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 22 22"
        fill="currentColor"
      >
        <path d="M14.607 3.5a.5.5 0 0 1 .353.146l2.829 2.829a.5.5 0 0 1 0 .707l-9.193 9.192a.5.5 0 0 1-.227.13l-3.828 1a.5.5 0 0 1-.61-.61l1-3.828a.5.5 0 0 1 .13-.227l9.192-9.193a.5.5 0 0 1 .354-.146Z" />
        <path d="M4 19.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5H4Z" />
      </svg>
    ),

    delete: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 22 22"
        fill="currentColor"
      >
        <path d="M9.25 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v.75H19a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1 0-1.5h4.25V3Z" />
        <path fillRule="evenodd" d="M6.24 7.945a.5.5 0 0 1 .497-.445h10.526a.5.5 0 0 1 .497.445l.2 1.801a44.213 44.213 0 0 1 0 9.771l-.02.177a2.603 2.603 0 0 1-2.226 2.29 26.788 26.788 0 0 1-7.428 0 2.603 2.603 0 0 1-2.227-2.29l-.02-.177a44.239 44.239 0 0 1 0-9.77l.2-1.802Zm4.51 3.455a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0v-7Zm4 0a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0v-7Z" clipRule="evenodd" />
      </svg>
    ),

    power: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 22 22"
        fill="currentColor"
      >
        <path
      fillRule="evenodd"
      d="M3.25 12a8.75 8.75 0 1 1 17.5 0 8.75 8.75 0 0 1-17.5 0ZM12 6.25a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75Zm-2 1.832c0-.183-.19-.302-.348-.212a4.75 4.75 0 1 0 4.696 0c-.159-.09-.348.03-.348.212v1.234c0 .077.036.15.095.199a3.25 3.25 0 1 1-4.19 0A.261.261 0 0 0 10 9.316V8.082Z"
      clipRule="evenodd"
    />
  </svg>

    ),

    add: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M7.345 4.017a42.253 42.253 0 0 1 9.31 0c1.713.192 3.095 1.541 3.296 3.26a40.66 40.66 0 0 1 0 9.445 3.734 3.734 0 0 1-3.296 3.26 42.123 42.123 0 0 1-9.31 0 3.734 3.734 0 0 1-3.296-3.26 40.652 40.652 0 0 1 0-9.444 3.734 3.734 0 0 1 3.295-3.26ZM12 7.007a.75.75 0 0 1 .75.75v3.493h3.493a.75.75 0 1 1 0 1.5H12.75v3.493a.75.75 0 0 1-1.5 0V12.75H7.757a.75.75 0 0 1 0-1.5h3.493V7.757a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
      </svg>
    ),
/*
    addSquare: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <g clipPath="url(#clip0_4418_4944)">
          <path
            opacity={0.4}
            d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2Z"
          />
          <path d="M16 11.25H12.75V8C12.75 7.59 12.41 7.25 12 7.25C11.59 7.25 11.25 7.59 11.25 8V11.25H8C7.59 11.25 7.25 11.59 7.25 12C7.25 12.41 7.59 12.75 8 12.75H11.25V16C11.25 16.41 11.59 16.75 12 16.75C12.41 16.75 12.75 16.41 12.75 16V12.75H16C16.41 12.75 16.75 12.41 16.75 12C16.75 11.59 16.41 11.25 16 11.25Z" />
        </g>
        <defs>
          <clipPath id="clip0_4418_4944">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
*/
    save: ({ className, size, color = 'var(--color-verde)' }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
      </svg>
    ),

    cancel: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
      </svg>
    ),

    logout: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M11.25 19a.75.75 0 0 1 .75-.75h6a.25.25 0 0 0 .25-.25V6a.25.25 0 0 0-.25-.25h-6a.75.75 0 0 1 0-1.5h6c.966 0 1.75.784 1.75 1.75v12A1.75 1.75 0 0 1 18 19.75h-6a.75.75 0 0 1-.75-.75Z" />
        <path d="M15.612 13.115a1 1 0 0 1-1 1H9.756c-.023.356-.052.71-.086 1.066l-.03.305a.718.718 0 0 1-1.025.578 16.844 16.844 0 0 1-4.885-3.539l-.03-.031a.721.721 0 0 1 0-.998l.03-.031a16.843 16.843 0 0 1 4.885-3.539.718.718 0 0 1 1.025.578l.03.305c.034.355.063.71.086 1.066h4.856a1 1 0 0 1 1 1v2.24Z" />
      </svg>
    ),

    export: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M8.063 5.438 12 1.5l3.938 3.938" />
        <path d="M12 12V1.5" />
        <path d="M16.5 9.375h2.25a.75.75 0 0 1 .75.75V19.5a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75v-9.375a.75.75 0 0 1 .75-.75H7.5" />
      </svg>
    ),

    download: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M12 3v12m0 0-4-4m4 4 4-4" />
        <path d="M3.75 19.5h16.5" />
      </svg>
    ),

    copy: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M8 8V5.2A2.2 2.2 0 0 1 10.2 3h8.6A2.2 2.2 0 0 1 21 5.2v8.6A2.2 2.2 0 0 1 18.8 16H16" />
        <path d="M5.2 8A2.2 2.2 0 0 0 3 10.2v8.6A2.2 2.2 0 0 0 5.2 21h8.6A2.2 2.2 0 0 0 16 18.8V16" />
      </svg>
    ),

    linkIcon: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="m12.421 5.746.9-.91a4.134 4.134 0 0 1 5.841 5.841l-2.84 2.832a4.116 4.116 0 0 1-5.832 0" />
        <path d="m11.578 18.255-.9.909a4.135 4.135 0 0 1-5.84-5.84l2.84-2.832a4.115 4.115 0 0 1 5.831 0" />
      </svg>
    )
  },

  // ===== INTERFAZ =====
  interface: {
    search: ({ className, size, color = 'currentColor' }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),

    loading: ({ className, size, color = 'var(--color-rojo-una-2)' }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''} animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="4" className="opacity-25" />
        <path fill={color} className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),

    closeCircle: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.769 9.769 0 0 0 12 2.25Zm3.534 12.216a.76.76 0 0 1 0 1.068.769.769 0 0 1-1.068 0L12 13.06l-2.466 2.475a.769.769 0 0 1-1.068 0 .76.76 0 0 1 0-1.068L10.94 12 8.466 9.534a.76.76 0 0 1 1.068-1.068L12 10.94l2.466-2.475a.76.76 0 0 1 1.068 1.068L13.06 12l2.475 2.466Z" />
      </svg>
    ),

    alert: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M9.73 3.993a2.749 2.749 0 0 1 4.54 0l.432.632a75.951 75.951 0 0 1 6.944 12.563l.09.208a2.511 2.511 0 0 1-2.024 3.497 69.43 69.43 0 0 1-15.424 0 2.511 2.511 0 0 1-2.024-3.497l.09-.208A75.95 75.95 0 0 1 9.298 4.625l.432-.632ZM13 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 2.75a.75.75 0 0 1 .75.75v5a.75.75 0 1 1-1.5 0v-5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
      </svg>
    ),

    bell: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
      </svg>
    ),
// ! Ver si eliminar, este está repetido pero con relleno
    eye: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
// ! Ver si eliminar, este está repetido pero con relleno
    eyeSlash: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),

    infoCircle: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    ),

    user: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),

    lock: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    
    back: ({ className, size, color = 'var(--color-rojo-una-2)' }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color}
      >
        <path d="M20.446 16.06a.5.5 0 0 1-.655.68l-2.5-1.153a14.381 14.381 0 0 0-6.681-1.309 61.43 61.43 0 0 1-.121 2.204l-.069.938a.754.754 0 0 1-1.158.581 19.55 19.55 0 0 1-5.351-5.068l-.46-.64a.5.5 0 0 1 0-.584l.46-.64A19.55 19.55 0 0 1 9.262 6a.754.754 0 0 1 1.158.58l.069.94c.046.63.082 1.26.108 1.89h.644a9.5 9.5 0 0 1 8.475 5.209l.73 1.442Z" />
        </svg>
    ),

    refresh: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
      </svg>
    ),

    expand: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path
        fillRule="evenodd"
        d="M13.664 6.343c0 .414.336.75.75.75h2.493v2.493a.75.75 0 0 0 1.5 0V6.343a.75.75 0 0 0-.75-.75h-3.243a.75.75 0 0 0-.75.75Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M17.657 13.664a.75.75 0 0 0-.75.75v2.493h-2.493a.75.75 0 0 0 0 1.5h3.243a.75.75 0 0 0 .75-.75v-3.243a.75.75 0 0 0-.75-.75Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.343 13.664a.75.75 0 0 1 .75.75v2.493h2.493a.75.75 0 0 1 0 1.5H6.343a.75.75 0 0 1-.75-.75v-3.243a.75.75 0 0 1 .75-.75Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M10.336 6.343a.75.75 0 0 1-.75.75H7.093v2.493a.75.75 0 1 1-1.5 0V6.343a.75.75 0 0 1 .75-.75h3.243a.75.75 0 0 1 .75.75Z"
        clipRule="evenodd"
      />
      </svg>
    ),

    link: ({ className, size, color = 'currentColor' }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="m12.421 5.746.9-.91a4.134 4.134 0 0 1 5.841 5.841l-2.84 2.832a4.116 4.116 0 0 1-5.832 0" />
        <path d="m11.578 18.255-.9.909a4.135 4.135 0 0 1-5.84-5.84l2.84-2.832a4.115 4.115 0 0 1 5.831 0" />
      </svg>
    ),

    collapse: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path
          fillRule="evenodd"
          d="M18.028 9.964a.75.75 0 0 0-.75-.75h-2.492V6.722a.75.75 0 0 0-1.5 0v3.242c0 .415.335.75.75.75h3.242a.75.75 0 0 0 .75-.75Z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M14.036 18.028a.75.75 0 0 0 .75-.75v-2.493h2.492a.75.75 0 0 0 0-1.5h-3.242a.75.75 0 0 0-.75.75v3.243c0 .414.335.75.75.75Z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M9.964 18.028a.75.75 0 0 1-.75-.75v-2.493H6.722a.75.75 0 0 1 0-1.5h3.242a.75.75 0 0 1 .75.75v3.243a.75.75 0 0 1-.75.75Z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M5.972 9.964a.75.75 0 0 1 .75-.750h2.492V6.722a.75.75 0 0 1 1.5 0v3.242a.75.75 0 0 1-.75.75H6.722a.75.75 0 0 1-.75-.75Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    cloud: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}

      >
          <path
          fillRule="evenodd"
          d="M21.03 4.83a.75.75 0 1 0-1.06-1.06l-16 16a.75.75 0 0 0 1.06 1.06l2.08-2.08h11.413a4.478 4.478 0 1 0-.19-8.951 5.38 5.38 0 0 0-.437-1.834L21.03 4.83Zm-4.31 4.312L8.61 17.25h9.912a2.978 2.978 0 1 0-.77-5.854.75.75 0 0 1-.939-.813 3.957 3.957 0 0 0-.095-1.44Z"
          clipRule="evenodd"
        />
        <path d="M12.932 4.708c1.107 0 2.136.333 2.993.903a.24.24 0 0 1 .032.371l-.728.728a.261.261 0 0 1-.317.036 3.91 3.91 0 0 0-5.504 1.676.75.75 0 0 1-.947.373 4.375 4.375 0 0 0-3.708 7.906c.152.086.19.295.067.419l-.724.723a.243.243 0 0 1-.299.038A5.875 5.875 0 0 1 8.38 7.195a5.405 5.405 0 0 1 4.552-2.487Z" />
      </svg>
    ),

    upload: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M15.01 3.75a8.26 8.26 0 0 0-7.388 4.566 8.119 8.119 0 0 0-.872 3.656.769.769 0 0 1-.694.778.75.75 0 0 1-.806-.75c0-1.048.168-2.09.497-3.084a.375.375 0 0 0-.44-.488A6 6 0 0 0 .75 14.25c0 3.3 2.794 6 6.084 6H15a8.25 8.25 0 0 0 .01-16.5Zm2.952 10.463a.778.778 0 0 1-.534.215.75.75 0 0 1-.525-.216L15 12.31V18a.75.75 0 1 1-1.5 0v-5.69l-1.903 1.902a.75.75 0 0 1-1.06-1.059l3.179-3.187a.76.76 0 0 1 1.068 0l3.178 3.187a.75.75 0 0 1 0 1.06Z" />
      </svg>
    ),

    uploadArrow: ({ className, size, color }: IconProps) => (
        <svg
          className={`${getSizeClasses(size)} ${className || ''}`}
          viewBox="0 0 24 24"
          fill={color || "currentColor"}
        >
          <path
            fillRule="evenodd"
            d="M5 16.25a.75.75 0 0 1 .75.75v2c0 .138.112.25.25.25h12a.25.25 0 0 0 .25-.25v-2a.75.75 0 0 1 1.5 0v2A1.75 1.75 0 0 1 18 20.75H6A1.75 1.75 0 0 1 4.25 19v-2a.75.75 0 0 1 .75-.75Z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M10.738 16.127a.992.992 0 0 1-.989-.905 36.618 36.618 0 0 1-.08-5.27c-.248-.014-.495-.03-.741-.048l-1.49-.109a.76.76 0 0 1-.585-1.167 15.555 15.555 0 0 1 4.032-4.258l.597-.429a.888.888 0 0 1 1.036 0l.597.43a15.556 15.556 0 0 1 4.032 4.257.76.76 0 0 1-.585 1.167l-1.49.109c-.246.018-.493.034-.74.047.1 1.757.072 3.518-.082 5.27a.992.992 0 0 1-.988.906h-2.524Z"
            clipRule="evenodd"
          />
        </svg>
    ),

    calendar: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M7.75 4a.75.75 0 0 0-1.5 0v1.816a3.375 3.375 0 0 0-2.872 2.899l-.087.653-.042.332a.493.493 0 0 0 .492.55H20.26a.493.493 0 0 0 .492-.55c-.013-.11-.027-.222-.042-.332l-.087-.653a3.375 3.375 0 0 0-2.872-2.899V4a.75.75 0 0 0-1.5 0v1.668a47.912 47.912 0 0 0-8.5 0V4Z" />
        <path d="M20.945 12.226a.494.494 0 0 0-.496-.476H3.551a.494.494 0 0 0-.496.476 28.92 28.92 0 0 0 .33 5.41 3.01 3.01 0 0 0 2.678 2.532l1.193.118c3.155.31 6.333.31 9.488 0l1.193-.118a3.01 3.01 0 0 0 2.678-2.532 28.92 28.92 0 0 0 .33-5.41Z" />
      </svg>
    ),

    /** Reloj - Para estados pendientes y tiempos de espera */
    clock: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.769 9.769 0 0 0 12 2.25Zm5.25 10.5H12a.75.75 0 0 1-.75-.75V6.75a.75.75 0 1 1 1.5 0v4.5h4.5a.75.75 0 1 1 0 1.5Z" />
      </svg>
    ),

    hourglass: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M18.75 7.088V3.75a1.5 1.5 0 0 0-1.5-1.5H6.75a1.5 1.5 0 0 0-1.5 1.5v3.375a1.51 1.51 0 0 0 .6 1.2L10.753 12 5.85 15.675a1.51 1.51 0 0 0-.6 1.2v3.375a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5v-3.337a1.51 1.51 0 0 0-.6-1.2L13.247 12l4.903-3.713a1.51 1.51 0 0 0 .6-1.2Z" />
      </svg>
    ),

    /** Ciclo/reinicio - Para marcar como en progreso */
    inProgress: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 7.5V12" />
        <path d="M15.9 14.25 12 12" />
        <path d="M6.731 9.348h-3.75v-3.75" />
        <path d="M6.169 17.831a8.25 8.25 0 1 0 0-11.662L2.98 9.347" />
      </svg>
    ),

    /** Chevron down - Para dropdowns y secciones colapsables */
    chevronDown: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    ),

    /** Chevron up - Para dropdowns y ordenamiento ascendente */
    chevronUp: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ),

    /** Chevron left - Para navegación hacia atrás y paginación */
    chevronLeft: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    ),

    /** Chevron right - Para navegación hacia adelante y paginación */
    chevronRight: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    ),

    /** Filter - Para filtros y opciones de filtrado */
    filter: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M18.523 4.226a58.727 58.727 0 0 0-13.046 0 1.373 1.373 0 0 0-.915 2.229l3.769 4.659A7.5 7.5 0 0 1 10 15.83v3.142a.75.75 0 0 0 .306.605l2.77 2.032a.58.58 0 0 0 .924-.468V15.83a7.5 7.5 0 0 1 1.669-4.717l3.769-4.66a1.373 1.373 0 0 0-.915-2.228Z" />
  </svg>
    ),

    // ===== ICONOS ESPECÍFICOS PARA MODALES =====
    
    /** Círculo de información - Para mensajes informativos */
    informationCircle: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3.25 12a8.75 8.75 0 1 1 17.5 0 8.75 8.75 0 0 1-17.5 0ZM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 2.75a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75Z"
          clipRule="evenodd"
        />
      </svg>
    ),

    /** Círculo con check - Para mensajes de éxito */
    checkCircle: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.769 9.769 0 0 0 12 2.25Zm4.64 8.044-5.493 5.25a.76.76 0 0 1-.525.206.722.722 0 0 1-.516-.206L7.36 12.919a.75.75 0 1 1 1.032-1.088l2.23 2.128 4.988-4.753a.75.75 0 0 1 1.032 1.088Z" />
      </svg>
    ),

    /** Círculo con X - Para mensajes de error o rechazo */
    xCircle: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.769 9.769 0 0 0 12 2.25Zm3.53 12.22a.75.75 0 1 1-1.06 1.06L12 13.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L10.94 12 8.47 9.53a.75.75 0 0 1 1.06-1.06L12 10.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L13.06 12l2.47 2.47Z" />
      </svg>
    ),

    /** Check simple - Para items seleccionados en dropdowns/listas */
    check: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        fill={color || "currentColor"}
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )
  },

  // ===== NAVEGACIÓN =====
  navigation: {
    menu: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M3.75 12h16.5" />
        <path d="M3.75 6h16.5" />
        <path d="M3.75 18h16.5" />
      </svg>
    ),

    light: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M16.5 21.749a.75.75 0 0 1-.75.75h-7.5a.75.75 0 1 1 0-1.5h7.5a.75.75 0 0 1 .75.75Zm3.75-12a8.222 8.222 0 0 1-3.15 6.487 1.51 1.51 0 0 0-.6 1.2V18a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 18v-.563a1.52 1.52 0 0 0-.581-1.19 8.232 8.232 0 0 1-3.17-6.45C3.722 5.325 7.341 1.603 11.803 1.5a8.241 8.241 0 0 1 8.447 8.25Zm-3.075-.882a5.23 5.23 0 0 0-4.294-4.284.75.75 0 0 0-.244 1.481 3.721 3.721 0 0 1 3.057 3.057.75.75 0 0 0 .74.618h.131a.74.74 0 0 0 .61-.872Z" />
      </svg>
    ),

    home: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M13.796 4.136a2.5 2.5 0 0 0-3.592 0L5.405 9.092c-.275.284-.46.644-.532 1.034a28.756 28.756 0 0 0-.127 9.624l.176 1.13c.056.357.364.62.725.62H9a.5.5 0 0 0 .5-.5v-7h5v7a.5.5 0 0 0 .5.5h3.353a.733.733 0 0 0 .724-.62l.177-1.13a28.759 28.759 0 0 0-.127-9.624 2.007 2.007 0 0 0-.533-1.034l-4.798-4.956Z" />
      </svg>
    ),

    auditLog: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M20.25 4.5h-15A1.5 1.5 0 0 0 3.75 6v11.25a.75.75 0 1 1-1.5 0v-9a.75.75 0 0 0-1.5 0v9A2.25 2.25 0 0 0 3 19.5h16.5a2.26 2.26 0 0 0 2.25-2.25V6a1.5 1.5 0 0 0-1.5-1.5Zm-3.75 9.75H9a.75.75 0 1 1 0-1.5h7.5a.75.75 0 1 1 0 1.5Zm0-3H9a.75.75 0 1 1 0-1.5h7.5a.75.75 0 1 1 0 1.5Z" />
      </svg>
    ),

    arrow: {
      left: ({ className, size, color }: IconProps) => (
        <svg
          className={`${getSizeClasses(size)} ${className || ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color || "currentColor"}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.25 12H3.75" />
          <path d="M10.5 5.25 3.75 12l6.75 6.75" />
        </svg>
      ),

      right: ({ className, size, color }: IconProps) => (
        <svg
          className={`${getSizeClasses(size)} ${className || ''}`}
          viewBox="0 0 24 24"
          fill={color || "currentColor"}
        >
          <path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
      )
    }
  },

  // ===== USUARIOS Y ROLES =====
  users: {
    user: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M12 3.75a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
        <path d="M8 13.25A3.75 3.75 0 0 0 4.25 17v1.188c0 .754.546 1.396 1.29 1.517 4.278.699 8.642.699 12.92 0a1.537 1.537 0 0 0 1.29-1.517V17A3.75 3.75 0 0 0 16 13.25h-.34c-.185 0-.369.03-.544.086l-.866.283a7.251 7.251 0 0 1-4.5 0l-.866-.283a1.752 1.752 0 0 0-.543-.086H8Z" />
      </svg>
    ),

    contacts: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M16.456 2.883a31.331 31.331 0 0 0-8.913 0 3.197 3.197 0 0 0-2.728 2.874l-.127 1.396a53.504 53.504 0 0 0 0 9.694l.127 1.396a3.197 3.197 0 0 0 2.728 2.874c2.956.425 5.958.425 8.913 0a3.197 3.197 0 0 0 2.73-2.874l.126-1.396c.293-3.225.293-6.47 0-9.694l-.127-1.396a3.196 3.196 0 0 0-2.729-2.874ZM10 9a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-2 6.5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3 1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" clipRule="evenodd" />
      </svg>
    ),

    roles: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M13.16 4.407a2.25 2.25 0 0 0-2.32 0l-.517.311a9.75 9.75 0 0 1-4.115 1.354l-.325.031A1.25 1.25 0 0 0 4.75 7.347v1.644a10.25 10.25 0 0 0 3.126 7.37l3.255 3.147a1.25 1.25 0 0 0 1.738 0l3.255-3.147a10.25 10.25 0 0 0 3.126-7.37V7.347a1.25 1.25 0 0 0-1.133-1.244l-.325-.03a9.75 9.75 0 0 1-4.115-1.355l-.516-.31Z" />
      </svg>
    )
  },

  // ===== TRABAJO Y REPORTES =====
  work: {
    bag: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M7.25 5.461v1.42l-1.694.138a2.61 2.61 0 0 0-2.367 2.184c-.041.258-.08.516-.114.775a.298.298 0 0 0 .169.308l.077.036c5.429 2.57 11.93 2.57 17.358 0l.077-.036a.298.298 0 0 0 .168-.308 26.748 26.748 0 0 0-.113-.775 2.61 2.61 0 0 0-2.367-2.184l-1.694-.137v-1.42a1.75 1.75 0 0 0-1.49-1.731l-1.22-.183a13.75 13.75 0 0 0-4.08 0l-1.22.183a1.75 1.75 0 0 0-1.49 1.73Zm6.567-.43a12.25 12.25 0 0 0-3.634 0l-1.22.183a.25.25 0 0 0-.213.247v1.315a56.826 56.826 0 0 1 6.5 0V5.461a.25.25 0 0 0-.213-.247l-1.22-.183Z" clipRule="evenodd" />
        <path d="M21.118 12.07a.2.2 0 0 0-.282-.17c-5.571 2.467-12.101 2.467-17.672 0a.2.2 0 0 0-.282.17 26.88 26.88 0 0 0 .307 5.727 2.61 2.61 0 0 0 2.367 2.184l1.872.152c3.043.245 6.1.245 9.144 0l1.872-.151a2.61 2.61 0 0 0 2.367-2.185c.306-1.895.41-3.815.307-5.726Z" />
      </svg>
    ),

    assignEvidence: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="m20.025 7.715-5.24-5.25-.029-.019-.028-.028-.028-.019-.028-.019c-.01-.009-.019-.009-.019-.018l-.047-.028h-.018l-.047-.029h-.01l-.065-.028H5.25a1.5 1.5 0 0 0-1.5 1.472v16.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-12a.731.731 0 0 0-.225-.534Zm-4.519 10.05a.75.75 0 0 1-.525.215.776.776 0 0 1-.534-.215l-1.022-1.031a3.45 3.45 0 0 1-1.8.515A3.375 3.375 0 1 1 15 13.874a3.356 3.356 0 0 1-.516 1.8l1.022 1.022a.75.75 0 0 1 0 1.069ZM14.25 8.249V4.06l4.19 4.19h-4.19Z" />
        <path d="M11.625 12a1.865 1.865 0 0 0-1.322.553 1.856 1.856 0 0 0 0 2.644 1.865 1.865 0 0 0 2.644 0 1.855 1.855 0 0 0 0-2.644A1.866 1.866 0 0 0 11.625 12Z" />
      </svg>
    ),

    myEvidences: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="m20.034 6.216-3.75-3.75a.76.76 0 0 0-.534-.216h-7.5a1.5 1.5 0 0 0-1.5 1.5v1.5h-1.5a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5v-1.5h1.5a1.5 1.5 0 0 0 1.5-1.5V6.75a.76.76 0 0 0-.216-.534ZM12.75 18h-4.5a.75.75 0 1 1 0-1.5h4.5a.75.75 0 1 1 0 1.5Zm0-3h-4.5a.75.75 0 1 1 0-1.5h4.5a.75.75 0 1 1 0 1.5Zm6 2.25h-1.5v-7.5a.76.76 0 0 0-.216-.534l-3.75-3.75a.76.76 0 0 0-.534-.216h-4.5v-1.5h7.19l3.31 3.31v10.19Z" />
      </svg>
    )
  },
  // ===== REPOSITORIO =====
  repository: {
    boxArchive: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path
          fillRule="evenodd"
          d="M5.594 4.99 4.537 8.378a2.742 2.742 0 0 0-.344.977l-.102.678a24.426 24.426 0 0 0 .11 7.93 2.414 2.414 0 0 0 2.137 1.977l1.23.123c2.948.292 5.916.292 8.863 0l1.23-.122a2.414 2.414 0 0 0 2.138-1.978c.469-2.62.506-5.298.11-7.93l-.102-.678a2.74 2.74 0 0 0-.365-1.013l-1.037-3.347a2.342 2.342 0 0 0-1.914-1.627 32.594 32.594 0 0 0-8.983 0A2.343 2.343 0 0 0 5.594 4.99Zm10.69-.137a31.094 31.094 0 0 0-8.57 0 .843.843 0 0 0-.688.584l-.501 1.606c.037-.005.075-.01.113-.013l.978-.097c2.916-.29 5.852-.29 8.768 0l.978.097c.036.003.071.008.107.012l-.497-1.604a.841.841 0 0 0-.688-.585ZM16 11.75a.75.75 0 0 0 0-1.5H8a.75.75 0 0 0 0 1.5h8Z"
          clipRule="evenodd"
        />
      </svg>
    )
  },
  // ===== MODALES =====
  modal:{
    document: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M15.75 13a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75Z" />
        <path d="M15.75 17a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75Z" />
        <path
          fillRule="evenodd"
          d="M7 2.25A2.75 2.75 0 0 0 4.25 5v14A2.75 2.75 0 0 0 7 21.75h10A2.75 2.75 0 0 0 19.75 19V7.968c0-.381-.124-.751-.354-1.055l-2.998-3.968a1.75 1.75 0 0 0-1.396-.695H7ZM5.75 5c0-.69.56-1.25 1.25-1.25h7.25v4.397c0 .414.336.75.75.75h3.25V19c0 .69-.56 1.25-1.25 1.25H7c-.69 0-1.25-.56-1.25-1.25V5Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    pdf: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M6 15H4.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 1 0 1.5 0v-.75H6A2.25 2.25 0 1 0 6 15Zm0 3h-.75v-1.5H6A.75.75 0 1 1 6 18Zm12.375-1.5v1.125h1.5a.75.75 0 1 1 0 1.5h-1.5v1.125a.75.75 0 1 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75h2.625a.75.75 0 1 1 0 1.5h-1.875ZM12 15h-1.313a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 .75.75H12a3 3 0 0 0 0-6Zm0 4.5h-.563v-3H12a1.5 1.5 0 1 1 0 3Zm-7.5-6.75h15a.75.75 0 0 0 .75-.75V8.25a.76.76 0 0 0-.216-.534l-5.25-5.25a.76.76 0 0 0-.534-.216h-9a1.5 1.5 0 0 0-1.5 1.5V12a.75.75 0 0 0 .75.75Zm9.75-8.625 4.125 4.125H14.25V4.125Z" />
      </svg>
    ),
    excel: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M18.75 2.25h-12a1.5 1.5 0 0 0-1.5 1.5V6h-1.5a1.5 1.5 0 0 0-1.5 1.5v9a1.5 1.5 0 0 0 1.5 1.5h1.5v2.25a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V3.75a1.5 1.5 0 0 0-1.5-1.5ZM6.488 14.85a.75.75 0 0 1-.15-1.05l1.35-1.8-1.35-1.8a.75.75 0 0 1 1.2-.9l1.087 1.453L9.713 9.3a.75.75 0 1 1 1.2.9L9.563 12l1.35 1.8a.75.75 0 0 1-1.2.9l-1.088-1.453L7.537 14.7a.75.75 0 0 1-1.05.15ZM12 20.25H6.75V18H12v2.25ZM12 6H6.75V3.75H12V6Zm6.75 14.25H13.5V18a1.5 1.5 0 0 0 1.5-1.5v-.75h3.75v4.5Zm0-6H15v-4.5h3.75v4.5Zm0-6H15V7.5A1.5 1.5 0 0 0 13.5 6V3.75h5.25v4.5Z" />
      </svg>
    ),
    key: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
          <path d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.769 9.769 0 0 0 12 2.25Zm0 18A8.25 8.25 0 1 1 20.25 12 8.26 8.26 0 0 1 12 20.25Zm1.725-7.669 1.172 2.728a1.125 1.125 0 0 1-1.031 1.566h-3.732a1.125 1.125 0 0 1-1.03-1.566l1.171-2.728a3 3 0 0 1 .822-5.315 3 3 0 0 1 2.628 5.315Z" />
      </svg>
    ),
  },

// ===== AUTENTICACIÓN =====
  auth: {
    Lock: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path
          fillRule="evenodd"
          d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
          clipRule="evenodd"
        />
      </svg>
    ),

    Eye: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path
          fillRule="evenodd"
          d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
          clipRule="evenodd"
        />
      </svg>
    ),

    EyeSlash: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
      </svg>
    ),

    AlertCircle: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },

  // ===== ESTRUCTURA DEL REPOSITORIO =====
  structure: {
    trashCan: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M9.25 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v.75H19a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1 0-1.5h4.25V3Z" />
        <path
          fillRule="evenodd"
          d="M6.24 7.945a.5.5 0 0 1 .497-.445h10.526a.5.5 0 0 1 .497.445l.2 1.801a44.213 44.213 0 0 1 0 9.771l-.02.177a2.603 2.603 0 0 1-2.226 2.29 26.788 26.788 0 0 1-7.428 0 2.603 2.603 0 0 1-2.227-2.29l-.02-.177a44.239 44.239 0 0 1 0-9.77l.2-1.802Zm8.29 4.525a.75.75 0 0 1 0 1.06L13.06 15l1.47 1.47a.75.75 0 1 1-1.06 1.06L12 16.06l-1.47 1.47a.75.75 0 1 1-1.06-1.06L10.94 15l-1.47-1.47a.75.75 0 1 1 1.06-1.06L12 13.94l1.47-1.47a.75.75 0 0 1 1.06 0Z"
          clipRule="evenodd"
        />

      </svg>
    ),

    create: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M7.345 4.017a42.253 42.253 0 0 1 9.31 0c1.713.192 3.095 1.541 3.296 3.26a40.66 40.66 0 0 1 0 9.445 3.734 3.734 0 0 1-3.296 3.26 42.123 42.123 0 0 1-9.31 0 3.734 3.734 0 0 1-3.296-3.26 40.652 40.652 0 0 1 0-9.444 3.734 3.734 0 0 1 3.295-3.26ZM12 7.007a.75.75 0 0 1 .75.75v3.493h3.493a.75.75 0 1 1 0 1.5H12.75v3.493a.75.75 0 0 1-1.5 0V12.75H7.757a.75.75 0 0 1 0-1.5h3.493V7.757a.75.75 0 0 1 .75-.75Z"
          clipRule="evenodd"
        />
      </svg>
    ),

    editElement: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M16.477 3.004c.167.015.24.219.12.338l-8.32 8.32a.75.75 0 0 0-.195.34l-1 3.83a.75.75 0 0 0 .915.915l3.829-1a.75.75 0 0 0 .34-.196l8.438-8.438a.198.198 0 0 1 .338.12 45.67 45.67 0 0 1-.06 10.073c-.222 1.905-1.753 3.4-3.652 3.613a47.468 47.468 0 0 1-10.46 0c-1.899-.213-3.43-1.708-3.653-3.613a45.672 45.672 0 0 1 0-10.611C3.34 4.789 4.871 3.294 6.77 3.082a47.513 47.513 0 0 1 9.708-.078Z" />
        <path d="M17.823 4.237a.25.25 0 0 1 .354 0l1.414 1.415a.25.25 0 0 1 0 .353L11.297 14.3a.253.253 0 0 1-.113.065l-1.915.5a.25.25 0 0 1-.304-.305l.5-1.914a.25.25 0 0 1 .065-.114l8.293-8.294Z" />
      </svg>
    ),

    nut: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z" />
        <path
          fillRule="evenodd"
          d="M12.68 2.806a1.4 1.4 0 0 0-1.36 0l-7.2 4A1.4 1.4 0 0 0 3.4 8.03v7.94c0 .509.276.977.72 1.224l7.2 4a1.4 1.4 0 0 0 1.36 0l7.2-4a1.4 1.4 0 0 0 .72-1.223V8.03a1.4 1.4 0 0 0-.72-1.224l-7.2-4ZM7.25 12a4.75 4.75 0 1 1 9.5 0 4.75 4.75 0 0 1-9.5 0Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },

  // ===== TIPOS DE ARCHIVO =====
  fileTypes: {
    document: ({ className, size }: IconProps) => (
      <svg className={`${getSizeClasses(size)} text-red-500 ${className || ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
    spreadsheet: ({ className, size }: IconProps) => (
      <svg className={`${getSizeClasses(size)} text-green-600 ${className || ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v4H6V4zm0 6h3v6H6v-6zm5 0h3v6h-3v-6z" clipRule="evenodd" />
      </svg>
    ),
    presentation: ({ className, size }: IconProps) => (
      <svg className={`${getSizeClasses(size)} text-orange-500 ${className || ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
      </svg>
    ),
    image: ({ className, size }: IconProps) => (
      <svg className={`${getSizeClasses(size)} text-purple-500 ${className || ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    ),
    video: ({ className, size }: IconProps) => (
      <svg className={`${getSizeClasses(size)} text-pink-500 ${className || ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
      </svg>
    ),
    archive: ({ className, size }: IconProps) => (
      <svg className={`${getSizeClasses(size)} text-yellow-500 ${className || ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    link: ({ className, size }: IconProps) => (
      <svg className={`${getSizeClasses(size)} text-azul-una ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 20 20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.536 8.464a4 4 0 00-5.657 0l-3 3a4 4 0 005.657 5.657l1.5-1.5m-.586-4.242a4 4 0 005.657 0l3-3a4 4 0 00-5.657-5.657l-1.5 1.5" />
      </svg>
    ),
    other: ({ className, size }: IconProps) => (
      <svg className={`${getSizeClasses(size)} text-gris-una ${className || ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    ),
  },
};

// Función auxiliar para obtener iconos por nombre (usado en navegación)
export const getIconByName = (iconName: string, size: IconProps['size'] = 'md'): React.ReactElement | null => {
  const iconMap: Record<string, () => React.ReactElement> = {
    // Navigation
    'home': () => SystemIcons.navigation.home({ size }),
    'lightbulb': () => SystemIcons.navigation.light({ size }),
    'caret-left': () => SystemIcons.navigation.arrow.left({ size }),
    'auditLog': () => SystemIcons.navigation.auditLog({ size }),

    // Actions
    'add': () => SystemIcons.actions.add({ size }),
    'edit-alt': () => SystemIcons.actions.edit({ size }),
    'trash': () => SystemIcons.actions.delete({ size }),
    'eye': () => SystemIcons.actions.view({ size }),
    'power': () => SystemIcons.actions.power({ size }),

    // Users
    'user': () => SystemIcons.users.user({ size }),
    'contacts': () => SystemIcons.users.contacts({ size }),

    // Work & Security
    'shield': () => SystemIcons.users.roles({ size }), // Usando roles que tiene el shield
    'bag': () => SystemIcons.work.bag({ size }),
    'assignEvidence': () => SystemIcons.work.assignEvidence({ size }),
    'myEvidences': () => SystemIcons.work.myEvidences({ size }),

    // Structure - nuevos iconos
    'nut': () => SystemIcons.structure.nut({ size }),
    'plus': () => SystemIcons.structure.create({ size }),
    'trash-can': () => SystemIcons.structure.trashCan({ size }),
    'edit-element': () => SystemIcons.structure.editElement({ size }),

    // Interface
    'info-triangle': () => SystemIcons.interface.alert({ size }),
    'logout': () => SystemIcons.actions.logout({ size }),
    'back': () => SystemIcons.interface.back({ size }),
    'refresh': () => SystemIcons.interface.refresh({ size }),
    'expand': () => SystemIcons.interface.expand({ size }),
    'collapse': () => SystemIcons.interface.collapse({ size }),
    'calendar': () => SystemIcons.interface.calendar({ size }),
    'chevron-down': () => SystemIcons.interface.chevronDown({ size }),
    'chevron-right': () => SystemIcons.interface.chevronRight({ size }),
    'cloud': () => SystemIcons.interface.cloud({ size }),
    'upload-arrow': () => SystemIcons.interface.uploadArrow({ size }),
    'clock': () => SystemIcons.interface.clock({ size }),
    'hourglass': () => SystemIcons.interface.hourglass({ size }),
    'search': () => SystemIcons.interface.search({ size }),

    // Modal icons
    'exclamation-triangle': () => SystemIcons.interface.alert({ size }),
    'information-circle': () => SystemIcons.interface.informationCircle({ size }),
    'check-circle': () => SystemIcons.interface.checkCircle({ size }),
    'key': () => SystemIcons.modal.key({ size }),
    'document': () => SystemIcons.modal.document({ size }),
    'document-text': () => SystemIcons.modal.document({ size }),

    // Repository
    'box-archive': () => SystemIcons.repository.boxArchive({ size }),
    
    // Work
    'clipboard-list': () => SystemIcons.work.myEvidences({ size }),
    'clipboard-check': () => SystemIcons.work.assignEvidence({ size }),
    'magnifying-glass': () => SystemIcons.interface.search({ size })
  };

  return iconMap[iconName] ? iconMap[iconName]() : null;
};