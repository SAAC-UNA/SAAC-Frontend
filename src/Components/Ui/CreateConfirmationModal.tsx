/**
 * CreateConfirmationModal - Modal de confirmación para operaciones de creación
 */

import React from 'react';
import { UniversalModal } from './UniversalModal';

interface CreateConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    variant?: 'success' | 'info';
}

export const CreateConfirmationModal: React.FC<CreateConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar creación',
    message,
    itemName,
    confirmLabel = 'Crear',
    cancelLabel = 'Cancelar',
    isLoading = false,
    variant = 'success'
}) => {
    const defaultMessage = itemName
        ? `¿Está seguro de que desea crear "${itemName}"?`
        : '¿Está seguro de que desea crear este elemento?';

    const finalMessage = message || defaultMessage;

    return (
        <UniversalModal
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
        />
    );
};