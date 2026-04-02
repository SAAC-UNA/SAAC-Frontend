/**
 * StructureTable - Tabla completa de elementos de estructura con todas las funcionalidades
 * 
 * Características:
 * - DataTable con paginación
 * - Modal de visualización integrado
 * - Acciones de editar y eliminar
 * - Búsqueda y filtros
 * 
 * Props:
 * @param onEdit - Callback cuando se edita un elemento
 * @param onDelete - Callback cuando se elimina un elemento
 * @param onCreate - Callback cuando se crea un nuevo elemento
 * @param title - Título de la tabla (opcional)
 * @param description - Descripción de la tabla (opcional)
 * @param showHeader - Mostrar/ocultar el header
 */

import React, { useState, useMemo, useRef } from 'react';
import { StructureElementDetail } from './StructureElementDetail';
import { DataTable } from '@/components/index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { useDebounce } from '@/Hooks/UseDebounce';
import { ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import { truncateText } from '@/Utils';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import type { DataTableColumn} from '@/Components/Ui/Table/DataTable';
import type { StructureElement, ElementType } from '@/Types/StructureTypes';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';


interface StructureTableProps {
    treeData: StructureElement[];
    isLoading: boolean;
    onEdit?: (element: StructureElement) => void;
    onDelete?: (element: StructureElement) => void;
    onToggleActive?: (element: StructureElement) => void;
    searchQuery?: string;
    itemsPerPage?: number;
    unstyled?: boolean;
}

export const StructureTable: React.FC<StructureTableProps> = ({
    treeData,
    isLoading,
    onEdit,
    onDelete,
    onToggleActive,
    searchQuery = '',
    itemsPerPage = TABLE_PAGE_SIZE.standard,
    unstyled = false
}) => {

    const firstColumn = useFirstColumnConfig();
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        element: StructureElement | null;
        parentName: string;
    }>({ isOpen: false, element: null, parentName: '' });

    // Debounce de búsqueda para evitar filtrados innecesarios mientras se escribe
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Resetear página cuando cambia la búsqueda debounced (sin useEffect - patrón derived state)
    const prevDebouncedSearch = useRef(debouncedSearchQuery);
    if (prevDebouncedSearch.current !== debouncedSearchQuery) {
        prevDebouncedSearch.current = debouncedSearchQuery;
        setCurrentPage(1);
    }

    // Aplanar el árbol para obtener todos los elementos como lista - MEMOIZADO
    const allElements = useMemo(() => {
        const flattenTree = (nodes: StructureElement[]): StructureElement[] => {
            return nodes.reduce((acc, node) => {
                acc.push(node);
                if (node.childElements && node.childElements.length > 0) {
                    acc.push(...flattenTree(node.childElements));
                }
                return acc;
            }, [] as StructureElement[]);
        };
        return flattenTree(treeData);
    }, [treeData]);

    const normalizeSearchText = (value?: string | null): string => {
        if (!value) return '';
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    // Filtrar elementos basado en la búsqueda y tipo - MEMOIZADO con debounced search
    const filteredElements = useMemo(() => {
        let filtered = allElements;
        
        // Filtro por búsqueda (usar debounced query)
        if (debouncedSearchQuery.trim()) {
            const query = normalizeSearchText(debouncedSearchQuery);
            
            // Verificar si está buscando SOLO por estado (palabra exacta)
            const isOnlyActiveSearch = query === 'activo';
            const isOnlyInactiveSearch = query === 'inactivo';
            
            filtered = filtered.filter(element => {
                // Si está buscando solo "activo" o "inactivo", filtrar solo por estado
                if (isOnlyActiveSearch) {
                    return element.active === true;
                }
                
                if (isOnlyInactiveSearch) {
                    return element.active === false;
                }
                
                // Buscar en todas las columnas visibles de la tabla
                const matchesTypeLabel = normalizeSearchText(ELEMENT_TYPE_LABELS[element.type]).includes(query);
                const matchesTypeValue = normalizeSearchText(element.type).includes(query);
                const matchesNomenclature = normalizeSearchText(element.nomenclature).includes(query);
                const matchesName = normalizeSearchText(element.name).includes(query);
                const matchesDescription = normalizeSearchText(element.description).includes(query);
                const matchesStatus = normalizeSearchText(element.active ? 'Activo' : 'Inactivo').includes(query);
                
                return (
                    matchesTypeLabel ||
                    matchesTypeValue ||
                    matchesNomenclature ||
                    matchesName ||
                    matchesDescription ||
                    matchesStatus
                );
            });
        }
        
        return filtered;
    }, [debouncedSearchQuery, allElements]);

    // Resetear página cuando cambian los filtros (usar debounced para evitar resets innecesarios)
    // (movido a patrón derived state arriba)

    const safeItemsPerPage = Number.isFinite(itemsPerPage) && itemsPerPage > 0
        ? Math.floor(itemsPerPage)
        : TABLE_PAGE_SIZE.standard;

    // Calcular datos paginados - MEMOIZADO
    const { totalPages, paginatedData, boundedCurrentPage } = useMemo(() => {
        const total = Math.max(1, Math.ceil(filteredElements.length / safeItemsPerPage));
        const boundedPage = Math.min(currentPage, total);
        const paginated = filteredElements.slice(
            (boundedPage - 1) * safeItemsPerPage,
            boundedPage * safeItemsPerPage
        );
        return { totalPages: total, paginatedData: paginated, boundedCurrentPage: boundedPage };
    }, [filteredElements, currentPage, safeItemsPerPage]);

    if (currentPage !== boundedCurrentPage) {
        setCurrentPage(boundedCurrentPage);
    }

    const getExpectedParentType = (elementType: ElementType): ElementType | null => {
        const parentTypeMap: Record<ElementType, ElementType | null> = {
            'university': null,
            'campus': 'university',
            'career': 'campus',
            'dimension': null,
            'component': 'dimension',
            'criteria': 'component',
            'standard': 'criteria',
            'evidence': 'criteria'
        };
        return parentTypeMap[elementType];
    };

    const getParentName = (element: StructureElement): string => {
        if (!element.parentElementId) return 'Sin elemento padre';
        const expectedParentType = getExpectedParentType(element.type);
        if (!expectedParentType) return 'Sin elemento padre';
        const parent = allElements.find(el =>
            el.type === expectedParentType &&
            el.id === element.parentElementId
        );
        return parent?.name || parent?.nomenclature || parent?.description || 'Elemento padre no encontrado';
    };

    // Configuración de columnas de la tabla
    const columns: DataTableColumn<StructureElement>[] = [
        {
            key: 'type',
            header: 'Tipo',
            align: 'left',
            width: firstColumn.width,
            render: (_, element) => (
                <div className="flex flex-col">
                    <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
                        {ELEMENT_TYPE_LABELS[element.type]}
                    </p>
                    {element.nomenclature && (
                        <p className={`${TYPOGRAPHY.table.helper} text-gris-una-2 mt-0.5`}>
                            {element.nomenclature}
                        </p>
                    )}
                </div>
            )
        },
        {
            key: 'name',
            header: 'Nombre',
            align: 'left',
            width: '20%',
            render: (_, element) => (
                <p
                    className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell} ${
                        !element.name ? 'text-center' : 'text-left'
                    }`}
                    title={element.name || '-'}
                >
                    {truncateText(element.name) || '-'}
                </p>
            )
        },
        {
            key: 'description',
            header: 'Descripción',
            align: 'left',
            width: '20%',
            render: (_, element) => (
                <p
                    className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell} ${
                        !element.description ? 'text-center' : 'text-left'
                    }`}
                    title={element.description || undefined}
                >
                    {truncateText(element.description, TABLE_TRUNCATE.text) || '-'}
                </p>
            )
        },
        {
            key: 'status',
            header: 'Estado',
            align: 'center',
            width: '10%',
            render: (_, element) => (
                <div className="flex justify-center">
                    <StatusBadge
                        label={element.active ? 'Activo' : 'Inactivo'}
                        colorClasses={element.active ? 'text-verde-dark bg-verde-ring' : 'text-error-dark bg-error-ring'}
                        badgeClassName="min-w-[76px] justify-center text-center"
                    />
                </div>
            )
        },
        {
        key: 'actions',
        header: 'Acciones',
        align: 'center',
        width: '14%',
        render: (_, element) => {
            // Lógica para bloquear botones
            const canDelete = !element.hasChildren; // Solo puede eliminar si NO tiene hijos
            const canActivate = element.active || !element.parentElement || element.parentElement.active; // Puede activar si ya está activo, o si no tiene padre, o si el padre está activo
            
            return (
                <div className="flex items-center justify-center gap-2">
                    <TableActionButton
                        action="view"
                        tooltip="Ver detalles"
                        onClick={() => setModalState({ isOpen: true, element, parentName: getParentName(element) })}
                    />
                    <TableActionButton
                        action="edit"
                        tooltip="Editar elemento"
                        onClick={() => onEdit?.(element)}
                    />
                    <TableActionButton
                        action="power"
                        isActive={element.active}
                        tooltip={
                            !canActivate
                                ? "No se puede activar: el padre está inactivo"
                                : element.active
                                    ? "Inactivar elemento"
                                    : "Activar elemento"
                        }
                        onClick={() => onToggleActive?.(element)}
                        disabled={!canActivate}
                    />
                    <TableActionButton
                        action="delete"
                        tooltip={
                            canDelete
                                ? "Eliminar elemento"
                                : "No se puede eliminar: tiene elementos dependientes"
                        }
                        onClick={() => onDelete?.(element)}
                        disabled={!canDelete}
                    />
                </div>
            );
        }
    }
    ];

    return (
        <>
            <DataTable
                data={paginatedData as any}
                columns={columns as any}
                title=""
                searchable={false}
                pagination={totalPages > 1 ? {
                    currentPage: boundedCurrentPage,
                    totalPages,
                    onPageChange: setCurrentPage
                } : undefined}
                loading={isLoading}
                emptyMessage={
                    debouncedSearchQuery
                        ? `No se encontraron elementos que coincidan con "${debouncedSearchQuery}"`
                        : "No hay elementos creados aún. ¡Crea el primer elemento!"
                }
                unstyled={unstyled}
            />

            <StructureElementDetail
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, element: null, parentName: '' })}
                element={modalState.element}
                parentName={modalState.parentName}
            />
        </>
    );
};