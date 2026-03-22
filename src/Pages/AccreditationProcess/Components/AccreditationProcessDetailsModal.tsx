import React from "react";
import { DetailsModal } from "@/Components/Ui/Modals/DetailsModal";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { cn } from "@/Utils/ClassNames";
import type { AccreditationProcess } from "@/Types/AccreditationProcessTypes";

interface AccreditationProcessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: AccreditationProcess | null;
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const Label: React.FC<{ text: string }> = ({ text }) => (
  <span
    className={cn(
      "uppercase tracking-wider font-medium text-gris-una-2 text-[11px]",
      TYPOGRAPHY.table.header,
    )}
  >
    {text}
  </span>
);

const Value: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className={cn(
      "text-negro-una-2 font-normal text-[13px]",
      TYPOGRAPHY.table.cell,
    )}
  >
    {children}
  </span>
);

export const AccreditationProcessDetailsModal: React.FC<
  AccreditationProcessDetailsModalProps
> = ({ isOpen, onClose, process }) => {
  if (!process) return null;

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={process.type}
      subtitle="Detalles del proceso de acreditación"
      variant="info"
      size="lg"
      maxHeight="lg"
    >
      <div className="flex flex-col gap-5">
        <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <Label text="Tipo de proceso" />
            <Value>{process.type}</Value>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label text="Estado" />
            <Value>{process.status === "activo" ? "Activo" : "Inactivo"}</Value>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label text="Ciclo de acreditación" />
            <Value>{process.accreditationCycleName}</Value>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label text="Carrera / Sede" />
            <Value>
              {process.careerName || "Sin carrera"}
              {process.campusName ? ` - ${process.campusName}` : ""}
            </Value>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label text="Fecha de inicio" />
            <Value>{formatDate(process.startDate)}</Value>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label text="Fecha estimada de finalización" />
            <Value>{formatDate(process.estimatedEndDate)}</Value>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label text="Creado" />
            <Value>{formatDate(process.createdAt)}</Value>
          </div>
        </div>
      </div>
    </DetailsModal>
  );
};
