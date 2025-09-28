/**
 * PermissionsModal - Modal para mostrar los permisos de un rol
 * 
 * Ahora usa UniversalModal como base para consistencia visual
 */

import React from 'react';
import { UniversalModal } from './UniversalModal';

interface PermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    roleName: string;
    permissions: string[];
    getPermissionLabel?: (permission: string) => string;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
    isOpen,
    onClose,
    roleName,
    permissions,
    getPermissionLabel
}) => {
    
    const renderPermissionsList = () => (
        <div className="mt-4">
            <div className="bg-blanco-una rounded-lg p-4 max-h-60 overflow-y-auto">
                {permissions.length > 0 ? (
                    <div className="space-y-2">
                        {permissions.map((permission, index) => (
                            <div key={index} className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700">
                                    {getPermissionLabel ? getPermissionLabel(permission) : permission}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Este rol no tiene permisos asignados
                    </p>
                )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
                Total: {permissions.length} permiso{permissions.length !== 1 ? 's' : ''}
            </div>
        </div>
    );

    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            variant="info"
            title="Permisos del Rol"
            message={`Permisos asignados al rol: ${roleName}`}
            showConfirm={false}
            showCancel={true}
            cancelLabel="Cerrar"
            size="md"
        >
            {renderPermissionsList()}
        </UniversalModal>
    );
};