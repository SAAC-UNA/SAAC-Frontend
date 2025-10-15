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
import { DataTable, TableActionButton } from '@/components/index';
import { SystemIcons } from '@/components/Ui/Icons/SystemIcons';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { useRoles } from '@/hooks/UseRoles';
import type { DataTableColumn } from '@/components/Ui/DataTable';
import type { Role } from '@/Services/RoleService';

interface RolesTableProps {
    onEdit?: (role: Role) => void;
    onDelete?: (role: Role) => void;
    onCreate?: () => void;
    onViewPermissions?: (role: Role) => void;
    itemsPerPage?: number;
    unstyled?: boolean; // Para usar sin contenedor
    // Props para datos externos
    roles?: Role[];
    isLoading?: boolean;
    error?: string | null;
}

export const RolesTable: React.FC<RolesTableProps> = ({
    onEdit,
    onDelete,
    onCreate,
    onViewPermissions,
    itemsPerPage = 4,
    unstyled = false,
    roles: externalRoles,
    isLoading: externalIsLoading,
    error: externalError
}) => {
    // Usar datos externos si están disponibles, sino usar hook interno
    const internalHook = useRoles();
    const roles = externalRoles ?? internalHook.roles;
    const isLoading = externalIsLoading ?? internalHook.isLoading;
    const error = externalError ?? internalHook.error;
    const { loadRoles, clearError } = internalHook;

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Función para truncar texto
    const truncateText = (text: string, maxLength: number = 20): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Cargar roles al montar el componente solo si no se pasan como props
    useEffect(() => {
        if (!externalRoles) {
            loadRoles();
        }
    }, [externalRoles]);

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
                <div className="flex items-center justify-center gap-2 pr-2">
                    <TableActionButton
                        action="view"
                        tooltip="Ver permisos"
                        onClick={() => onViewPermissions?.(role)}
                    />
                    
                    <TableActionButton
                        action="edit"
                        tooltip="Editar rol"
                        onClick={() => handleEdit(role)}
                    />
                    
                    <TableActionButton
                        action="delete"
                        tooltip="Eliminar rol"
                        onClick={() => onDelete?.(role)}
                    />
                </div>
            )
        }
    ];

    // Función para manejar edición
    const handleEdit = (role: Role) => {
        onEdit?.(role);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (error) {
        return (
            <BackendErrorAlert
                error={error}
                onRetry={() => {
                    clearError();
                    loadRoles();
                }}
            />
        );
    }
    
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
                    icon: <SystemIcons.actions.add className="w-4 h-4" size="sm" />,
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
                        : "No hay roles creados aún."
                }
                unstyled={unstyled}
            />
        </div>
    );
};