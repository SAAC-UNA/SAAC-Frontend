/**
 * useFirstColumnConfig - Configuración dinámica para la primera columna de tablas
 *
 * Calcula el ancho (width) y el límite de truncado (maxLength) de la primera columna
 * en función del breakpoint actual y el estado del sidebar (expandido / colapsado).
 *
 * Uso:
 *   const { width, maxLength } = useFirstColumnConfig();
 *
 *   // En la definición de columnas:
 *   { key: 'nombre', header: 'Nombre', align: 'left', width, render: (_, row) =>
 *       <p title={row.nombre}>{truncateText(row.nombre, maxLength)}</p>
 *   }
 *
 * Tabla de valores:
 *
 *   Breakpoint  │ Sidebar     │ width  │ maxLength
 *   ────────────┼─────────────┼────────┼──────────
 *   xs / sm     │ (overlay)   │  40%   │  22
 *   md          │ (overlay)   │  38%   │  26
 *   lg          │ expandido   │  32%   │  30
 *   lg          │ colapsado   │  36%   │  36
 *   xl          │ expandido   │  35%   │  40
 *   xl          │ colapsado   │  40%   │  50
 *   2xl         │ expandido   │  38%   │  55
 *   2xl         │ colapsado   │  43%   │  65
 */

import { useMemo } from 'react';
import { useBreakpoint } from '@/Hooks/UseBreakpoint';
import { useSidebar } from '@/context/SidebarContext';

export interface FirstColumnConfig {
  /** Valor CSS para el atributo width del <th> (ej. '35%') */
  width: string;
  /** Número máximo de caracteres antes de truncar */
  maxLength: number;
}

export const useFirstColumnConfig = (): FirstColumnConfig => {
  const { currentSize } = useBreakpoint();
  const { isCollapsed } = useSidebar();

  return useMemo((): FirstColumnConfig => {
    switch (currentSize) {
      case 'xs':
      case 'sm':
        return { width: '40%', maxLength: 22 };

      case 'md':
        return { width: '38%', maxLength: 26 };

      case 'lg':
        return isCollapsed
          ? { width: '36%', maxLength: 36 }
          : { width: '32%', maxLength: 30 };

      case 'xl':
        return isCollapsed
          ? { width: '40%', maxLength: 50 }
          : { width: '35%', maxLength: 40 };

      case '2xl':
        return isCollapsed
          ? { width: '43%', maxLength: 65 }
          : { width: '38%', maxLength: 55 };

      default:
        return { width: '35%', maxLength: 35 };
    }
  }, [currentSize, isCollapsed]);
};
