/**
 * DetailsModal - Modal estándar para mostrar detalles de elementos
 * 
 * Modal reutilizable que sigue el patrón de los otros modales estándar.
 * Utiliza el componente Modal base con variant="info".
 */

import React from 'react';
import { Modal } from './Modal';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemName?: string;
  itemType?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  title = 'Detalles',
  itemName,
  itemType = 'elemento',
  cancelLabel = 'Cerrar',
  size = 'lg',
  children
}) => {
  const defaultMessage = itemName ? (
    <>
      Información detallada del {itemType}: <span className="font-semibold">{itemName}</span>
    </>
  ) : (
    `Información detallada del ${itemType}`
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="info"
      title={title}
      message={defaultMessage}
      showConfirm={false}
      showCancel={true}
      cancelLabel={cancelLabel}
      size={size}
    >
      {children}
    </Modal>
  );
};