/**
 * AccreditationCycleFormModal - Modal para crear o editar un Ciclo de Acreditación.
 *
 * Flujo: EntityFormModal → CreateConfirmationModal / EditConfirmationModal → SuccessModal
 *
 * Carrera y Sede se eligen por separado. Las opciones disponibles provienen de
 * useCareerCampuses(), que el backend ya filtra según las asignaciones del usuario
 * (Superusuario ve todos; otros roles solo sus carrera-sedes asignadas).
 * El carrera_sede_id se resuelve localmente desde los pares ya cargados.
 */

import React, { useState, useEffect, useMemo } from "react";
import { EntityFormModal } from "@/Components/Ui/Modals/EntityFormModal";
import { CreateConfirmationModal } from "@/Components/Ui/Modals/CreateConfirmationModal";
import { EditConfirmationModal } from "@/Components/Ui/Modals/EditConfirmationModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { CustomSelect } from "@/Components/Ui/Index";
import { YearRangePicker } from "@/Components/Ui/Calendar/YearRangePicker";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { useToast } from "@/Context/ToastContext";
import { useAuth } from "@/Context/AuthContext";
import { useCareerCampuses } from "@/Hooks/UseCareerCampuses";
import { useStructureModels } from "@/Hooks/UseStructureModels";
import { useCareers } from "@/Hooks/UseCareers";
import { useCampuses } from "@/Hooks/UseCampuses";
import { resolveOrCreateCareerCampus } from "@/Services/CareerService";
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
  carrera_id: string;
  sede_id: string;
  modelo_estructura_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: AccreditationCycleStatus;
}

interface FormErrors {
  carrera_id?: string;
  sede_id?: string;
  modelo_estructura_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

const EMPTY: FormData = {
  carrera_id: "",
  sede_id: "",
  modelo_estructura_id: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "activo",
};

const toYearValue = (value?: string | null): string => {
  if (!value) return "";
  return value.slice(0, 4);
};

export const AccreditationCycleFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cycle,
  onConfirm,
}) => {
  const isEditing = !!cycle;
  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const isSuperUser = hasRole("Superusuario");
  // useCareerCampuses ya filtra por asignaciones del usuario en el backend
  const { careerCampuses, isLoading: loadingPairs } = useCareerCampuses();
  // Para Superusuario: listas completas de carreras y sedes
  const { careers, isLoading: loadingAllCareers } = useCareers();
  const { campuses, isLoading: loadingAllCampuses } = useCampuses();
  const { models, isLoading: loadingModels } = useStructureModels();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [success, setSuccess] = useState({ isOpen: false, name: "" });

  // Para no-Superusuario: único par asignado disponible
  const singlePair = useMemo(
    () => (!isSuperUser && careerCampuses.length > 0 ? careerCampuses[0] : null),
    [isSuperUser, careerCampuses],
  );

  useEffect(() => {
    if (isOpen) {
      if (cycle) {
        setForm({
          carrera_id: String(cycle.carrera_sede?.carrera_id ?? ""),
          sede_id: String(cycle.carrera_sede?.sede_id ?? ""),
          modelo_estructura_id: String(cycle.modelo_estructura_id),
          fecha_inicio: toYearValue(cycle.fecha_inicio),
          fecha_fin: toYearValue(cycle.fecha_fin),
          estado: cycle.estado,
        });
      } else if (singlePair) {
        // Auto-seleccionar el par asignado para no-Superusuario
        setForm({ ...EMPTY, carrera_id: String(singlePair.carrera_id), sede_id: String(singlePair.sede_id) });
      } else {
        setForm(EMPTY);
      }
      setErrors({});
      setConfirmOpen(false);
    }
  }, [isOpen, cycle, singlePair]);

  // Carreras disponibles: Superusuario ve todas; otros las derivadas de sus pares
  const careerOptions = useMemo(() => {
    if (isSuperUser) {
      return careers
        .filter((c) => c.activo)
        .map((c) => ({ value: String(c.carrera_id), label: c.nombre }));
    }
    const seen = new Set<string>();
    return careerCampuses
      .filter((p) => {
        if (seen.has(String(p.carrera_id))) return false;
        seen.add(String(p.carrera_id));
        return true;
      })
      .map((p) => ({ value: String(p.carrera_id), label: p.carrera_nombre }));
  }, [isSuperUser, careers, careerCampuses]);

  // Sedes disponibles según el rol
  const campusOptions = useMemo(() => {
    if (!form.carrera_id) return [];
    if (isSuperUser) {
      // Mostrar todas las sedes; el backend valida al crear
      return campuses.map((s) => ({ value: String(s.sede_id), label: s.nombre }));
    }
    return careerCampuses
      .filter((p) => String(p.carrera_id) === form.carrera_id)
      .map((p) => ({ value: String(p.sede_id), label: p.sede_nombre }));
  }, [isSuperUser, form.carrera_id, campuses, careerCampuses]);

  // Carrera select: espera a que carguen las opciones
  // Sede select: solo espera a que se elija carrera (opciones cargan reactivamente)
  const loadingCareerSelect = loadingPairs || (isSuperUser && loadingAllCareers);
  const loadingCampusSelect = isSuperUser && loadingAllCampuses;

  const modelOptions = models
    .filter((m) => m.activo)
    .map((m) => ({ value: String(m.modelo_estructura_id), label: m.nombre }));

  const hasChanges = useMemo(() => {
    if (!isEditing || !cycle) return true;

    return (
      form.carrera_id !== String(cycle.carrera_sede?.carrera_id ?? "")
      || form.sede_id !== String(cycle.carrera_sede?.sede_id ?? "")
      || form.modelo_estructura_id !== String(cycle.modelo_estructura_id)
      || form.fecha_inicio !== toYearValue(cycle.fecha_inicio)
      || form.fecha_fin !== toYearValue(cycle.fecha_fin)
      || form.estado !== cycle.estado
    );
  }, [cycle, form, isEditing]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.carrera_id) {
      next.carrera_id = "Debe seleccionar una carrera.";
    }
    if (!form.sede_id) {
      next.sede_id = "Debe seleccionar una sede.";
    }
    if (!form.modelo_estructura_id) {
      next.modelo_estructura_id = "Debe seleccionar un modelo de estructura.";
    }
    if (!form.fecha_inicio) {
      next.fecha_inicio = "El año de inicio es obligatorio.";
    }
    if (!form.fecha_fin) {
      next.fecha_fin = "El año de fin es obligatorio.";
    } else if (form.fecha_inicio && Number(form.fecha_fin) < Number(form.fecha_inicio)) {
      next.fecha_fin =
        "El año de fin debe ser mayor o igual al año de inicio.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const generatedCycleName = React.useMemo(() => {
    if (!form.fecha_inicio || !form.fecha_fin)
      return "Complete los años para generar el nombre";

    const startYear = Number(form.fecha_inicio);
    const endYear = Number(form.fecha_fin);

    if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
      return "Complete los años para generar el nombre";
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

    // Resolver carrera_sede_id: buscar en pares cargados; si no existe (Superusuario con combo nueva), crear via API
    let carrera_sede_id: number | undefined;
    const pair = careerCampuses.find(
      (p) => String(p.carrera_id) === form.carrera_id && String(p.sede_id) === form.sede_id,
    );
    if (pair) {
      carrera_sede_id = pair.carrera_sede_id;
    } else if (isSuperUser) {
      try {
        carrera_sede_id = await resolveOrCreateCareerCampus(Number(form.carrera_id), Number(form.sede_id));
      } catch {
        setOpLoading(false);
        setConfirmOpen(false);
        showToast({ type: "error", title: "Error al resolver la combinación carrera-sede." });
        return;
      }
    }

    if (!carrera_sede_id) {
      setOpLoading(false);
      setConfirmOpen(false);
      showToast({ type: "error", title: "Combinación carrera-sede no encontrada." });
      return;
    }

    const payload: CreateAccreditationCycleForm | EditAccreditationCycleForm =
      isEditing
        ? {
            carrera_sede_id,
            modelo_estructura_id: Number(form.modelo_estructura_id),
            fecha_inicio: form.fecha_inicio,
            fecha_fin: form.fecha_fin,
            estado: form.estado,
          }
        : {
            carrera_sede_id,
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
                TYPOGRAPHY.modal.body,
                "uppercase tracking-wide font-semibold",
                generatedNameStyle.text,
              )}
            >
              Nombre generado automaticamente
            </p>
            <p
              className={cn(
                "mt-1 font-normal",
                TYPOGRAPHY.modal.body,
                generatedNameStyle.text,
              )}
            >
              {generatedCycleName}
            </p>
          </div>

          {isSuperUser ? (
            <>
              <CustomSelect
                label="Carrera"
                required
                value={form.carrera_id}
                options={careerOptions}
                onChange={(v) => {
                  setForm((p) => ({ ...p, carrera_id: v, sede_id: "" }));
                  if (errors.carrera_id) setErrors((p) => ({ ...p, carrera_id: undefined }));
                }}
                error={errors.carrera_id}
                disabled={loadingCareerSelect}
                searchable
                searchPlaceholder="Buscar carrera..."
                placeholder="Seleccione una carrera"
              />
              <CustomSelect
                label="Sede"
                required
                value={form.sede_id}
                options={campusOptions}
                onChange={(v) => {
                  setForm((p) => ({ ...p, sede_id: v }));
                  if (errors.sede_id) setErrors((p) => ({ ...p, sede_id: undefined }));
                }}
                error={errors.sede_id}
                disabled={loadingCampusSelect || !form.carrera_id}
                searchable
                searchPlaceholder="Buscar sede..."
                placeholder={form.carrera_id ? "Seleccione una sede" : "Primero seleccione una carrera"}
              />
            </>
          ) : (
            <div className="rounded-corner border border-gris-light bg-blanco-una-2 px-4 py-3 flex flex-col gap-1">
              <p className={cn(TYPOGRAPHY.form.label, "text-gris-una-2 mb-1")}>Carrera y Sede asignadas</p>
              {loadingPairs ? (
                <p className={cn(TYPOGRAPHY.body, "text-gris-una-2")}>Cargando...</p>
              ) : singlePair ? (
                <>
                  <p className={cn(TYPOGRAPHY.body, "font-semibold text-negro-una-2")}>
                    {singlePair.carrera_nombre}
                  </p>
                  <p className={cn(TYPOGRAPHY.body, "text-gris-una-2")}>
                    {singlePair.sede_nombre}
                  </p>
                </>
              ) : (
                <p className={cn(TYPOGRAPHY.body, "text-warning")}>Sin sede-carrera asignada.</p>
              )}
            </div>
          )}

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
          <YearRangePicker
            label="Periodo"
            required
            value={{ from: form.fecha_inicio, to: form.fecha_fin }}
            onChange={(range) =>
              setForm((p) => ({
                ...p,
                fecha_inicio: range.from ?? "",
                fecha_fin: range.to ?? "",
              }))
            }
            error={errors.fecha_inicio || errors.fecha_fin}
            placeholder="Seleccione el periodo"
          />
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
