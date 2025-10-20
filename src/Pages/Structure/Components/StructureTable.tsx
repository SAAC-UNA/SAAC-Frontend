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

import React, { useEffect, useState } from 'react';
import { Modal } from '@/Components/Ui/Modal';
import { DataTable, ButtonWithTooltip } from '@/components/index';
import { useStructure } from '@/Hooks/UseStructure';
import { ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import type { DataTableColumn} from '@/Components/Ui/DataTable';
import type { StructureElement, ElementType } from '@/Types/StructureTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import type { SelectOption } from '@/Types/StructureTypes';
import { TableActionButton } from '@/Components/Ui/TableActionButton';


interface StructureTableProps {
    onEdit?: (element: StructureElement) => void;
    onDelete?: (element: StructureElement) => void;
    onToggleActive?: (element: StructureElement) => void;
    onCreate?: () => void;
    itemsPerPage?: number;
    unstyled?: boolean;
}

export const StructureTable: React.FC<StructureTableProps> = ({
    onEdit,
    onDelete,
    onToggleActive,
    onCreate,
    itemsPerPage = 4,
    unstyled = false
}) => {
    const { treeData, isLoading, loadTree } = useStructure();

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<ElementType | 'all'>('all');
    const [filteredElements, setFilteredElements] = useState<StructureElement[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        element: StructureElement | null;
    }>({ isOpen: false, element: null });

    // Aplanar el árbol para obtener todos los elementos como lista
    const allElements = React.useMemo(() => {
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


    // Filtrar elementos basado en la búsqueda y tipo
    useEffect(() => {
        let filtered = allElements;
        
        // Filtro por búsqueda
        if (searchQuery.trim()) {
            filtered = filtered.filter(element =>
                element.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                element.nomenclature?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                element.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ELEMENT_TYPE_LABELS[element.type].toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Filtro por tipo
        if (typeFilter !== 'all') {
            filtered = filtered.filter(element => element.type === typeFilter);
        }
    
        setFilteredElements(filtered);
    }, [allElements, searchQuery, typeFilter]);

    // Resetear página solo cuando cambian los filtros, no cuando cambian los datos
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter]);

    // Calcular datos paginados
    const totalPages = Math.ceil(filteredElements.length / itemsPerPage);
    const paginatedData = filteredElements.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Función para truncar descripción
    const truncateDescription = (text: string | undefined, maxLength: number = 50): string => {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Obtener el nombre del elemento padre
    const getParentName = (element: StructureElement): string => {
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
    };

    // Helper: Determinar qué tipo de padre debe tener cada elemento
    const getExpectedParentType = (elementType: ElementType): ElementType | null => {
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
    };

    // Configuración de columnas de la tabla
    const columns: DataTableColumn<StructureElement>[] = [
        {
            key: 'type',
            header: 'Tipo',
            render: (_, element) => (
                <p className="block font-sans text-sm antialiased font-bold leading-normal text-negro-una">
                    {ELEMENT_TYPE_LABELS[element.type]}
                </p>
            )
        },
        {
            key: 'nomenclature',
            header: 'Nomenclatura',
            render: (_, element) => (
                <p className="block font-sans text-sm antialiased font-bold leading-normal text-negro-una">
                    {element.nomenclature || '-'}
                </p>
            )
        },
        {
            key: 'name',
            header: 'Nombre',
            render: (_, element) => (
                <p 
                    className="block font-sans text-sm antialiased font-bold leading-normal text-negro-una max-w-xs truncate"
                    title={element.name || '-'}
                >
                    {element.name || '-'}
                </p>
            )
        },
        {
            key: 'description',
            header: 'Descripción',
            render: (_, element) => (
                <p className="block font-sans text-sm antialiased font-normal leading-normal text-gris-una">
                    {truncateDescription(element.description)}
                </p>
            )
        },
        {
            key: 'status',
            header: 'Estado',
            render: (_, element) => (
                <div className="w-max">
                    <div className={`relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap ${
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
                    className="h-8 w-8 p-2"
                >
                    <SystemIcons.actions.view className="w-4 h-4" />
                </ButtonWithTooltip>
                
                {/* Botón Editar */}
                <ButtonWithTooltip
                    variant="tableEdit"
                    size="sm"
                    tooltip="Editar elemento"
                    onClick={() => onEdit?.(element)}
                    className="h-8 w-8 p-2"
                >
                    <SystemIcons.actions.edit className="w-4 h-4" />
                </ButtonWithTooltip>
                
                {/* Botón Power - Activar/Desactivar */}
                <TableActionButton
                    action="power"
                    isActive={element.active}
                    tooltip={
                        !canActivate 
                            ? "No se puede activar: el padre está inactivo"
                            : element.active 
                                ? "Desactivar elemento" 
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
                    className="h-8 w-8 p-2"
                    disabled={!canDelete}
                >
                    <SystemIcons.actions.delete className="w-4 h-4" />
                </ButtonWithTooltip>
            </div>
        );
    }
}
    ];

    // Opciones para el filtro de tipo
    const typeOptions: SelectOption[] = [
        { value: 'all', label: 'Todos los tipos' },
        ...Object.entries(ELEMENT_TYPE_LABELS).map(([value, label]) => ({
            value,
            label
        }))
    ];

    return (
        <>
            {/* Filtro por tipo */}
            <div className="flex gap-4 mb-4">
                <div className="w-64">
                    <CustomSelect
                        label="Filtrar por tipo"
                        options={typeOptions}
                        value={typeFilter}
                        onChange={(value) => setTypeFilter(value as ElementType | 'all')}
                        placeholder="Todos los tipos"
                    />
                </div>
        </div>

            <DataTable
                data={paginatedData}
                columns={columns}
                title=""
                searchable={true}
                searchPlaceholder="Buscar elementos..."
                onSearch={setSearchQuery}
                primaryAction={onCreate ? {
                    label: 'Crear',
                    icon: <SystemIcons.actions.add className="w-4 h-4" />,
                    onClick: onCreate
                } : undefined}
                pagination={totalPages > 1 ? {
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage
                } : undefined}
                loading={isLoading}
                emptyMessage={
                    searchQuery
                        ? `No se encontraron elementos que coincidan con "${searchQuery}"`
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
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
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
                            <div className={`inline-flex items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md ${
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
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
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
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
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
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
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