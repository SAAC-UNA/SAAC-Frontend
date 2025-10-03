/**
 * RolesTable - Tabla completa de roles con todas las funcionalidades
 * 
 * Características:
 * - DataTable con paginación
 * - Modal de permisos integrado
 * - Acciones de editar y eliminar
 * - Búsqueda y filtros
 * 
 * Props:
 * @param onEdit - Callback cuando se edita un rol
 * @param onDelete - Callback cuando se elimina un rol
 * @param title - Título de la tabla (opcional)
 * @param description - Descripción de la tabla (opcional)
 * @param showHeader - Mostrar/ocultar el header
 */

import React, { useEffect, useState } from 'react';
import { DataTable, PermissionsModal } from '@/components/index';
import { createTableActions } from '@/components/Ui/TableActionButtons';
import { TableIcons } from './TableIcons';
import { useRoles } from '@/hooks/UseRoles';
import { usePermissionLabels } from '@/hooks/UsePermissionLabels';
import { cn } from '@/utils/ClassNames';
import type { DataTableColumn, DataTableAction } from '@/components/Ui/DataTable';
import type { Role } from '@/Services/RoleService';

interface RolesTableProps {
    onEdit?: (role: Role) => void;
    onDelete?: (role: Role) => void;
    onCreate?: () => void;
    itemsPerPage?: number;
    unstyled?: boolean; // Para usar sin contenedor
}

export const RolesTable: React.FC<RolesTableProps> = ({
    onEdit,
    onDelete,
    onCreate,
    itemsPerPage = 4,
    unstyled = false
}) => {
    const { roles, isLoading, error, loadRoles, clearError } = useRoles();
    const { getLabel } = usePermissionLabels();

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        role: Role | null;
    }>({ isOpen: false, role: null });

    // Función para truncar texto
    const truncateText = (text: string, maxLength: number = 20): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Cargar roles al montar el componente
    useEffect(() => {
        loadRoles();
    }, []);

    // Filtrar roles basado en la búsqueda
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredRoles(roles);
        } else {
            const filtered = roles.filter(role =>
                role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredRoles(filtered);
        }
        setCurrentPage(1);
    }, [roles, searchQuery]);

    // Calcular datos paginados
    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
    const paginatedData = filteredRoles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Configuración de columnas de la tabla
    const columns: DataTableColumn<Role>[] = [
        
        {
            key: 'name',
            header: 'Nombre',
            accessor: 'name',
            render: (value, item) => (
                <div className="flex flex-col pl-2">
                    <p className="block font-sans text-sm antialiased font-bold leading-normal text-negro-una" title={value}>
                        {truncateText(value, 20)}
                    </p>
                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-gris-una opacity-70" title={item.description || 'Sin descripción'}>
                        {truncateText(item.description || 'Sin descripción', 20)}
                    </p>
                </div>
            )
        },
        {
            key: 'permissions',
            header: 'Permisos',
            accessor: 'permissions',
            align: 'center',
            render: (permissions: string[]) => (
                <div className="w-max mx-auto">
                    <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-gray-900 uppercase rounded-md select-none whitespace-nowrap bg-gray-500/20">
                        <span>{permissions.length} permisos</span>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Estado',
            align: 'center',
            render: () => (
                <div className="w-max mx-auto">
                    <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20">
                        <span>Activo</span>
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Acciones',
            align: 'center',
            render: (_, role) => (
                <div className="flex items-center justify-center gap-3 pr-2">
                    {actions.map((action, actionIndex) => (
                        <button
                            key={actionIndex}
                            className={cn(
                                "relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
                                action.className
                            )}
                            type="button"
                            onClick={() => action.onClick(role)}
                            disabled={action.disabled?.(role)}
                            title={action.label}
                        >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                                {action.icon}
                            </span>
                        </button>
                    ))}
                </div>
            )
        }
    ];

    // Acciones disponibles para cada rol usando el sistema Button establecido
    const actions: DataTableAction<Role>[] = createTableActions([
        {
            type: 'view',
            icon: <TableIcons.view className="w-4 h-4" />,
            label: 'Ver permisos',
            onClick: (role) => {
                setModalState({ isOpen: true, role });
            }
        },
        {
            type: 'edit',
            icon: <TableIcons.edit className="w-4 h-4" />,
            label: 'Editar rol',
            onClick: (role) => {
                onEdit?.(role);
            }
        },
        {
            type: 'delete',
            icon: <TableIcons.delete className="w-4 h-4" />,
            label: 'Eliminar rol',
            onClick: (role) => {
                onDelete?.(role);
            }
        }
    ]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, role: null });
    };

    if (error) {
        return (
            <div className="w-full p-6">
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error al cargar roles</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => {
                                        clearError();
                                        loadRoles();
                                    }}
                                    className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    {/* TODO: Renderizar por qué w-full aquí sí sirve y en CreateRoleForms no, ese estilo debe ser unificado*/ }
    return (

        <div className="w-full">
            <DataTable
                data={paginatedData}
                columns={columns}
                title="" // Sin título, ScreenContainer lo maneja
                searchable={true}
                searchPlaceholder="Buscar roles..."
                onSearch={handleSearch}
                primaryAction={onCreate ? {
                    label: 'Crear',
                    icon: <TableIcons.add className="w-4 h-4" />,
                    onClick: onCreate
                } : undefined}
                pagination={totalPages > 1 ? {
                    currentPage,
                    totalPages,
                    onPageChange: handlePageChange
                } : undefined}
                loading={isLoading}
                emptyMessage={
                    searchQuery
                        ? `No se encontraron roles que coincidan con "${searchQuery}"`
                        : "No hay roles creados aún. ¡Crea el primer rol!"
                }
                unstyled={unstyled}
            />

            {/* Modal de permisos */}
            <PermissionsModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                roleName={modalState.role?.name || ''}
                permissions={modalState.role?.permissions || []}
                getPermissionLabel={getLabel}
            />
        </div>
    );
};