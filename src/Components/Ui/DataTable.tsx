/**
 * DataTable - Componente de tabla con diseño Material Design
 * 
 * Basado en el diseño de Material Tailwind con adaptaciones para el sistema SAAC-UNA
 * 
 * Características:
 * - Diseño Material Design moderno
 * - Header con título, descripción y acciones
 * - Búsqueda integrada con diseño flotante
 * - Paginación completa
 * - Acciones con iconos
 * - Estados responsive
 */

import React, { useState } from 'react';
import { cn } from '@/utils/ClassNames';
import { Button } from './Button';
import { SearchInput } from './SearchInput';
import { LoadingSpinner } from './Loading';
import { SystemIcons } from './Icons/SystemIcons';

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableAction<T = any> {
  icon: React.ReactNode;
  label: string;
  onClick: (item: T) => void;
  className?: string;
  disabled?: (item: T) => boolean;
}

export interface DataTableProps<T = any> {
  // Datos y estructura
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  
  // Header
  title: string;
  description?: string;
  
  // Búsqueda
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  
  // Botón principal
  primaryAction?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  };
  
  // Paginación
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  
  // Estados
  loading?: boolean;
  emptyMessage?: string | React.ReactNode;
  
  // Estilos
  className?: string;
  unstyled?: boolean; // Para usar sin contenedor cuando está dentro de otro contenedor
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions,
  title,
  description,
  searchable = true,
  searchPlaceholder = "Buscar...",
  onSearch,
  primaryAction,
  pagination,
  loading = false,
  emptyMessage = "No hay datos para mostrar",
  className,
  unstyled = false
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const getCellValue = (item: T, column: DataTableColumn<T>) => {
    if (column.render) {
      const accessor = column.accessor;
      const value = typeof accessor === 'function' 
        ? accessor(item) 
        : accessor 
          ? item[accessor]
          : item[column.key];
      return column.render(value, item, 0);
    }
    
    if (column.accessor) {
      return typeof column.accessor === 'function' 
        ? column.accessor(item)
        : item[column.accessor];
    }
    
    return item[column.key];
  };

  const renderPaginationButtons = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, onPageChange } = pagination;
    const buttons = [];

    // Lógica para mostrar botones de páginas
    if (totalPages <= 7) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "transparent" : "ghost"}
            size="sm"
            onClick={() => onPageChange(i)}
            className="h-8 w-8 p-0 min-w-0 text-xs"
          >
            {i}
          </Button>
        );
      }
    } else {
      // Lógica más compleja para muchas páginas
      buttons.push(
        <Button
          key={1}
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0 min-w-0 text-xs"
        >
          1
        </Button>
      );
      
      if (currentPage > 3) {
        buttons.push(
          <span key="dots1" className="flex items-center justify-center h-8 w-8 text-gris-una">
            ...
          </span>
        );
      }
      
      // Agregar páginas cercanas a la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "primary" : "ghost"}
            size="sm"
            onClick={() => onPageChange(i)}
            className="h-8 w-8 p-0 min-w-0 text-xs"
          >
            {i}
          </Button>
        );
      }
      
      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="dots2" className="flex items-center justify-center h-8 w-8 text-gris-una">
            ...
          </span>
        );
      }
      
      if (totalPages > 1) {
        buttons.push(
          <Button
            key={totalPages}
            variant="primary"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="h-8 w-8 p-0 min-w-0 text-xs"
          >
            {totalPages}
          </Button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className={cn(
      "relative flex flex-col w-full h-full text-gris-una/20",
      !unstyled && "bg-transparent", // Fondo transparente de la tabla
      className
    )}>
      {/* Header */}
      <div className={cn(
        "relative text-gris-una bg-transparent rounded-none bg-clip-border",
        !unstyled && "mx-4 mt-4"
      )}>
        <div className="flex flex-col justify-between gap-4 mb-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            {title && (
              <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                {title}
              </h5>
            )}
            {description && (
              <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
            {searchable && (
              <SearchInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full sm:w-72"
              />
            )}
            {primaryAction && (
              <Button
                variant="secondary"
                size="sm"
                onClick={primaryAction.onClick}
                className="whitespace-nowrap"
              >
                {primaryAction.icon}
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="p-6 px-0 overflow-x-auto lg:overflow-x-visible custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            {searchQuery ? (
              <SystemIcons.interface.search className="w-12 h-12 mb-4 text-gray-300" />
            ) : (
              <SystemIcons.modal.document className="w-12 h-12 mb-4 text-gray-300" />
            )}
            <p className="text-lg font-medium mb-1">No hay datos</p>
            {typeof emptyMessage === 'string' ? (
              <p className="text-sm">{emptyMessage}</p>
            ) : (
              emptyMessage
            )}
          </div>
        ) : (
          <table className="w-full text-left table-fixed min-w-[600px] lg:min-w-0">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    className={cn(
                      "py-4 border-y border-blue-gray-100",
                      index === 0 ? "pl-8 pr-4" : "px-4", // Más padding en todas las columnas
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right"
                    )}
                  >
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      {column.header}
                    </p>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="pl-4 pr-8 py-4 border-y border-blue-gray-100 text-center">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      {/* Columna de acciones vacía */}
                    </p>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={cn(
                        "py-4",
                        colIndex === 0 ? "pl-8 pr-4" : "px-4", // Más padding en todas las columnas
                        index === data.length - 1 ? "" : "border-b border-blue-gray-50"
                      )}
                    >
                      <div className={cn(
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}>
                        {getCellValue(item, column)}
                      </div>
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className={cn(
                      "pl-4 pr-8 py-4", // Más padding en la columna de acciones
                      index === data.length - 1 ? "" : "border-b border-blue-gray-50"
                    )}>
                      <div className="flex items-center gap-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            className={cn(
                              "relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
                              action.className
                            )}
                            type="button"
                            onClick={() => action.onClick(item)}
                            disabled={action.disabled?.(item)}
                            title={action.label}
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              {action.icon}
                            </span>
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-blue-gray-50">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage === 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          >
            Anterior
          </Button>
          <div className="flex items-center gap-2">
            {renderPaginationButtons()}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};