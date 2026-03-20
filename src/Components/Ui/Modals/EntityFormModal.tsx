/**
 * EntityFormModal - Modal base reutilizable para formularios de creación/edición
 *
 * Encapsula el Modal con hero card, footer con botones de acción y
 * slot para cualquier formulario como children.
 *
 * Props:
 * @param isOpen       - Controla visibilidad
 * @param onClose      - Callback al cerrar
 * @param onConfirm    - Callback al confirmar (submit)
 * @param title        - Título del modal
 * @param subtitle     - Subtítulo (ej: nombre del elemento en edición)
 * @param confirmLabel - Texto del botón de confirmar
 * @param confirmLoading - Estado de carga del botón confirmar
 * @param confirmDisabled - Deshabilitar botón confirmar
 * @param isEditing    - Cambia variante hero: success (crear) / warning (editar)
 * @param size         - Tamaño del modal
 * @param heroIcon     - Ícono del hero card
 * @param children     - Contenido del formulario
 */

import React from 'react';
import { Modal } from './Modal';
import { Button } from '@/Components/Ui/Buttons/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
  isEditing?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  heroIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  confirmLabel,
  cancelLabel = 'Cancelar',
  confirmLoading = false,
  confirmDisabled = false,
  isEditing = false,
  size = 'lg',
  heroIcon,
  children,
}) => {
  const defaultIcon = isEditing
    ? <SystemIcons.actions.edit className={`${ICON_SIZES.md} text-blanco-una`} />
    : <SystemIcons.actions.add className={`${ICON_SIZES.md} text-blanco-una`} />;

  const defaultConfirmLabel = isEditing ? 'Guardar' : 'Crear';
  const resolvedConfirmLabel = confirmLabel ?? defaultConfirmLabel;
  const confirmVariant = isEditing ? 'warning' : 'success';

  const footerButtons = (
    <>
      <Button
        variant="outline"
        onClick={onClose}
        disabled={confirmLoading}
        standardWidth
      >
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={confirmDisabled || confirmLoading}
        isLoading={confirmLoading}
        loadingText="Procesando"
        standardWidth
      >
        {resolvedConfirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      variant={isEditing ? 'warning' : 'success'}
      size={size}
      heroIcon={heroIcon ?? defaultIcon}
      footerButtons={footerButtons}
    >
      {children}
    </Modal>
  );
};
