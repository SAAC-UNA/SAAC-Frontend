/**
 * GenerateLinksConfirmModal - Confirmación para generar enlaces públicos masivos.
 * HU023 - Gestión de Informes Finales
 */

import React from "react";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { cn } from "@/Utils/ClassNames";

interface GenerateLinksConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isFlexible?: boolean;
  flexibleSourceLabel?: string;
}

const pluralizeSpanish = (label: string): string => {
  const trimmed = label.trim().toLowerCase();
  if (!trimmed) return "fuentes";
  if (trimmed.endsWith("s")) return trimmed;
  return /[aeiou]$/i.test(trimmed) ? `${trimmed}s` : `${trimmed}es`;
};

export const GenerateLinksConfirmModal: React.FC<
  GenerateLinksConfirmModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  isFlexible = false,
  flexibleSourceLabel = "fuente",
}) => {
  const scopeText = isFlexible
    ? `todos los ${pluralizeSpanish(flexibleSourceLabel)} de los elementos aprobados`
    : "todas las evidencias de los criterios aprobados";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar enlaces públicos"
      size="md"
      variant="warning"
      showConfirm
      confirmLabel="Sí, generar"
      onConfirm={onConfirm}
      confirmLoading={isLoading}
      showCancel
      cancelLabel="Cancelar"
    >
      <p
        className={cn(TYPOGRAPHY.modal.body, "text-gris-una-2 leading-relaxed")}
      >
        ¿Está seguro que desea generar enlaces públicos para{" "}
        <strong className="text-negro-una">{scopeText}</strong>? Esta acción
        puede tardar un momento.
      </p>
    </Modal>
  );
};
