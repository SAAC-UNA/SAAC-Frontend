/**
 * SystemIcons - Sistema centralizado de iconos para toda la aplicación
 * 
 * Beneficios:
 * - Un solo lugar para todos los iconos del sistema
 * - Consistencia automática en toda la app
 * - Fácil cambio de biblioteca de iconos
 * - Control de tamaños y colores centralizado
 * - Tree-shaking automático
 */

export interface IconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

/**
 * Obtiene las clases de tamaño según el size prop
 */
const getSizeClasses = (size: IconProps['size'] = 'md'): string => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  return sizes[size];
};

/**
 * Sistema centralizado de iconos
 * Agrupa por categorías para mejor organización
 */
export const SystemIcons = {
  // ===== ACCIONES GENERALES =====
  actions: {
    view: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M12 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
        <path fillRule="evenodd" d="M12 5.5c-2.618 0-4.972 1.051-6.668 2.353-.85.652-1.547 1.376-2.036 2.08-.48.692-.796 1.418-.796 2.067 0 .649.317 1.375.796 2.066.49.705 1.186 1.429 2.036 2.08C7.028 17.45 9.382 18.5 12 18.5c2.618 0 4.972-1.051 6.668-2.353.85-.652 1.547-1.376 2.035-2.08.48-.692.797-1.418.797-2.067 0-.649-.317-1.375-.797-2.066-.488-.705-1.185-1.429-2.035-2.08C16.972 6.55 14.618 5.5 12 5.5ZM8.25 12a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" clipRule="evenodd" />
      </svg>
    ),

    edit: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M14.607 3.5a.5.5 0 0 1 .353.146l2.829 2.829a.5.5 0 0 1 0 .707l-9.193 9.192a.5.5 0 0 1-.227.13l-3.828 1a.5.5 0 0 1-.61-.61l1-3.828a.5.5 0 0 1 .13-.227l9.192-9.193a.5.5 0 0 1 .354-.146Z" />
        <path d="M4 19.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5H4Z" />
      </svg>
    ),

    delete: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M9.25 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v.75H19a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1 0-1.5h4.25V3Z" />
        <path fillRule="evenodd" d="M6.24 7.945a.5.5 0 0 1 .497-.445h10.526a.5.5 0 0 1 .497.445l.2 1.801a44.213 44.213 0 0 1 0 9.771l-.02.177a2.603 2.603 0 0 1-2.226 2.29 26.788 26.788 0 0 1-7.428 0 2.603 2.603 0 0 1-2.227-2.29l-.02-.177a44.239 44.239 0 0 1 0-9.77l.2-1.802Zm4.51 3.455a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0v-7Zm4 0a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0v-7Z" clipRule="evenodd" />
      </svg>
    ),

    add: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M7.345 4.017a42.253 42.253 0 0 1 9.31 0c1.713.192 3.095 1.541 3.296 3.26a40.66 40.66 0 0 1 0 9.445 3.734 3.734 0 0 1-3.296 3.26 42.123 42.123 0 0 1-9.31 0 3.734 3.734 0 0 1-3.296-3.26 40.652 40.652 0 0 1 0-9.444 3.734 3.734 0 0 1 3.295-3.26ZM12 7.007a.75.75 0 0 1 .75.75v3.493h3.493a.75.75 0 1 1 0 1.5H12.75v3.493a.75.75 0 0 1-1.5 0V12.75H7.757a.75.75 0 0 1 0-1.5h3.493V7.757a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
      </svg>
    ),

    save: ({ className, size, color }: IconProps) => (
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

    home: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path d="M13.796 4.136a2.5 2.5 0 0 0-3.592 0L5.405 9.092c-.275.284-.46.644-.532 1.034a28.756 28.756 0 0 0-.127 9.624l.176 1.13c.056.357.364.62.725.62H9a.5.5 0 0 0 .5-.5v-7h5v7a.5.5 0 0 0 .5.5h3.353a.733.733 0 0 0 .724-.62l.177-1.13a28.759 28.759 0 0 0-.127-9.624 2.007 2.007 0 0 0-.533-1.034l-4.798-4.956Z" />
      </svg>
    ),

    arrow: {
      left: ({ className, size, color }: IconProps) => (
        <svg
          className={`${getSizeClasses(size)} ${className || ''}`}
          viewBox="0 0 24 24"
          fill={color || "currentColor"}
        >
          <path fillRule="evenodd" d="M14.03 7.47a.75.75 0 0 1 0 1.06L10.56 12l3.47 3.47a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
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

  // ===== INTERFAZ =====
  interface: {
    search: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),

    loading: ({ className, size }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''} animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),

    close: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
      </svg>
    ),

    alert: ({ className, size, color }: IconProps) => (
      <svg
        className={`${getSizeClasses(size)} ${className || ''}`}
        viewBox="0 0 24 24"
        fill={color || "currentColor"}
      >
        <path fillRule="evenodd" d="M9.73 3.993a2.749 2.749 0 0 1 4.54 0l.432.632a75.951 75.951 0 0 1 6.944 12.563l.09.208a2.511 2.511 0 0 1-2.024 3.497 69.43 69.43 0 0 1-15.424 0 2.511 2.511 0 0 1-2.024-3.497l.09-.208A75.95 75.95 0 0 1 9.298 4.625l.432-.632ZM13 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 2.75a.75.75 0 0 1 .75.75v5a.75.75 0 1 1-1.5 0v-5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
      </svg>
    )
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
  }
};

// Función auxiliar para obtener iconos por nombre (usado en navegación)
export const getIconByName = (iconName: string, size: IconProps['size'] = 'md'): React.ReactElement | null => {
  const iconMap: Record<string, () => React.ReactElement> = {
    // Navigation
    'home': () => SystemIcons.navigation.home({ size }),
    'caret-left': () => SystemIcons.navigation.arrow.left({ size }),

    // Actions
    'add': () => SystemIcons.actions.add({ size }),
    'edit-alt': () => SystemIcons.actions.edit({ size }),
    'trash': () => SystemIcons.actions.delete({ size }),
    'eye': () => SystemIcons.actions.view({ size }),

    // Users
    'user': () => SystemIcons.users.user({ size }),
    'contacts': () => SystemIcons.users.contacts({ size }),

    // Work & Security
    'shield': () => SystemIcons.users.roles({ size }), // Usando roles que tiene el shield
    'bag': () => SystemIcons.work.bag({ size }),

    // Structure - nuevos iconos
    'nut': () => SystemIcons.structure.nut({ size }),
    'plus': () => SystemIcons.structure.create({ size }),
    'trash-can': () => SystemIcons.structure.trashCan({ size }),
    'edit-element': () => SystemIcons.structure.editElement({ size }),

    // Interface
    'info-triangle': () => SystemIcons.interface.alert({ size }),
    'logout': () => SystemIcons.actions.logout({ size }),

    // Repository
    'box-archive': () => SystemIcons.repository.boxArchive({ size })
  };

  return iconMap[iconName] ? iconMap[iconName]() : null;
};