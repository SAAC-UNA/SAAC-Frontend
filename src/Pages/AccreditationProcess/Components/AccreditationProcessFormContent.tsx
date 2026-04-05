import React, { useEffect, useMemo, useState } from "react";
import { CustomSelect } from "@/Components/Ui/Index";
import { DatePicker } from "@/Components/Ui/Calendar/DatePicker";
import type {
  AccreditationCycle,
  AccreditationProcess,
  AccreditationProcessFormData,
} from "@/Types/AccreditationProcessTypes";

interface AccreditationProcessFormContentProps {
  formRef?: React.RefObject<HTMLFormElement | null>;
  cycles: AccreditationCycle[];
  initialData?: AccreditationProcess;
  onSubmit: (data: AccreditationProcessFormData) => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
}

interface ValidationErrors {
  type?: string;
  accreditationCycleId?: string;
  startDate?: string;
  estimatedEndDate?: string;
}

const PROCESS_TYPE_OPTIONS = [
  { value: "Autoevaluación", label: "Autoevaluación" },
  { value: "Compromiso de mejora", label: "Compromiso de mejora" },
];

const STATUS_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

export const AccreditationProcessFormContent: React.FC<
  AccreditationProcessFormContentProps
> = ({ formRef, cycles, initialData, onSubmit, onHasChangesChange }) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<AccreditationProcessFormData>({
    type: initialData?.type || "",
    accreditationCycleId: initialData?.accreditationCycleId || "",
    status: initialData?.status || "activo",
    startDate: initialData?.startDate || "",
    estimatedEndDate: initialData?.estimatedEndDate || "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const cycleOptions = useMemo(
    () =>
      cycles.map((cycle) => {
        const careerCampus = [cycle.careerName, cycle.campusName]
          .filter(Boolean)
          .join(" - ");
        return {
          value: cycle.id,
          label: careerCampus ? `${cycle.name} (${careerCampus})` : cycle.name,
        };
      }),
    [cycles],
  );

  useEffect(() => {
    if (!isEditing) {
      onHasChangesChange?.(true);
      return;
    }

    const hasChanges =
      formData.type !== (initialData?.type || "") ||
      formData.accreditationCycleId !==
        (initialData?.accreditationCycleId || "") ||
      formData.status !== (initialData?.status || "activo") ||
      formData.startDate !== (initialData?.startDate || "") ||
      formData.estimatedEndDate !== (initialData?.estimatedEndDate || "");

    onHasChangesChange?.(hasChanges);
  }, [formData, initialData, isEditing, onHasChangesChange]);

  const validate = () => {
    const nextErrors: ValidationErrors = {};

    if (!formData.type) {
      nextErrors.type = "El tipo de proceso es obligatorio";
    }

    if (!formData.accreditationCycleId) {
      nextErrors.accreditationCycleId =
        "Debe seleccionar un ciclo de acreditación";
    }

    if (!formData.startDate) {
      nextErrors.startDate = "La fecha de inicio es obligatoria";
    }

    if (!formData.estimatedEndDate) {
      nextErrors.estimatedEndDate =
        "La fecha estimada de finalización es obligatoria";
    }

    if (
      formData.startDate &&
      formData.estimatedEndDate &&
      new Date(formData.estimatedEndDate) < new Date(formData.startDate)
    ) {
      nextErrors.estimatedEndDate =
        "La fecha estimada debe ser posterior o igual a la fecha de inicio";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFieldChange = <K extends keyof AccreditationProcessFormData>(
    key: K,
    value: AccreditationProcessFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <CustomSelect
          label="Ciclo de Acreditación"
          options={cycleOptions}
          value={formData.accreditationCycleId}
          onChange={(value) => handleFieldChange("accreditationCycleId", value)}
          placeholder="Seleccione un ciclo..."
          error={errors.accreditationCycleId}
          className="text-sidebar"
          required
        />

        <CustomSelect
          label="Tipo de Proceso"
          options={PROCESS_TYPE_OPTIONS}
          value={formData.type}
          onChange={(value) => handleFieldChange("type", value)}
          placeholder="Seleccione un tipo..."
          error={errors.type}
          className="text-sidebar"
          required
          disabled={isEditing}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <DatePicker
          label="Fecha de Inicio"
          value={formData.startDate}
          onChange={(value) => handleFieldChange("startDate", value)}
          error={errors.startDate}
          className="text-sidebar"
          required
        />

        <DatePicker
          label="Fecha Estimada de Finalización"
          value={formData.estimatedEndDate}
          onChange={(value) => handleFieldChange("estimatedEndDate", value)}
          error={errors.estimatedEndDate}
          minDate={formData.startDate || undefined}
          className="text-sidebar"
          required
        />
      </div>

      <CustomSelect
        label="Estado"
        options={STATUS_OPTIONS}
        value={formData.status}
        onChange={(value) =>
          handleFieldChange(
            "status",
            value as AccreditationProcessFormData["status"],
          )
        }
        placeholder="Seleccione estado..."
        className="text-sidebar"
        required
      />
    </form>
  );
};
