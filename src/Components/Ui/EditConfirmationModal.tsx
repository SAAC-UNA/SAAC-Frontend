/**
 * EditConfirmationModal - Modal de confirmación para operaciones de edición
 * 
 * Utiliza el componente Modal base con variant="warning" o "info".
 * Los botones tienen ancho fijo de 128px (modalButton={true}) por estandarización.
 */

import React from 'react';
import { Modal } from './Modal';

interface EditConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
    itemType?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    variant?: 'warning' | 'info';
    description?: string;
}

export const EditConfirmationModal: React.FC<EditConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar edición',
    message,
    itemName,
    itemType = 'elemento',
    confirmLabel = 'Guardar',
    cancelLabel = 'Cancelar',
    isLoading = false,
    variant = 'warning',
    description
}) => {
    const defaultMessage = itemName
        ? (
            <>
              ¿Está seguro de que desea guardar los cambios en el {itemType} "<span className="font-bold">{itemName}</span>"?
            </>
          )
        : `¿Está seguro de que desea guardar los cambios en este ${itemType}?`;

    const finalMessage = message || defaultMessage;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            variant={variant}
            title={title}
            message={finalMessage}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            confirmLoading={isLoading}
            showCancel={true}
            showConfirm={true}
        >
            {description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>Nueva descripción:</strong> {description}
                    </p>
                </div>
            )}
        </Modal>
    );
};