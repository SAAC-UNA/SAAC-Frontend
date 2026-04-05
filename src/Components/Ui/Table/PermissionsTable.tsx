/**
 * PermissionsTable - variante compacta de DataTable para matrices de permisos
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

export interface PermissionsTableColumn<T = unknown> {
  key: string;
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface PermissionsTableAction<T = unknown> {
  icon: React.ReactNode;
  label: string;
  onClick: (item: T) => void;
  className?: string;
  disabled?: (item: T) => boolean;
}

export interface PermissionsTableExpandableChildItem {
  key: string;
  content: React.ReactNode;
  action?: React.ReactNode;
  noBorder?: boolean;
  emptyChildrenMessage?: string;
  children?: PermissionsTableExpandableChildItem[];
}

export interface PermissionsTableProps<T = unknown> {
  data: T[];
  columns: PermissionsTableColumn<T>[];
  actions?: PermissionsTableAction<T>[];

  title?: string;
  description?: string;

  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  customFilters?: React.ReactNode;

  primaryAction?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  };

  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };

  loading?: boolean;
  emptyMessage?: string | React.ReactNode;

  expandableRow?: (item: T) => PermissionsTableExpandableChildItem[];
  getRowKey?: (item: T, index: number) => string;

  className?: string;
  unstyled?: boolean;
}

export const PermissionsExpandableChildRow: React.FC<{ item: PermissionsTableExpandableChildItem; depth?: number }> = ({ item, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = (item.children?.length ?? 0) > 0;

  if (item.noBorder) return <>{item.content}</>;

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 px-2.5 py-1 bg-blanco-una rounded border border-gris-light',
          hasChildren && 'cursor-pointer',
          depth > 0 && 'ml-4'
        )}
        onClick={hasChildren ? () => setOpen((v) => !v) : undefined}
      >
        {hasChildren && (
          <motion.div
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
            className="flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <SystemIcons.interface.chevronDown className={`text-gris-una ${ICON_SIZES.sm}`} />
          </motion.div>
        )}
        <div className="flex-1 min-w-0">{item.content}</div>
        {item.action && <div onClick={(e) => e.stopPropagation()}>{item.action}</div>}
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
              {item.children!.length === 0 ? (
                <p className={`text-gris-una px-2.5 py-1 ${TYPOGRAPHY.table.helper}`}>{item.emptyChildrenMessage ?? 'Sin elementos'}</p>
              ) : (
                item.children!.map((child) => <PermissionsExpandableChildRow key={child.key} item={child} depth={depth + 1} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const PermissionsTable = React.memo(
  <T extends Record<string, unknown>>({
    data,
    columns,
    actions,
    title,
    description,
    searchable = true,
    searchPlaceholder = 'Buscar...',
    onSearch,
    customFilters,
    primaryAction,
    pagination,
    loading = false,
    emptyMessage = 'No hay datos para mostrar',
    className,
    unstyled = false,
    expandableRow,
    getRowKey,
  }: PermissionsTableProps<T>) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const hasExpandableRows = !!expandableRow;

    const handleSearch = useCallback(
      (value: string) => {
        setSearchQuery(value);
        onSearch?.(value);
      },
      [onSearch]
    );

    const toggleRow = useCallback((key: string) => {
      setExpandedRows((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    }, []);

    const getCellValue = useCallback((item: T, column: PermissionsTableColumn<T>) => {
      if (column.render) {
        const accessor = column.accessor;
        const value =
          typeof accessor === 'function'
            ? accessor(item)
            : accessor
              ? item[accessor]
              : item[column.key];
        return column.render(value, item, 0);
      }

      if (column.accessor) {
        return typeof column.accessor === 'function' ? column.accessor(item) : item[column.accessor];
      }

      return item[column.key];
    }, []);

    const tableContent = (
      <div className={cn('relative flex flex-col w-full h-full text-gris-light', className)}>
        {(title || description || searchable || customFilters || primaryAction) && (
          <div className={cn('relative text-gris-una bg-transparent rounded-none bg-clip-border', unstyled && 'mx-3 mt-3')}>
            <div className="flex flex-col justify-between gap-3 mb-2 lg:flex-row lg:items-center">
              <div className="flex-1">
                {title && <h5 className={`${TYPOGRAPHY.table.caption} font-semibold text-negro-una`}>{title}</h5>}
                {description && (
                  <p className={`block mt-1 font-sans antialiased font-normal leading-relaxed text-gris-una-2 ${TYPOGRAPHY.modal.body}`}>
                    {description}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
                {customFilters && <div className="flex items-center gap-2 flex-1">{customFilters}</div>}

                {searchable && (
                  <SearchInput
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full sm:w-72"
                  />
                )}
                {primaryAction && (
                  <Button variant="secondary" size="sm" onClick={primaryAction.onClick} className="whitespace-nowrap">
                    {primaryAction.icon}
                    {primaryAction.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-0 pb-1 px-0 overflow-x-auto lg:overflow-x-visible custom-scrollbar">
          {loading ? (
            <div className="relative min-h-[160px]">
              <LoadingSpinner variant="loader" />
            </div>
          ) : data.length === 0 ? (
            <EmptyState variant={searchQuery ? 'search' : 'document'} description={typeof emptyMessage === 'string' ? emptyMessage : undefined} />
          ) : (
            <table className="w-full text-left table-fixed min-w-[560px] lg:min-w-0">
              <thead>
                <tr>
                  {hasExpandableRows && <th className="w-10 pl-3 pr-2 py-1.5 border-b border-blue-gray-100 bg-blanco-una rounded-tl-corner" />}
                  {columns.map((column, index) => (
                    <th
                      key={column.key}
                      style={column.width ? { width: column.width } : undefined}
                      className={cn(
                        'py-1.5 border-b bg-blanco-una border-blue-gray-100',
                        column.align === 'left' ? 'text-left' : column.align === 'right' ? 'text-right' : 'text-center',
                        index === 0 ? (hasExpandableRows ? 'px-3' : 'pl-5 pr-3') : 'px-3',
                        index === 0 && !hasExpandableRows && 'rounded-tl-corner',
                        index === columns.length - 1 && (!actions || actions.length === 0) && 'rounded-tr-corner'
                      )}
                    >
                      <p className={`block font-sans antialiased font-bold leading-none text-negro-una-2 ${TYPOGRAPHY.table.header}`}>
                        {column.header}
                      </p>
                    </th>
                  ))}
                  {actions && actions.length > 0 && (
                    <th className="pl-3 pr-5 py-1.5 border-b border-blue-gray-100 text-center rounded-tr-corner">
                      <p className="block font-sans text-sm antialiased font-normal leading-none text-gris-una-2 opacity-70"></p>
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
                        className={cn(hasExpandableRows && 'cursor-pointer transition-colors')}
                        onClick={hasExpandableRows ? () => toggleRow(rowKey) : undefined}
                      >
                        {hasExpandableRows && (
                          <td className={cn('pl-3 pr-2 py-1.5 h-12 w-10 text-center align-middle', !isLast && !isExpanded && 'border-b border-blue-gray-50')}>
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
                              <SystemIcons.interface.chevronDown className={`text-gris-una ${ICON_SIZES.sm}`} />
                            </motion.div>
                          </td>
                        )}
                        {columns.map((column, colIndex) => (
                          <td
                            key={column.key}
                            className={cn(
                              'py-1.5 h-12 align-middle',
                              colIndex === 0 ? (hasExpandableRows ? 'px-3' : 'pl-5 pr-3') : 'px-3',
                              !isLast && !isExpanded && 'border-b border-blue-gray-50'
                            )}
                          >
                            <div className={cn(column.align === 'center' && 'text-center', column.align === 'right' && 'text-right')}>
                              {getCellValue(item, column) as React.ReactNode}
                            </div>
                          </td>
                        ))}
                        {actions && actions.length > 0 && (
                          <td className={cn('pl-3 pr-5 py-1.5 h-12 align-middle', !isLast && !isExpanded && 'border-b border-blue-gray-50')}>
                            <div className="flex items-center gap-1.5">
                              {actions.map((action) => (
                                <button
                                  key={action.label}
                                  className={cn(
                                    'relative h-9 max-h-[36px] w-9 max-w-[36px] select-none rounded-corner text-center align-middle font-sans text-xs font-medium uppercase transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
                                    action.className
                                  )}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(item);
                                  }}
                                  disabled={action.disabled?.(item)}
                                  title={action.label}
                                >
                                  <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">{action.icon}</span>
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
                                <div className="px-3 py-2">
                                  {(() => {
                                    const children = expandableRow!(item);
                                    return children.length === 0 ? (
                                      <p className={`text-gris-una ${TYPOGRAPHY.table.helper}`}>Sin elementos</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {children.map((child) => (
                                          <PermissionsExpandableChildRow key={child.key} item={child} />
                                        ))}
                                      </div>
                                    );
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

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center py-1">
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={pagination.onPageChange} />
          </div>
        )}
      </div>
    );

    return <motion.div layout="position" transition={SPRING_LAYOUT}>{unstyled ? tableContent : <Card className="p-3">{tableContent}</Card>}</motion.div>;
  }
) as <T extends Record<string, unknown>>(props: PermissionsTableProps<T>) => React.ReactElement;
