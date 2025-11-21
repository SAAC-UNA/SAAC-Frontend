/**
 * Componente de tabla reutilizable con funcionalidades avanzadas
 * 
 * Características:
 * - Diseño responsive
 * - Estados de carga y vacío
 * - Acciones por fila
 * - Paginación
 * - Ordenamiento
 * - Búsqueda
 */

import React, { useCallback } from 'react';
import { cn } from '@/Utils/ClassNames';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './Loading';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => React.ReactNode;
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: (item: T) => boolean;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  
  // Búsqueda
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  
  // Paginación
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  
  // Ordenamiento
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: string) => void;
}

export const Table = React.memo(<T extends Record<string, any>>({
  data,
  columns,
  actions,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  className,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  pagination,
  sortConfig,
  onSort
}: TableProps<T>) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  const getCellValue = useCallback((item: T, column: TableColumn<T>) => {
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
  }, []);

  const renderSortIcon = useCallback((columnKey: string) => {
    if (!onSort || !sortConfig) return null;
    
    const isActive = sortConfig.key === columnKey;
    
    return (
      <span className="ml-1 inline-flex flex-col">
        <svg 
          className={cn(
            "w-3 h-3 transition-colors",
            isActive && sortConfig.direction === 'asc' 
              ? "text-azul-una" 
              : "text-gray-400"
          )} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <svg 
          className={cn(
            "w-3 h-3 -mt-1 transition-colors",
            isActive && sortConfig.direction === 'desc' 
              ? "text-azul-una" 
              : "text-gray-400"
          )} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    );
  }, [sortConfig]);

  if (loading) {
    return (
      <div className={cn("bg-white rounded-lg shadow-sm border", className)}>
        <div className="p-8 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border", className)}>
      {/* Header con búsqueda */}
      {searchable && (
        <div className="p-4 border-b">
          <div className="max-w-md">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.sortable && onSort && "cursor-pointer hover:bg-gray-100",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && onSort && onSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium mb-1">No hay datos</p>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        "px-4 py-4 whitespace-nowrap text-sm",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}
                    >
                      {getCellValue(item, column)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            size="sm"
                            variant={action.variant || 'secondary'}
                            onClick={() => action.onClick(item)}
                            disabled={action.disabled?.(item)}
                          >
                            {action.icon && <span className="mr-1">{action.icon}</span>}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {pagination.currentPage} de {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}) as <T extends Record<string, any>>(props: TableProps<T>) => React.ReactElement;