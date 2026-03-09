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
import { Button } from '../Buttons/Button';
import { Input } from '../Forms/Input';
import { LoadingSpinner } from '../Feedback/Loading';
import { EmptyState } from '../Feedback/EmptyState';
import { SystemIcons } from '../Icons/SystemIcons';

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
}

export interface TableAction<T = unknown> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: (item: T) => boolean;
}

export interface TableProps<T = unknown> {
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

export const Table = React.memo(<T extends Record<string, unknown>>({
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
    {/* Ordenamiento de elementos de la tabla usando sortable: true */}
    return (
      <span className="ml-1 inline-flex flex-col">
        <SystemIcons.interface.chevronUp
          size="xs"
          className={cn(
            "transition-colors",
            isActive && sortConfig.direction === 'asc' 
              ? "text-azul-una" 
              : "text-gray-400"
          )}
        />
        <SystemIcons.interface.chevronDown
          size="xs"
          className={cn(
            "-mt-1 transition-colors",
            isActive && sortConfig.direction === 'desc' 
              ? "text-azul-una" 
              : "text-gray-400"
          )}
        />
      </span>
    );
  }, [sortConfig, onSort]);

  if (loading) {
    return (
      <div className={cn("bg-blanco-una rounded-corner shadow-sm border", className)}>
        <div className="relative p-8 min-h-[300px]">
          <LoadingSpinner variant="paging" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-blanco-una rounded-corner shadow-sm border", className)}>
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
          <thead className="bg-gris-light">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-gris-una-2 uppercase tracking-wider",
                    column.sortable && onSort && "cursor-pointer hover:bg-gris-light",
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
                <th className="px-4 py-3 text-right text-xs font-medium text-gris-una-2 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-blanco-una divide-y divide-gris-light">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-4"
                >
                  <EmptyState
                    variant={searchQuery ? 'search' : 'document'}
                    description={emptyMessage}
                  />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gris-light transition-colors"
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
                      {getCellValue(item, column) as React.ReactNode}
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
        <div className="px-4 py-3 border-t bg-gris-light flex items-center justify-between">
          <div className="text-sm text-gris-una-3">
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
}) as <T extends Record<string, unknown>>(props: TableProps<T>) => React.ReactElement;