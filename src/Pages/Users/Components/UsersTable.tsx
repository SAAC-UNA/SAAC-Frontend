import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DataTable, TableActionButton } from '@/components/index';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';
import { useUsers } from '@/Hooks/UseUsers';
import { useDebounce } from '@/Hooks/UseDebounce';
import type { DataTableColumn } from '@/components/Ui/DataTable';
import type { User } from '@/Services/UserService';

interface UsersTableProps {
    onViewUser?: (user: User) => void;
    onEdit?: (user: User) => void;
    onState?: (user: User) => void;
    itemsPerPage?: number;
    unstyled?: boolean;
    // Props para datos externos
    users?: User[];
    isLoading?: boolean;
    error?: string | null;
    searchQuery?: string; // Búsqueda controlada externamente
}

export const UsersTable: React.FC<UsersTableProps> = ({
    onViewUser,
    onEdit,
    onState,
    itemsPerPage = 4,
    unstyled = false,
    users: externalUsers,
    isLoading: externalIsLoading,
    error: externalError,
    searchQuery: externalSearchQuery = ''
}) => {
    // Usar datos externos si están disponibles, sino usar hook interno
    const internalHook = useUsers();
    
    // Si se pasan props externas, usar esas; si no, usar hook interno
    const shouldUseExternal = externalUsers !== undefined;
    const users = shouldUseExternal ? externalUsers : internalHook.users;
    const isLoading = shouldUseExternal ? (externalIsLoading ?? false) : internalHook.isLoading;
    const error = shouldUseExternal ? (externalError ?? null) : internalHook.error;
    const { loadUsers } = internalHook;

    const [currentPage, setCurrentPage] = useState(1);

    // Debounce de búsqueda para evitar filtrados innecesarios mientras se escribe
    const debouncedSearchQuery = useDebounce(externalSearchQuery, 300);

    // Función para truncar texto - memoizada
    const truncateText = useCallback((text: string, maxLength: number = 20): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }, []);

    // Cargar usuarios al montar el componente solo si no se pasan como props
    useEffect(() => {
        if (!shouldUseExternal) {
            loadUsers();
        }
    }, [shouldUseExternal, loadUsers]);

    // Filtrar usuarios basado en la búsqueda debounced - memoizado
    const filteredUsers = useMemo(() => {
        if (!debouncedSearchQuery.trim()) {
            return users;
        }
        
        const query = debouncedSearchQuery.toLowerCase();
        return users.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.role && user.role.toLowerCase().includes(query))
        );
    }, [users, debouncedSearchQuery]);

    // Reset página cuando cambian los filtros (usar debounced para evitar resets innecesarios)
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    // Calcular datos paginados - memoizado
    const { totalPages, paginatedData } = useMemo(() => {
        const total = Math.ceil(filteredUsers.length / itemsPerPage);
        const paginated = filteredUsers.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return { totalPages: total, paginatedData: paginated };
    }, [filteredUsers, currentPage, itemsPerPage]);

    // Configuración de columnas de la tabla - memoizada para evitar recreación
    const columns: DataTableColumn<User>[] = useMemo(() => [
        {
            key: 'name',
            header: 'Nombre',
            accessor: 'name',
            render: (value, user) => (
                <div className="flex flex-col pl-2">
                    <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={String(value)}>
                        {truncateText(String(value), TABLE_TRUNCATE.name)}
                    </p>
                    <p className={`block font-sans antialiased font-normal leading-normal text-gris-una opacity-70 ${TYPOGRAPHY.table.cell}`} title={user.email}>
                        {truncateText(user.email, TABLE_TRUNCATE.email)}
                    </p>
                </div>
            )
        },
        {
            key: 'role',
            header: 'Rol',
            accessor: 'role',
            align: 'center',
            render: (role) => (
                <div className="w-max mx-auto">
                    <div className={`relative grid items-center px-2 py-1 font-sans font-bold text-negro-una-2 rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.badge}`} title={String(role || 'Sin rol').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}>
                        <span>{truncateText(String(role || 'Sin rol').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()), TABLE_TRUNCATE.name)}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Estado',
            align: 'center',
            render: (_, user) => (
                <div className="w-max mx-auto">
                    <div className={`relative grid items-center px-2 py-1 font-sans font-bold rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.badge} ${
                        user.status === 'active'
                            ? 'text-green-900 bg-green-500/20'
                            : 'text-red-900 bg-red-500/20'
                    }`}>
                        <span>{user.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Acciones',
            align: 'center',
            render: (_, user) => (
                <div className="flex items-center justify-center gap-2 pr-2">
                    <TableActionButton
                        action="view"
                        tooltip="Ver usuario"
                        onClick={() => onViewUser?.(user)}
                    />
                    
                    <TableActionButton
                        action="edit"
                        tooltip="Editar usuario"
                        onClick={() => onEdit?.(user)}
                    />

                    <TableActionButton
                        action="power"
                        tooltip={user.status === 'active' ? 'Inactivar usuario' : 'Activar usuario'}
                        onClick={() => onState?.(user)}
                        isActive={user.status === 'active'}
                    />
                </div>
            )
        }
    ], [truncateText, onViewUser, onEdit, onState]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    if (error) {
        return (
            <BackendErrorAlert
                error={error}
                onRetry={async () => {
                    await loadUsers();
                }}
            />
        );
    }

    return (
        <div className="w-full">
            <DataTable
                data={paginatedData as any}
                columns={columns as any}
                title=""
                searchable={false}
                pagination={totalPages > 1 ? {
                    currentPage,
                    totalPages,
                    onPageChange: handlePageChange
                } : undefined}
                loading={isLoading}
                emptyMessage={
                    debouncedSearchQuery
                        ? `No se encontraron usuarios que coincidan con "${debouncedSearchQuery}"`
                        : "No hay usuarios registrados aún."
                }
                unstyled={unstyled}
            />
        </div>
    );
};