/**
 * UserDetailsModal - Modal para mostrar los detalles completos de un usuario
 * 
 * Sigue el mismo patrón que PermissionsRoleModal para consistencia visual.
 * Muestra información detallada del usuario: datos personales, rol y permisos.
 */

import React from 'react';
import { DetailsModal } from '@/Components/Ui/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import type { User } from '@/Services/UserService';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
    isOpen,
    onClose,
    user
}) => {
    if (!user) return null;

    const formatDate = (date?: Date): string => {
        if (!date) return 'No disponible';
        
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };
    
    const renderUserInfo = () => (
        <div>
            {/* Información personal */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto mb-6">
                <div className="flex items-center space-x-2 mb-3">
                    <SystemIcons.users.user className="w-5 h-5 text-gray-600" />
                    <h3 className="font-sm text-gray-700">Información Personal</h3>
                </div>
                
                <div className="space-y-2">
                    <div>
                        <span className="text-sm font-sm text-gray-800">Nombre:</span>
                        <p className="text-sm text-gray-700">{user.name}</p>
                    </div>
                    <div>
                        <span className="text-sm font-sm text-gray-800">Correo electrónico:</span>
                        <p className="text-sm text-gray-700">{user.email}</p>
                    </div>
                    <div>
                        <span className="text-sm font-sm text-gray-800">Estado:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-sm rounded-full ${
                            user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Rol asignado */}
            {user.role && (
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                        <SystemIcons.users.roles className="w-5 h-5 text-gray-600" />
                        <h3 className="font-sm text-gray-800">Rol Asignado</h3>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <span className="text-sm text-gray-700">
                            {user.role}
                        </span>
                    </div>
                </div>
            )}

            {/* Fechas */}
            <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                    <SystemIcons.modal.document className="w-5 h-5 text-gray-600" />
                    <h3 className="font-sm text-gray-800">Información de Registro</h3>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div>
                        <span className="text-sm text-gray-700">Fecha de creación:</span>
                        <p className="text-sm text-gray-700">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-700">Última actualización:</span>
                        <p className="text-sm text-gray-700">{formatDate(user.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderPermissionsList = () => (
        <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
                <SystemIcons.modal.key className="w-5 h-5 text-gray-600" />
                <h3 className="font-sm text-gray-800">Permisos Directos</h3>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {user.allPermissions && user.allPermissions.length > 0 ? (
                    <div className="space-y-2">
                        {user.allPermissions.map((permission, index) => (
                            <div key={index} className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700">
                                    {permission.label}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Este usuario no tiene permisos directos asignados
                    </p>
                )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
                Total: {user.allPermissions?.length || 0} permiso{(user.allPermissions?.length || 0) !== 1 ? 's' : ''}
            </div>
        </div>
    );

    return (
        <DetailsModal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalles del Usuario"
            itemName={user.name}
            itemType="usuario"
            cancelLabel="Cerrar"
            size="lg"
        >
            {renderUserInfo()}
            {renderPermissionsList()}
        </DetailsModal>
    );
};