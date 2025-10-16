import React, { useEffect, useState } from 'react';
import { DataTable, TableActionButton } from '@/components/index';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { useUsers } from '@/Hooks/UseUsers';
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
}

export const UsersTable: React.FC<UsersTableProps> = ({
    onViewUser,
    onEdit,
    onState,
    itemsPerPage = 4,
    unstyled = false,
    users: externalUsers,
    isLoading: externalIsLoading,
    error: externalError
}) => {
    // Usar datos externos si están disponibles, sino usar hook interno
    const internalHook = useUsers();
    
    // Si se pasan props externas, usar esas; si no, usar hook interno
    const shouldUseExternal = externalUsers !== undefined;
    const users = shouldUseExternal ? externalUsers : internalHook.users;
    const isLoading = shouldUseExternal ? (externalIsLoading ?? false) : internalHook.isLoading;
    const error = shouldUseExternal ? (externalError ?? null) : internalHook.error;
    const { loadUsers } = internalHook;

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Función para truncar texto
    const truncateText = (text: string, maxLength: number = 20): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Cargar usuarios al montar el componente solo si no se pasan como props
    useEffect(() => {
        if (!shouldUseExternal) {
            loadUsers();
        }
    }, [shouldUseExternal, loadUsers]);

    // Filtrar usuarios basado en la búsqueda
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredUsers(filtered);
        }
        setCurrentPage(1);
    }, [users, searchQuery]);

    // Calcular datos paginados
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedData = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Configuración de columnas de la tabla
    const columns: DataTableColumn<User>[] = [
        {
            key: 'name',
            header: 'Nombre',
            accessor: 'name',
            render: (value, user) => (
                <div className="flex flex-col pl-2">
                    <p className="block font-sans text-sm antialiased font-bold leading-normal text-negro-una" title={value}>
                        {truncateText(value, 20)}
                    </p>
                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-gris-una opacity-70" title={user.email}>
                        {truncateText(user.email, 25)}
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
                    <div className="relative grid items-center px-2 py-1 font-sans text-xs font-semibold text-gray-900 uppercase rounded-md select-none whitespace-nowrap">
                        <span>{role || 'Sin rol'}</span>
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
                    <div className={`relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap ${
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
                        tooltip={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                        onClick={() => onState?.(user)}
                        isActive={user.status === 'active'}
                    />
                </div>
            )
        }
    ];

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
                    loadUsers();
                }}
            />
        );
    }

    return (
        <div className="w-full">
            <DataTable
                data={paginatedData}
                columns={columns}
                title=""
                searchable={true}
                searchPlaceholder="Buscar usuarios..."
                onSearch={handleSearch}
                pagination={totalPages > 1 ? {
                    currentPage,
                    totalPages,
                    onPageChange: handlePageChange
                } : undefined}
                loading={isLoading}
                emptyMessage={
                    searchQuery
                        ? `No se encontraron usuarios que coincidan con "${searchQuery}"`
                        : "No hay usuarios registrados aún."
                }
                unstyled={unstyled}
            />
        </div>
    );
};