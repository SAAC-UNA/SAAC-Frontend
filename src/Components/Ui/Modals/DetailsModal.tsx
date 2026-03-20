/**
 * DetailsModal - Modal estándar para mostrar detalles de elementos
 *
 * Patrón "view": cuerpo limpio + botón "Cerrar" en el footer.
 * Tamaño predefinido: lg (max-w-4xl).
 *
 * Uso:
 *   <DetailsModal isOpen={...} onClose={...} title="Detalles del Usuario">
 *     {children}
 *   </DetailsModal>
 */

import React from 'react';
import { Modal } from './Modal';
import { Button } from '../Buttons/Button';
import type { ModalVariant } from './Modal';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: ModalVariant;
  heroIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  title = 'Detalles',
  subtitle,
  cancelLabel = 'Cerrar',
  size = 'lg',
  variant,
  heroIcon,
  children
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size={size}
      variant={variant}
      heroIcon={heroIcon}
      footerButtons={
        <Button variant="outline" standardWidth onClick={onClose}>
          {cancelLabel}
        </Button>
      }
    >
      {children}
    </Modal>
  );
};