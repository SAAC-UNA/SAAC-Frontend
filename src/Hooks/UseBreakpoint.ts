import { useState, useEffect } from 'react';

/**
 * HOOK PRINCIPAL PARA RESPONSIVE DESIGN
 * 
 * Este hook es la "fuente de verdad" para toda la lógica responsive del sistema.
 * Proporciona información detallada sobre el tamaño de pantalla actual y helpers
 * para diferentes categorías de dispositivos.
 * 
 * - Detecta automáticamente cambios de tamaño de ventana
 * - Proporciona breakpoints específicos (xs, sm, md, lg, xl, 2xl)
 * - Incluye helpers semánticos (isMobile, isTablet, isDesktop, isLargeScreen)
 * - Basado en estándares de Tailwind CSS
 * - Dimensiones exactas (width, height) disponibles
 */

// Definir breakpoints estándar (basados en Tailwind CSS)
const breakpoints = {
  sm: 640,   // Tablet pequeña
  md: 768,   // Tablet
  lg: 1024,  // Desktop pequeño
  xl: 1280,  // Desktop
  '2xl': 1536 // Desktop grande
} as const;

type BreakpointKey = keyof typeof breakpoints;
type ScreenSize = BreakpointKey | 'xs';

export interface ScreenInfo {
  // Tamaño actual de la pantalla
  currentSize: ScreenSize;
  width: number;
  height: number;
  
  // Helpers para cada breakpoint
  isXs: boolean;   // < 640px (móvil)
  isSm: boolean;   // 640px - 767px (tablet pequeña) 
  isMd: boolean;   // 768px - 1023px (tablet)
  isLg: boolean;   // 1024px - 1279px (desktop pequeño)
  isXl: boolean;   // 1280px - 1535px (desktop)
  is2Xl: boolean;  // >= 1536px (desktop grande)
  
  // Helpers de rango
  isMobile: boolean;    // xs
  isTablet: boolean;    // sm + md
  isDesktop: boolean;   // lg + xl + 2xl
  isLargeScreen: boolean; // xl + 2xl
}

const getCurrentSize = (width: number): ScreenSize => {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

export const useBreakpoint = (): ScreenInfo => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() => {
    // Valores por defecto para SSR
    const defaultWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const defaultHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    const currentSize = getCurrentSize(defaultWidth);
    
    return {
      currentSize,
      width: defaultWidth,
      height: defaultHeight,
      isXs: currentSize === 'xs',
      isSm: currentSize === 'sm',
      isMd: currentSize === 'md', 
      isLg: currentSize === 'lg',
      isXl: currentSize === 'xl',
      is2Xl: currentSize === '2xl',
      isMobile: currentSize === 'xs',
      isTablet: currentSize === 'sm' || currentSize === 'md',
      isDesktop: currentSize === 'lg' || currentSize === 'xl' || currentSize === '2xl',
      isLargeScreen: currentSize === 'xl' || currentSize === '2xl'
    };
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const currentSize = getCurrentSize(width);
      
      setScreenInfo({
        currentSize,
        width,
        height,
        isXs: currentSize === 'xs',
        isSm: currentSize === 'sm',
        isMd: currentSize === 'md',
        isLg: currentSize === 'lg', 
        isXl: currentSize === 'xl',
        is2Xl: currentSize === '2xl',
        isMobile: currentSize === 'xs',
        isTablet: currentSize === 'sm' || currentSize === 'md',
        isDesktop: currentSize === 'lg' || currentSize === 'xl' || currentSize === '2xl',
        isLargeScreen: currentSize === 'xl' || currentSize === '2xl'
      });
    };

    // Listener para cambios de tamaño
    window.addEventListener('resize', updateScreenInfo);
    
    // Actualizar inmediatamente
    updateScreenInfo();
    
    // Cleanup
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, []);

  return screenInfo;
};