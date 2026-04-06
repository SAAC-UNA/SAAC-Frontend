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

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_LAYOUT, TABLE_ROW_VARIANTS } from '@/Constants/Animations';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { SystemIcons } from '../Icons/SystemIcons';
import { Button } from '../Buttons/Button';
import { SearchInput } from '../Forms/SearchInput';
import { LoadingSpinner } from '../Feedback/Loading';
import { Pagination } from './Pagination';
import { EmptyState } from '../Feedback/EmptyState';
import { Card } from '../Layout/Card';

export interface DataTableColumn<T = unknown> {
  key: string;
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableAction<T = unknown> {
  icon: React.ReactNode;
  label: string;
  onClick: (item: T) => void;
  className?: string;
  disabled?: (item: T) => boolean;
}

export interface ExpandableChildItem {
  key: string;
  content: React.ReactNode;
  action?: React.ReactNode;
  noBorder?: boolean;
  emptyChildrenMessage?: string;
  children?: ExpandableChildItem[];
}

export interface DataTableProps<T = unknown> {
  // Datos y estructura
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];

  // Header
  title?: string;
  description?: string;

  // Búsqueda
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  customFilters?: React.ReactNode;

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

  // Filas expandibles
  expandableRow?: (item: T) => ExpandableChildItem[];
  onRowExpand?: (rowKey: string, isExpanding: boolean) => void;
  getRowKey?: (item: T, index: number) => string;

  // Estilos
  className?: string;
  unstyled?: boolean; // Para usar sin contenedor cuando está dentro de otro contenedor
}

export const ExpandableChildRow: React.FC<{ item: ExpandableChildItem; depth?: number }> = ({ item, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = (item.children?.length ?? 0) > 0;

  if (item.noBorder) return <>{item.content}</>;

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1 bg-blanco-una rounded border border-gris-light',
          hasChildren && 'cursor-pointer',
          depth > 0 && 'ml-4'
        )}
        onClick={hasChildren ? () => setOpen(v => !v) : undefined}
      >
        {hasChildren && (
          <motion.div
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
            className="shrink-0"
            onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
          >
            <SystemIcons.interface.chevronDown className={`text-gris-una ${ICON_SIZES.sm}`} />
          </motion.div>
        )}
        <div className="flex-1 min-w-0">{item.content}</div>
        {item.action && (
          <div onClick={e => e.stopPropagation()}>{item.action}</div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {hasChildren && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1">
              {item.children!.length === 0
                ? <p className={`text-gris-una px-3 py-1 ${TYPOGRAPHY.table.helper}`}>{item.emptyChildrenMessage ?? 'Sin elementos'}</p>
                : item.children!.map(child => <ExpandableChildRow key={child.key} item={child} depth={depth + 1} />)
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const DataTable = React.memo(<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  title,
  description,
  searchable = true,
  searchPlaceholder = "Buscar...",
  onSearch,
  customFilters,
  primaryAction,
  pagination,
  loading = false,
  emptyMessage = "No hay datos para mostrar",
  className,
  unstyled = false,
  expandableRow,
  onRowExpand,
  getRowKey,
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const hasExpandableRows = !!expandableRow;

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  const toggleRow = useCallback((key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      const isExpanding = !next.has(key);
      isExpanding ? next.add(key) : next.delete(key);
      onRowExpand?.(key, isExpanding);
      return next;
    });
  }, [onRowExpand]);

  const getCellValue = useCallback((item: T, column: DataTableColumn<T>) => {
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

  const tableContent = (
    <div className={cn(
      "relative flex flex-col w-full h-full text-gris-light", // entrelineas de la tabla
      className
    )}>
      {/* Header */}
      {(title || description || searchable || customFilters || primaryAction) && (
        <div className={cn(
          "relative text-gris-una bg-transparent rounded-none bg-clip-border",
          unstyled && "mx-4 mt-4"
        )}>
          <div className="flex flex-col justify-between gap-4 mb-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              {title && (
                <h5 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>
                  {title}
                </h5>
              )}
              {description && (
                <p className={`block mt-1 font-sans antialiased font-normal leading-relaxed text-gris-una-2 ${TYPOGRAPHY.modal.body}`}>
                  {description}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">

              {customFilters && (
                <div className="flex items-center gap-2 flex-1">
                  {customFilters}
                </div>
              )}

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
      )}

      {/* Tabla */}
      <div className="pt-0 pb-1 px-0 overflow-x-auto lg:overflow-x-visible custom-scrollbar">
        {loading ? (
          <div className="relative min-h-50">
            <LoadingSpinner variant="loader" />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            variant={searchQuery ? 'search' : 'document'}
            description={typeof emptyMessage === 'string' ? emptyMessage : undefined}
          />
        ) : (
          <table className="w-full text-left table-fixed min-w-150 lg:min-w-0">
            <thead>
              <tr>
                {hasExpandableRows && (
                  <th className="w-10 pl-4 pr-2 py-2 border-b border-blue-gray-100 bg-blanco-una-2 rounded-tl-corner" />
                )}
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    style={column.width ? { width: column.width } : undefined}
                    // Color del header de las tablas
                    className={cn(
                      "py-2 border-b bg-blanco-una-2 border-blue-gray-100",
                      column.align === 'left' ? 'text-left' : column.align === 'right' ? 'text-right' : 'text-center',
                      index === 0 ? (hasExpandableRows ? "px-4" : "pl-8 pr-4") : "px-4",
                      // Esquina superior izquierda si no hay expandable y es la primera columna
                      index === 0 && !hasExpandableRows && "rounded-tl-corner",
                      // Esquina superior derecha si es la última columna y no hay acciones
                      index === columns.length - 1 && (!actions || actions.length === 0) && "rounded-tr-corner"
                    )}
                  >
                    <p className={`block font-sans antialiased font-bold leading-none text-negro-una-2 ${TYPOGRAPHY.table.header}`}>
                      {column.header}
                    </p>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="pl-4 pr-8 py-2 border-b border-blue-gray-100 text-center rounded-tr-corner">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-gris-una-2 opacity-70">
                      {/* Columna de acciones vacía */}
                    </p>
                  </th>
                )}
              </tr>
            </thead>
            <motion.tbody
              key={`${pagination?.currentPage ?? 0}-${data.length}-${(data[0] as Record<string, unknown>)?.id ?? ''}`}
              initial="hidden"
              animate="visible"
            >
              {data.map((item, index) => {
                const rowKey = getRowKey ? getRowKey(item, index) : String((item as Record<string, unknown>).id ?? index);
                const isExpanded = hasExpandableRows ? expandedRows.has(rowKey) : false;
                const isLast = index === data.length - 1;
                const totalCols = columns.length + (hasExpandableRows ? 1 : 0) + (actions?.length ? 1 : 0);
                return (
                  <React.Fragment key={`${rowKey}-${index}`}>
                    <motion.tr
                      variants={TABLE_ROW_VARIANTS}
                      custom={index}
                      className={cn(hasExpandableRows && "cursor-pointer transition-colors")}
                      onClick={hasExpandableRows ? () => toggleRow(rowKey) : undefined}
                    >
                      {hasExpandableRows && (
                        <td className={cn("pl-4 pr-2 py-2 h-16 w-10 text-center align-middle", !isLast && !isExpanded && "border-b border-blue-gray-50")}>
                          <motion.div
                            initial={false}
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
                            className="inline-flex items-center justify-center cursor-pointer"
                            onClick={(e) => {
                               e.stopPropagation();
                               toggleRow(rowKey);
                            }}
                          >
                            <SystemIcons.interface.chevronDown
                              className={`text-gris-una ${ICON_SIZES.sm}`}
                            />
                          </motion.div>
                        </td>
                      )}
                      {columns.map((column, colIndex) => (
                        <td
                          key={column.key}
                          className={cn(
                            "py-2 h-16 align-middle",
                            colIndex === 0 ? (hasExpandableRows ? "px-4" : "pl-8 pr-4") : "px-4",
                            !isLast && !isExpanded && "border-b border-blue-gray-50"
                          )}
                        >
                          <div className={cn(
                            column.align === 'center' && "text-center",
                            column.align === 'right' && "text-right"
                          )}>
                            {getCellValue(item, column) as React.ReactNode}
                          </div>
                        </td>
                      ))}
                      {actions && actions.length > 0 && (
                        <td className={cn(
                          "pl-4 pr-8 py-2 h-16 align-middle",
                          !isLast && !isExpanded && "border-b border-blue-gray-50"
                        )}>
                          <div className="flex items-center gap-2">
                            {actions.map((action) => (
                              <button
                                key={action.label}
                                className={cn(
                                  "relative h-10 max-h-10 w-10 max-w-10 select-none rounded-corner text-center align-middle font-sans text-xs font-medium uppercase transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
                                  action.className
                                )}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); action.onClick(item); }}
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
                    </motion.tr>
                    <AnimatePresence initial={false}>
                      {hasExpandableRows && isExpanded && (
                        <tr className="bg-white">
                          <td colSpan={totalCols} className="p-0 border-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 py-2">
                                {(() => {
                                  const children = expandableRow!(item);
                                  return children.length === 0
                                    ? <p className={`text-gris-una ${TYPOGRAPHY.table.helper}`}>Sin elementos</p>
                                    : <div className="space-y-1">{children.map(child => <ExpandableChildRow key={child.key} item={child} />)}</div>;
                                })()}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </motion.tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center py-1">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );

  return (
    <motion.div layout="position" transition={SPRING_LAYOUT}>
      {unstyled ? tableContent : <Card className="p-4">{tableContent}</Card>}
    </motion.div>
  );
}) as <T extends Record<string, unknown>>(props: DataTableProps<T>) => React.ReactElement;