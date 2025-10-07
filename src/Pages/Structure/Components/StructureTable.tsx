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
import type { StructureElement } from '@/Types/StructureTypes';
import { TableIcons } from '@/Pages/Roles/Components/TableIcons';


interface StructureTableProps {
    onEdit?: (element: StructureElement) => void;
    onDelete?: (element: StructureElement) => void;
    onCreate?: () => void;
    itemsPerPage?: number;
    unstyled?: boolean;
}

export const StructureTable: React.FC<StructureTableProps> = ({
    onEdit,
    onDelete,
    onCreate,
    itemsPerPage = 10,
    unstyled = false
}) => {
    const { treeData, isLoading, loadTree } = useStructure();

    const [searchQuery, setSearchQuery] = useState('');
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


    // Filtrar elementos basado en la búsqueda
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredElements(allElements);
        } else {
            const filtered = allElements.filter(element =>
                element.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                element.nomenclature?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                element.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ELEMENT_TYPE_LABELS[element.type].toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredElements(filtered);
        }
        setCurrentPage(1);
    }, [allElements, searchQuery]);

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
        const parent = allElements.find(el => el.id === element.parentElementId);
        return parent?.name || parent?.nomenclature || 'Elemento padre no encontrado';
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
                <p className="block font-sans text-sm antialiased font-bold leading-normal text-negro-una">
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
            render: (_, element) => (
                <div className="flex items-center justify-center gap-2 pr-2">
                    <ButtonWithTooltip
                        variant="tableView"
                        size="sm"
                        tooltip="Ver detalles"
                        onClick={() => setModalState({ isOpen: true, element })}
                        className="h-8 w-8 p-2"
                    >
                        <TableIcons.view className="w-4 h-4" />
                    </ButtonWithTooltip>
                    
                    <ButtonWithTooltip
                        variant="tableEdit"
                        size="sm"
                        tooltip="Editar elemento"
                        onClick={() => onEdit?.(element)}
                        className="h-8 w-8 p-2"
                    >
                        <TableIcons.edit className="w-4 h-4" />
                    </ButtonWithTooltip>
                    
                    <ButtonWithTooltip
                        variant="tableDelete"
                        size="sm"
                        tooltip="Eliminar elemento"
                        onClick={() => onDelete?.(element)}
                        className="h-8 w-8 p-2"
                    >
                        <TableIcons.delete className="w-4 h-4" />
                    </ButtonWithTooltip>
                </div>
            )
        }
    ];

    return (
        <>
            <DataTable
                data={paginatedData}
                columns={columns}
                title=""
                searchable={true}
                searchPlaceholder="Buscar elementos..."
                onSearch={setSearchQuery}
                primaryAction={onCreate ? {
                    label: 'Crear',
                    icon: <TableIcons.add className="w-4 h-4" />,
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
                    <div className="space-y-4">
                        {/* Tipo de elemento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Elemento
                            </label>
                            <p className="text-gray-900">
                                {ELEMENT_TYPE_LABELS[modalState.element.type]}
                            </p>
                        </div>

                        {/* Nomenclatura */}
                        {modalState.element.nomenclature && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nomenclatura
                                </label>
                                <p className="text-gray-900">
                                    {modalState.element.nomenclature}
                                </p>
                            </div>
                        )}

                        {/* Nombre */}
                        {modalState.element.name && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre
                                </label>
                                <p className="text-gray-900">
                                    {modalState.element.name}
                                </p>
                            </div>
                        )}

                        {/* Descripción completa */}
                        {modalState.element.description && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción Completa
                                </label>
                                <p className="text-gray-900">
                                    {modalState.element.description}
                                </p>
                            </div>
                        )}

                        {/* Elemento padre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Elemento Padre
                            </label>
                            <p className="text-gray-900">
                                {getParentName(modalState.element)}
                            </p>
                        </div>

                        {/* Fecha de creación */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Creación
                            </label>
                            <p className="text-gray-900">
                                {new Date(modalState.element.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <div className="w-max">
                                <div className={`relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap ${
                                    modalState.element.active 
                                        ? 'text-green-900 bg-green-500/20' 
                                        : 'text-red-900 bg-red-500/20'
                                }`}>
                                    <span>{modalState.element.active ? 'Activo' : 'Inactivo'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};