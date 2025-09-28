/**
 * Modal para mostrar los permisos de un rol
 */

import React from 'react';
import { Button } from './Button';

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-negro-una/40 bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-blanco-una-2 rounded-lg shadow-xl max-w-lg w-full max-h-96">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Permisos del Rol
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {roleName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-rojo-una hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {permissions.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                Este rol no tiene permisos asignados
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {permissions.map((permission, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-3 bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {/* TODO debería de pasar también la descripción getDescription */}
                                                {getPermissionLabel ? getPermissionLabel(permission) : permission}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {permission}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center px-6 py-4 border-t bg-blanco-una-2 rounded-b-lg">
                        <span className="text-sm text-gris-una">
                            Total: {permissions.length} permisos
                        </span>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            size="sm"
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};