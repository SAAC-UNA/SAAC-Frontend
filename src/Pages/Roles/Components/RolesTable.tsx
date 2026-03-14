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

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DataTable, TableActionButton } from '@/components/index';
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { useRoles } from '@/hooks/UseRoles';
import type { Role } from '@/Services/RoleService';

interface RolesTableProps {
    onEdit?: (role: Role) => void;
    onDelete?: (role: Role) => void;
    onViewPermissions?: (role: Role) => void;
    itemsPerPage?: number;
    unstyled?: boolean; // Para usar sin contenedor
    // Props para datos externos
    roles?: Role[];
    isLoading?: boolean;
    error?: string | null;
    searchQuery?: string; // Búsqueda controlada externamente
}

export const RolesTable: React.FC<RolesTableProps> = ({
    onEdit,
    onDelete,
    onViewPermissions,
    itemsPerPage = TABLE_PAGE_SIZE.standard,
    unstyled = false,
    roles: externalRoles,
    isLoading: externalIsLoading,
    error: externalError,
    searchQuery: externalSearchQuery = ''
}) => {
    // Usar datos externos si están disponibles, sino usar hook interno
    const internalHook = useRoles();
    const roles = externalRoles ?? internalHook.roles;
    const isLoading = externalIsLoading ?? internalHook.isLoading;
    const error = externalError ?? internalHook.error;
    const { loadRoles, clearError } = internalHook;

    const searchQuery = externalSearchQuery;
    const [currentPage, setCurrentPage] = useState(1);

    // Función para truncar texto - memoizada
    const truncateText = useCallback((text: string, maxLength: number = 20): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }, []);

    // Cargar roles al montar el componente solo si no se pasan como props
    useEffect(() => {
        if (!externalRoles) {
            loadRoles();
        }
    }, [externalRoles]);

    // Filtrar roles basado en la búsqueda - memoizado para mejor rendimiento
    const filteredRolesData = useMemo(() => {
        if (!searchQuery.trim()) {
            return roles;
        }
        return roles.filter(role =>
            role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [roles, searchQuery]);

    // Reset página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Calcular datos paginados - memoizado
    const { totalPages, paginatedData } = useMemo(() => {
        const total = Math.ceil(filteredRolesData.length / itemsPerPage);
        const paginated = filteredRolesData.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return { totalPages: total, paginatedData: paginated };
    }, [filteredRolesData, currentPage, itemsPerPage]);

    // Handlers memoizados
    const handleEdit = useCallback((role: Role) => {
        onEdit?.(role);
    }, [onEdit]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Configuración de columnas de la tabla - memoizada
    const columns = useMemo(() => [
        {
            key: 'name',
            header: 'Nombre',
            accessor: 'name',
            render: (value: unknown, item: Role) => (
                <div className="flex flex-col pl-2">
                    <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={String(value)}>
                        {truncateText(String(value), TABLE_TRUNCATE.name)}
                    </p>
                    <p className={`block font-sans antialiased font-normal leading-normal text-gris-una-2 ${TYPOGRAPHY.table.cell}`} title={item.description || 'Sin descripción'}>
                        {truncateText(item.description || 'Sin descripción', TABLE_TRUNCATE.name)}
                    </p>
                </div>
            )
        },
        {
            key: 'permissions',
            header: 'Permisos',
            accessor: 'permissions',
            align: 'center',
            render: (_: unknown, role: Role) => (
                <div className="w-max mx-auto">
                    <div className={`relative grid items-center px-2 py-1 font-sans font-bold text-negro-una-2 rounded-corner select-none whitespace-nowrap bg-gray-500/20 ${TYPOGRAPHY.badge}`}>
                        <span>{Array.isArray(role.permissions) ? role.permissions.length : 0} permisos</span>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Estado',
            align: 'center',
            render: (_: unknown) => (
                <div className="w-max mx-auto">
                    <div className={`relative grid items-center px-2 py-1 font-sans font-bold text-green-900 rounded-corner select-none whitespace-nowrap bg-green-500/20 ${TYPOGRAPHY.badge}`}>
                        <span>Activo</span>
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Acciones',
            align: 'center',
            render: (_: unknown, role: Role) => (
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
    ], [truncateText, onViewPermissions, onDelete, handleEdit]);

    if (error) {
        return (
            <BackendErrorAlert
                error={error}
                onRetry={async () => {
                    clearError();
                    await loadRoles();
                }}
            />
        );
    }
    
    return (

        <div className="w-full">
            <DataTable
                data={paginatedData as any}
                columns={columns as any}
                title="" // Sin título, ScreenContainer lo maneja
                searchable={false}
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