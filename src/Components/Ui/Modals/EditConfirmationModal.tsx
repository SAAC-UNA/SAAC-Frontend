/**
 * EditConfirmationModal - Modal de confirmación para operaciones de edición
 * 
 * Utiliza el componente Modal base con variant="warning" o "info".
 * Los botones tienen ancho fijo de 128px (standardWidth={true}) por estandarización.
 */

import React from 'react';
import { Modal } from './Modal';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';

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
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            confirmLoading={isLoading}
            showCancel
            showConfirm
        >
            <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed wrap-anywhere')}>{finalMessage}</p>
            {description && (
                <div className="mt-3 p-3 bg-info-light border border-info-ring rounded-corner">
                    <p className={cn(TYPOGRAPHY.modal.body, 'text-info-dark')}>{description}</p>
                </div>
            )}
        </Modal>
    );
};