/**
 * PermissionsModal - Modal para mostrar los permisos de un rol
 * 
 * Ahora usa Modal unificado como base para consistencia visual.
 * Los botones del modal tienen ancho fijo de 128px (standardWidth={true}) heredado del componente base.
 */

import React from 'react';
import { Modal } from './Modal';
import { SystemIcons } from './Icons/SystemIcons';

interface BackendPermission {
    id: number;
    name: string;
    label: string;
}

interface PermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    roleName: string;
    roleDescription?: string;
    // roleCreatedAt?: Date;
    permissions: BackendPermission[] | string[];
    getPermissionLabel?: (permission: string) => string;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
    isOpen,
    onClose,
    roleName,
    roleDescription,
    // roleCreatedAt,
    permissions,
    getPermissionLabel
}) => {
    

    
    // TODO: Función para formatear fechas
    // const formatDate = (date?: Date): string => {
    //     if (!date) return 'Fecha no disponible';
    //     
    //     return new Intl.DateTimeFormat('es-ES', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric',
    //         hour: '2-digit',
    //         minute: '2-digit'
    //     }).format(date);
    // };
    
    const renderRoleInfo = () => (
        <div className="mb-6">
            {/* 
            // TODO: Fecha de creación - cuando se modifique el backend
            // El backend actualmente no envía created_at en el RoleResource
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-blue-800">Fecha de creación:</span>
                </div>
                <p className="text-blue-700 mt-1 ml-7">
                    {roleCreatedAt ? formatDate(roleCreatedAt) : 'No disponible'}
                </p>
            </div>
            */}
            
            {/* Descripción del rol */}
            {roleDescription && (
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <SystemIcons.modal.document className="w-5 h-5 text-gray-600" />
                        <h3 className="font-medium text-gray-800">Descripción del rol</h3>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {roleDescription}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
    
    const renderPermissionsList = () => (
        <div>
            <div className="flex items-center space-x-2 mb-3">
                <SystemIcons.modal.key className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-800">Permisos asignados</h3>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {permissions.length > 0 ? (
                    <div className="space-y-2">
                        {permissions.map((permission, index) => {
                            // Determinar si es un objeto del backend o un string
                            const isObject = typeof permission === 'object' && permission !== null;
                            const permissionLabel = isObject 
                                ? permission.label 
                                : (getPermissionLabel ? getPermissionLabel(permission) : permission);
                            
                            return (
                                <div key={isObject ? permission.id : index} className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">
                                        {permissionLabel}
                                    </span>
                                </div>
                            );
                        })}
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            variant="info"
            title="Permisos del Rol"
            message={
                <>
                    Permisos asignados al rol: <span className="font-bold">{roleName}</span>
                </>
            }
            showConfirm={false}
            showCancel={true}
            cancelLabel="Cerrar"
            size="lg"
        >
            {renderRoleInfo()}
            {renderPermissionsList()}
        </Modal>
    );
};