/**
 * Pagination - Componente de paginación personalizado
 * 
 * Características:
 * - Botones circulares
 * - Navegación anterior/siguiente
 * - Soporte para muchas páginas con puntos suspensivos
 * - Colores personalizables (azul principal cuando está activo)
 */

import React from 'react';
import { SystemIcons } from './Icons/SystemIcons';
import { cn } from '@/Utils/ClassNames';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className
}) => {
  if (totalPages <= 1) return null;

  // Generar lista de páginas a mostrar
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar primeras, últimas y alrededor de la actual
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {/* Botón anterior */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full border transition-colors',
          currentPage === 1
            ? 'border-gris-una/20 text-gris-una/40 cursor-not-allowed'
            : 'border-gris-una/30 text-gris-una hover:border-azul-una hover:text-azul-una'
        )}
        aria-label="Página anterior"
      >
        <SystemIcons.navigation.arrow.left className="w-4 h-4" />
      </button>

      {/* Números de página */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="flex items-center justify-center w-8 h-8 text-gris-una text-sm"
              >
                ···
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                'flex items-center justify-center w-8 h-8 text-sm font-medium transition-all',
                isActive
                  ? 'rounded-full bg-azul-una/20 text-azul-una'
                  : 'text-gris-una hover:text-azul-una'
              )}
              aria-label={`Ir a página ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Botón siguiente */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full border transition-colors',
          currentPage === totalPages
            ? 'border-gris-una/20 text-gris-una/40 cursor-not-allowed'
            : 'border-gris-una/30 text-gris-una hover:border-azul-una hover:text-azul-una'
        )}
        aria-label="Página siguiente"
      >
        <SystemIcons.navigation.arrow.left className="w-4 h-4 rotate-180" />
      </button>
    </div>
  );
};

export default Pagination;
