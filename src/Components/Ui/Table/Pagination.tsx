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
import { SystemIcons } from '../Icons/SystemIcons';
import { Button } from '@/Components/Ui/Buttons/Button';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES, PAGINATION_BUTTON } from '@/Constants/Components';

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
      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        variant="pagination"
        size="sm"
        className={`!${PAGINATION_BUTTON.button}`}
        aria-label="Página anterior"
      >
        <SystemIcons.navigation.arrow.left className={ICON_SIZES.sm} />
      </Button>

      {/* Números de página */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-after-${pageNumbers[index - 1]}`}
                className={`flex items-center justify-center w-8 h-8 text-gris-una ${TYPOGRAPHY.pagination}`}
              >
                ···
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <Button
              key={page}
              onClick={() => onPageChange(page as number)}
              variant="pagination"
              size="sm"
              className={cn(
                `${PAGINATION_BUTTON.button} ${TYPOGRAPHY.pagination} !font-medium !p-0`,
                isActive && '!bg-blanco-una !shadow-md'
              )}
              aria-label={`Ir a página ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Botón siguiente */}
      <Button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        variant="pagination"
        size="sm"
        className={`!${PAGINATION_BUTTON.button}`}
        aria-label="Página siguiente"
      >
        <SystemIcons.navigation.arrow.left className={`${ICON_SIZES.sm} rotate-180`} />
      </Button>
    </div>
  );
};

