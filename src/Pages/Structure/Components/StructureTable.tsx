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

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal } from '@/Components/Ui/Modal';
import { DataTable, ButtonWithTooltip } from '@/components/index';
import { useStructure } from '@/Hooks/UseStructure';
import { useDebounce } from '@/Hooks/UseDebounce';
import { ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import type { DataTableColumn} from '@/Components/Ui/DataTable';
import type { StructureElement, ElementType } from '@/Types/StructureTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TableActionButton } from '@/Components/Ui/TableActionButton';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';


interface StructureTableProps {
    onEdit?: (element: StructureElement) => void;
    onDelete?: (element: StructureElement) => void;
    onToggleActive?: (element: StructureElement) => void;
    searchQuery?: string;
    itemsPerPage?: number;
    unstyled?: boolean;
}

export const StructureTable: React.FC<StructureTableProps> = ({
    onEdit,
    onDelete,
    onToggleActive,
    searchQuery = '',
    itemsPerPage = 4,
    unstyled = false
}) => {
    const { treeData, isLoading, loadTree } = useStructure();

    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        element: StructureElement | null;
    }>({ isOpen: false, element: null });

    // Debounce de búsqueda para evitar filtrados innecesarios mientras se escribe
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

    // Cargar elementos al montar el componente
    useEffect(() => {
        loadTree();
    }, [loadTree]);

    // Filtrar elementos basado en la búsqueda y tipo - MEMOIZADO con debounced search
    const filteredElements = useMemo(() => {
        let filtered = allElements;
        
        // Filtro por búsqueda (usar debounced query)
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            
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
                
                // Para cualquier otra búsqueda, buscar SOLO en nombre y nomenclatura
                const matchesName = element.name?.toLowerCase().includes(query);
                const matchesNomenclature = element.nomenclature?.toLowerCase().includes(query);
                const matchesDescription = element.description?.toLowerCase().includes(query);
                
                return matchesName || matchesNomenclature || matchesDescription;
            });
        }
        
        return filtered;
    }, [debouncedSearchQuery, allElements]);

    // Resetear página cuando cambian los filtros (usar debounced para evitar resets innecesarios)
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    // Calcular datos paginados - MEMOIZADO
    const { totalPages, paginatedData } = useMemo(() => {
        const total = Math.ceil(filteredElements.length / itemsPerPage);
        const paginated = filteredElements.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return { totalPages: total, paginatedData: paginated };
    }, [filteredElements, currentPage, itemsPerPage]);

    // Función para truncar descripción - MEMOIZADA
    const truncateDescription = useCallback((text: string | undefined, maxLength: number = 20): string => {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }, []);

    // Obtener el nombre del elemento padre - MEMOIZADA
    const getParentName = useCallback((element: StructureElement): string => {
        if (!element.parentElementId) return 'Sin elemento padre';
        
        // Determinar qué tipo de padre debería tener este elemento
        const expectedParentType = getExpectedParentType(element.type);
        if (!expectedParentType) return 'Sin elemento padre';
        
        // Buscar el padre correcto por tipo E id
        const parent = allElements.find(el => 
            el.type === expectedParentType && 
            el.id === element.parentElementId
        );
        
        return parent?.name || parent?.nomenclature || parent?.description || 'Elemento padre no encontrado';
    }, [allElements]);

    // Helper: Determinar qué tipo de padre debe tener cada elemento - MEMOIZADA
    const getExpectedParentType = useCallback((elementType: ElementType): ElementType | null => {
        const parentTypeMap: Record<ElementType, ElementType | null> = {
            'university': null,
            'campus': 'university',
            'faculty': 'campus',
            'career': 'faculty',
            'dimension': null,
            'component': 'dimension',
            'criteria': 'component',
            'standard': 'criteria',
            'evidence': 'criteria'
        };
        return parentTypeMap[elementType];
    }, []);

    // Configuración de columnas de la tabla
    const columns: DataTableColumn<StructureElement>[] = [
        {
            key: 'type',
            header: 'Tipo',
            align: 'left',
            render: (_, element) => (
                <p className="block font-sans text-sm antialiased font-bold leading-normal text-negro-una">
                    {ELEMENT_TYPE_LABELS[element.type]}
                </p>
            )
        },
        {
            key: 'nomenclature',
            header: 'Nomenclatura',
            align: 'center',
            render: (_, element) => (
                <p className="block font-sans text-sm antialiased font-normal leading-normal text-gris-una">
                    {element.nomenclature || '-'}
                </p>
            )
        },
        {
            key: 'name',
            header: 'Nombre',
            align: 'left',
            render: (_, element) => (
                <p 
                    className={`block font-sans text-sm antialiased font-normal leading-normal text-gris-una max-w-xs truncate ${
                        !element.name ? 'text-center' : 'text-left'
                    }`}
                    title={element.name || '-'}
                >
                    {element.name || '-'}
                </p>
            )
        },
        {
            key: 'description',
            header: 'Descripción',

            align: 'left',
            render: (_, element) => (
                <p className={`block font-sans text-sm antialiased font-normal leading-normal text-gris-una ${
                    !element.description ? 'text-center' : 'text-left'
                }`}>
                    {truncateDescription(element.description) || '-'}
                </p>
            )
        },
        {
            key: 'status',
            header: 'Estado',
            align: 'center',
            render: (_, element) => (
                <div className="w-max mx-auto">
                    <div className={`relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-corner select-none whitespace-nowrap ${
                        element.active 
                            ? 'text-green-900 bg-green-500/20' 
                            : 'text-red-900 bg-red-500/20'
                    }`}>
                        <span>{element.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </div>
            )
        },
        {
        key: 'actions',
        header: 'Acciones',
        align: 'center',
        render: (_, element) => {
            // Lógica para bloquear botones
            const canDelete = !element.hasChildren; // Solo puede eliminar si NO tiene hijos
            const canActivate = element.active || !element.parentElement || element.parentElement.active; // Puede activar si ya está activo, o si no tiene padre, o si el padre está activo
            
            return (
                <div className="flex items-center justify-center gap-2 pr-2">
                    {/* Botón Ver */}
                    <ButtonWithTooltip
                        variant="tableView"
                        size="sm"
                        tooltip="Ver detalles"
                        onClick={() => setModalState({ isOpen: true, element })}
                        className={TABLE_ACTION_BUTTON.button}
                    >
                        <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
                    </ButtonWithTooltip>
                    
                    {/* Botón Editar */}
                    <ButtonWithTooltip
                        variant="tableEdit"
                        size="sm"
                        tooltip="Editar elemento"
                        onClick={() => onEdit?.(element)}
                        className={TABLE_ACTION_BUTTON.button}
                    >
                        <SystemIcons.actions.edit className={TABLE_ACTION_BUTTON.icon} />
                    </ButtonWithTooltip>
                    
                    {/* Botón Power - Activar/Desactivar */}
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
                    
                    {/* Botón Eliminar */}
                    <ButtonWithTooltip
                        variant="tableDelete"
                        size="sm"
                        tooltip={
                            canDelete 
                                ? "Eliminar elemento" 
                                : "No se puede eliminar: tiene elementos dependientes"
                        }
                        onClick={() => onDelete?.(element)}
                        className={TABLE_ACTION_BUTTON.button}
                        disabled={!canDelete}
                    >
                        <SystemIcons.actions.delete className={TABLE_ACTION_BUTTON.icon} />
                    </ButtonWithTooltip>
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
                    currentPage,
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

            {/* Modal de visualización de detalles */}
<Modal
    isOpen={modalState.isOpen}
    onClose={() => setModalState({ isOpen: false, element: null })}
    title="Detalles del Elemento"
    size="md"
>
    {modalState.element && (
        <div className="space-y-6">
            {/* Información básica */}
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-medium text-gray-800">Información básica</h3>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-corner p-4 space-y-3">
                    {/* Tipo */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Tipo de Elemento</label>
                        <p className="text-sm text-gray-900 mt-1">
                            {ELEMENT_TYPE_LABELS[modalState.element.type]}
                        </p>
                    </div>

                    {/* Nomenclatura */}
                    {modalState.element.nomenclature && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Nomenclatura</label>
                            <p className="text-sm text-gray-900 mt-1">
                                {modalState.element.nomenclature}
                            </p>
                        </div>
                    )}

                    {/* Nombre */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Nombre</label>
                        <p className="text-sm text-gray-900 mt-1">
                            {modalState.element.name || '-'}
                        </p>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Estado</label>
                        <div className="mt-1">
                            <div className={`inline-flex items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-corner ${
                                modalState.element.active 
                                    ? 'text-green-900 bg-green-500/20' 
                                    : 'text-red-900 bg-red-500/20'
                            }`}>
                                {modalState.element.active ? 'Activo' : 'Inactivo'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Descripción */}
            {modalState.element.description && (
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="font-medium text-gray-800">Descripción</h3>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-corner p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {modalState.element.description}
                        </p>
                    </div>
                </div>
            )}

            {/* Jerarquía */}
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="font-medium text-gray-800">Ubicación en la jerarquía</h3>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-corner p-4 space-y-2">
                    <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                            <span className="text-xs font-medium text-gray-500">Elemento padre:</span>
                            <p className="text-sm text-gray-700">
                                {getParentName(modalState.element)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-medium text-gray-800">Información adicional</h3>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-corner p-4">
                    <div className="text-xs text-gray-500">
                        Creado el: {new Date(modalState.element.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            </div>
        </div>
    )}
</Modal>
        </>
    );
};