/**
 * CreateConfirmationModal - Modal de confirmación para operaciones de creación
 * 
 * Utiliza el componente Modal base con variant="success" o "info".
 * Los botones tienen ancho fijo de 128px (standardWidth={true}) por estandarización.
 */

import React from 'react';
import { Modal } from './Modal';

interface CreateConfirmationModalProps {
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
    variant?: 'success' | 'info';
    description?: string;
}

export const CreateConfirmationModal: React.FC<CreateConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar creación',
    message,
    itemName,
    itemType = 'elemento',
    confirmLabel = 'Crear',
    cancelLabel = 'Cancelar',
    isLoading = false,
    variant = 'success',
    description
}) => {
    const defaultMessage = itemName
        ? (
            <>
              ¿Está seguro de que desea crear el {itemType} "<span className="font-bold">{itemName}</span>"?
            </>
          )
        : `¿Está seguro de que desea crear este ${itemType}?`;

    const finalMessage = message || defaultMessage;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            variant={variant}
            title={title}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            confirmLoading={isLoading}
            showCancel
            showConfirm
        >
            <p className="text-sm text-gris-una-2 leading-relaxed">{finalMessage}</p>
            {description && (
                <div className="mt-3 p-4 bg-gray-50 rounded-corner">
                    <p className="text-sm text-gray-600">
                        <strong>Descripción:</strong> {description}
                    </p>
                </div>
            )}
        </Modal>
    );
};