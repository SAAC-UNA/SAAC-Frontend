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

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { DataTable, StatusBadge } from '@/components/index';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { truncateText } from '@/Utils';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { useRoles } from '@/hooks/UseRoles';
import type { Role } from '@/Services/RoleService';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { BADGE_COLORS } from '@/Constants/StatusBadges';

interface RolesTableProps {
    onEdit?: (role: Role) => void;
    onDelete?: (role: Role) => void;
    onViewPermissions?: (role: Role) => void;
    onToggleStatus?: (role: Role) => void;
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
    onToggleStatus,
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

    // Reset página cuando cambia la búsqueda (sin useEffect - patrón derived state)
    const prevSearchRef = useRef(searchQuery);
    if (prevSearchRef.current !== searchQuery) {
        prevSearchRef.current = searchQuery;
        setCurrentPage(1);
    }

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
    // (movido a patrón derived state arriba)

    // Calcular datos paginados - memoizado
    const { totalPages, paginatedData } = useMemo(() => {
        const total = Math.ceil(filteredRolesData.length / itemsPerPage);
        const paginated = filteredRolesData.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return { totalPages: total, paginatedData: paginated };
    }, [filteredRolesData, currentPage, itemsPerPage]);

    const firstColumn = useFirstColumnConfig();

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
            align: 'left',
            width: firstColumn.width,
            render: (value: unknown, item: Role) => (
                <div className="flex flex-col">
                    <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={String(value)}>
                        {truncateText(String(value), firstColumn.maxLength)}
                    </p>
                    <p className={`block font-sans antialiased font-normal leading-normal text-gris-una-2 ${TYPOGRAPHY.table.helper}`} title={item.description || 'Sin descripción'}>
                        {truncateText(item.description || 'Sin descripción', firstColumn.maxLength)}
                    </p>
                </div>
            )
        },
        {
            key: 'permissions',
            header: 'Permisos',
            accessor: 'permissions',
            align: 'left',
            render: (_: unknown, role: Role) => (
                <div className="flex items-start">
                    <StatusBadge
                        label={`${Array.isArray(role.permissions) ? role.permissions.length : 0} permisos`}
                        colorClasses={BADGE_COLORS.gris.colorClasses}
                    />
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Acciones',
            align: 'center',
            render: (_: unknown, role: Role) => (
                <div className="flex items-center justify-center gap-2">
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
                        action="power"
                        tooltip={role.is_active ? 'Inactivar rol' : 'Activar rol'}
                        onClick={() => onToggleStatus?.(role)}
                        isActive={role.is_active}
                    />

                    <TableActionButton
                        action="delete"
                        tooltip={
                            role.is_protected
                                ? 'Los roles del sistema no pueden eliminarse'
                                : role.users_count > 0
                                    ? `No se puede eliminar: tiene ${role.users_count} usuarios asignados`
                                    : 'Eliminar rol'
                        }
                        onClick={() => onDelete?.(role)}
                        disabled={!role.can_delete}
                    />
                </div>
            )
        }
    ], [onViewPermissions, onDelete, onToggleStatus, handleEdit]);

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