/**
 * AccreditationCycleFormModal - Modal para crear o editar un Ciclo de Acreditación.
 *
 * Flujo: EntityFormModal → CreateConfirmationModal / EditConfirmationModal → SuccessModal
 */

import React, { useState, useEffect, useMemo } from "react";
import { EntityFormModal } from "@/Components/Ui/Modals/EntityFormModal";
import { CreateConfirmationModal } from "@/Components/Ui/Modals/CreateConfirmationModal";
import { EditConfirmationModal } from "@/Components/Ui/Modals/EditConfirmationModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { DatePicker } from "@/Components/Ui/Calendar/DatePicker";
import { CustomSelect } from "@/Components/Ui/Index";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { useToast } from "@/Context/ToastContext";
import { useCareerCampuses } from "@/Hooks/UseCareerCampuses";
import { useStructureModels } from "@/Hooks/UseStructureModels";
import { cn } from "@/Utils/ClassNames";
import type {
  AccreditationCycle,
  AccreditationCycleStatus,
  CreateAccreditationCycleForm,
  EditAccreditationCycleForm,
} from "@/Types/AccreditationCycleTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cycle?: AccreditationCycle | null;
  onConfirm: (
    form: CreateAccreditationCycleForm | EditAccreditationCycleForm,
  ) => Promise<{ success: boolean; error?: string }>;
}

interface FormData {
  carrera_sede_id: string;
  modelo_estructura_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: AccreditationCycleStatus;
}

interface FormErrors {
  carrera_sede_id?: string;
  modelo_estructura_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

const EMPTY: FormData = {
  carrera_sede_id: "",
  modelo_estructura_id: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "activo",
};

const STATUS_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "completado", label: "Completado" },
];
export const AccreditationCycleFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cycle,
  onConfirm,
}) => {
  const isEditing = !!cycle;
  const { showToast } = useToast();
  const { careerCampuses, isLoading: loadingCareers } = useCareerCampuses();
  const { models, isLoading: loadingModels } = useStructureModels();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [success, setSuccess] = useState({ isOpen: false, name: "" });

  useEffect(() => {
    if (isOpen) {
      setForm(
        cycle
          ? {
              carrera_sede_id: String(cycle.carrera_sede_id),
              modelo_estructura_id: String(cycle.modelo_estructura_id),
              fecha_inicio: cycle.fecha_inicio ?? "",
              fecha_fin: cycle.fecha_fin ?? "",
              estado: cycle.estado,
            }
          : EMPTY,
      );
      setErrors({});
      setConfirmOpen(false);
    }
  }, [isOpen, cycle]);

  const careerOptions = careerCampuses.map((cs) => ({
    value: String(cs.carrera_sede_id),
    label: `${cs.carrera_nombre} – ${cs.sede_nombre}`,
  }));

  const modelOptions = models
    .filter((m) => m.activo)
    .map((m) => ({ value: String(m.modelo_estructura_id), label: m.nombre }));

  const hasChanges = useMemo(() => {
    if (!isEditing || !cycle) return true;

    return (
      form.carrera_sede_id !== String(cycle.carrera_sede_id)
      || form.modelo_estructura_id !== String(cycle.modelo_estructura_id)
      || form.fecha_inicio !== (cycle.fecha_inicio ?? "")
      || form.fecha_fin !== (cycle.fecha_fin ?? "")
      || form.estado !== cycle.estado
    );
  }, [cycle, form, isEditing]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.carrera_sede_id) {
      next.carrera_sede_id = "Debe seleccionar una carrera-sede.";
    }
    if (!form.modelo_estructura_id) {
      next.modelo_estructura_id = "Debe seleccionar un modelo de estructura.";
    }
    if (!form.fecha_inicio) {
      next.fecha_inicio = "La fecha de inicio es obligatoria.";
    }
    if (!form.fecha_fin) {
      next.fecha_fin = "La fecha de fin es obligatoria.";
    } else if (form.fecha_inicio && form.fecha_fin < form.fecha_inicio) {
      next.fecha_fin =
        "La fecha de fin debe ser mayor o igual a la fecha de inicio.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const generatedCycleName = React.useMemo(() => {
    if (!form.fecha_inicio || !form.fecha_fin)
      return "Completa las fechas para generar el nombre";

    const startYear = Number(form.fecha_inicio.slice(0, 4));
    const endYear = Number(form.fecha_fin.slice(0, 4));

    if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
      return "Completa las fechas para generar el nombre";
    }

    return startYear === endYear
      ? `Ciclo ${startYear}`
      : `Ciclo ${startYear}-${endYear}`;
  }, [form.fecha_inicio, form.fecha_fin]);

  const generatedNameStyle = isEditing
    ? {
        container: "border-warning/25 bg-warning/10",
        text: "text-warning",
      }
    : {
        container: "border-verde/25 bg-verde/10",
        text: "text-verde",
      };

  const handleSubmitRequest = () => {
    if (isEditing && !hasChanges) return;
    if (validate()) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setOpLoading(true);
    const payload: CreateAccreditationCycleForm | EditAccreditationCycleForm =
      isEditing
        ? {
            carrera_sede_id: Number(form.carrera_sede_id),
            modelo_estructura_id: Number(form.modelo_estructura_id),
            fecha_inicio: form.fecha_inicio,
            fecha_fin: form.fecha_fin,
            estado: form.estado,
          }
        : {
            carrera_sede_id: Number(form.carrera_sede_id),
            modelo_estructura_id: Number(form.modelo_estructura_id),
            fecha_inicio: form.fecha_inicio,
            fecha_fin: form.fecha_fin,
          };

    const result = await onConfirm(payload);
    setOpLoading(false);
    setConfirmOpen(false);
    if (result.success) {
      setSuccess({ isOpen: true, name: generatedCycleName });
    } else {
      showToast({
        type: "error",
        title: result.error ?? "Error al guardar el ciclo",
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ isOpen: false, name: "" });
    onClose();
  };

  return (
    <>
      <EntityFormModal
        isOpen={isOpen && !confirmOpen && !success.isOpen}
        onClose={onClose}
        onConfirm={handleSubmitRequest}
        title={isEditing ? "Editar Ciclo" : "Crear Ciclo de Acreditación"}
        subtitle={isEditing ? cycle?.nombre : undefined}
        confirmLabel={isEditing ? "Guardar" : "Crear"}
        isEditing={isEditing}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              "rounded-corner border px-3 py-2",
              generatedNameStyle.container,
            )}
          >
            <p
              className={cn(
                TYPOGRAPHY.form.helper,
                "uppercase tracking-wide font-semibold",
                generatedNameStyle.text,
              )}
            >
              Nombre generado automaticamente
            </p>
            <p
              className={cn(
                "mt-1 font-semibold",
                TYPOGRAPHY.form.helper,
                generatedNameStyle.text,
              )}
            >
              {generatedCycleName}
            </p>
          </div>

          <CustomSelect
            label="Carrera – Sede"
            required
            value={form.carrera_sede_id}
            options={careerOptions}
            onChange={(v) => setForm((p) => ({ ...p, carrera_sede_id: v }))}
            error={errors.carrera_sede_id}
            disabled={loadingCareers}
            searchable
            searchPlaceholder="Buscar carrera-sede..."
            placeholder="Seleccione una carrera-sede"
          />

          <CustomSelect
            label="Modelo de Estructura"
            required
            value={form.modelo_estructura_id}
            options={modelOptions}
            onChange={(v) =>
              setForm((p) => ({ ...p, modelo_estructura_id: v }))
            }
            error={errors.modelo_estructura_id}
            disabled={loadingModels}
            searchable
            searchPlaceholder="Buscar modelo..."
            placeholder="Seleccione un modelo"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePicker
              label="Fecha de inicio"
              required
              value={form.fecha_inicio}
              onChange={(date) =>
                setForm((p) => {
                  const next = { ...p, fecha_inicio: date };
                  if (next.fecha_fin && date && next.fecha_fin < date) {
                    next.fecha_fin = "";
                  }
                  return next;
                })
              }
              maxDate={form.fecha_fin || undefined}
              error={errors.fecha_inicio}
            />

            <DatePicker
              label="Fecha de fin"
              required
              value={form.fecha_fin}
              onChange={(date) => setForm((p) => ({ ...p, fecha_fin: date }))}
              minDate={form.fecha_inicio || undefined}
              error={errors.fecha_fin}
            />
          </div>

          {isEditing && (
            <CustomSelect
              label="Estado"
              value={form.estado}
              options={STATUS_OPTIONS}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  estado: v as AccreditationCycleStatus,
                }))
              }
            />
          )}
        </div>
      </EntityFormModal>

      {isEditing ? (
        <EditConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          isLoading={opLoading}
          itemName={generatedCycleName}
        />
      ) : (
        <CreateConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          isLoading={opLoading}
          itemName={generatedCycleName}
        />
      )}

      <SuccessModal
        isOpen={success.isOpen}
        title={isEditing ? "Ciclo actualizado" : "Ciclo creado"}
        message={
          isEditing
            ? `El ciclo "${success.name}" fue actualizado correctamente.`
            : `El ciclo "${success.name}" fue creado correctamente.`
        }
        onClose={handleSuccessClose}
      />
    </>
  );
};
