import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ScreenContainer, PageHeader, Tooltip, TooltipTrigger, TooltipContent } from "@/Components/Ui/Index";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { Button } from "@/Components/Ui/Buttons/Button";
import { Input, Textarea } from "@/Components/Ui/Index";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { BADGE_COLORS } from "@/Constants/StatusBadges";
import { ICON_SIZES, TABLE_COLUMN_WIDTHS } from "@/Constants/Components";
import { cn } from "@/Utils/ClassNames";
import { formatDate } from "@/Utils/DateUtils";
import { useToast } from "@/Context/ToastContext";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/Constants/ROUTES";
import { Card } from "@/Components/Ui/Layout/Card";
import { DropZone } from "@/Components/Ui/Upload/DropZone";
import { FileUploadProgress } from "@/Components/Ui/Upload/FileUploadProgress";
import type { FileUploadProgressItem } from "@/Components/Ui/Upload/FileUploadProgress";
import { DataTable } from "@/Components/Ui/Table/DataTable";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import { TABLE_ACTION_BUTTON } from "@/Constants/Components";
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { Modal } from "@/Components/Ui/Modals/Modal";
import { DeleteConfirmationModal } from "@/Components/Ui/Modals/DeleteConfirmationModal";
import { DatePicker } from "@/Components/Ui/Calendar/DatePicker";
import { RadioGroupCards } from "@/Components/Ui/Forms/RadioGroupCards";
import type { RadioCardOption } from "@/Components/Ui/Forms/RadioGroupCards";
import { useOperationalContextSnapshot } from "@/Hooks/useOperationalContextSnapshot";
import { fetchAdminReports, fetchReportByCycle, publishReport, unpublishReport, updateReport, deleteReport } from "@/Services/AccreditationReportService";
import type { AccreditationReportApi } from "@/Types/AccreditationReportTypes";

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface ResolucionArchivo {
  id: string;
  nombre_original: string;
  tamanio: number;
  url: string;
}

interface Resolucion {
  id: string;
  numero_resolucion: string;
  estado: "publicado" | "despublicado";
  fecha_publicacion: string;
  vigencia_inicio: string;
  vigencia_fin: string;
  esta_vigente: boolean;
  esta_acreditada: boolean;
  observaciones: string | null;
  archivo: ResolucionArchivo;
  publicado_por: { id: number; nombre: string };
  publicado_at: string;
}

// ─── Tipos informe ───────────────────────────────────────────────────────────

interface VersionInforme {
  id: number;
  descripcion: string;
  archivo_nombre: string;
  archivo_size: string;
  publicado_por: string;
  publicado_en: string;
  activa: boolean;
}

type VersionInformeRow = VersionInforme & Record<string, unknown>;

interface InformeFormData {
  descripcion: string;
  archivo: File | null;
}

const EMPTY_INFORME_FORM: InformeFormData = {
  descripcion: "",
  archivo: null,
};

// DataTable requiere T extends Record<string, unknown>
type ResolucionRow = Resolucion & Record<string, unknown>;

// ─── Mapeo API → tipo local ──────────────────────────────────────────────────

function mapApiToResolucion(api: AccreditationReportApi): Resolucion {
  return {
    id: String(api.informe_acreditacion_id),
    numero_resolucion: api.numero_resolucion,
    estado: api.estado,
    fecha_publicacion: api.fecha_publicacion ?? api.fecha_resolucion,
    vigencia_inicio: api.vigencia_desde,
    vigencia_fin: api.vigencia_hasta,
    esta_vigente: api.is_vigente,
    esta_acreditada: api.esta_acreditada,
    observaciones: api.observaciones,
    archivo: {
      id: String(api.archivo?.archivo_id ?? ""),
      nombre_original: api.archivo?.nombre_original ?? "",
      tamanio: api.archivo?.tamanio ?? 0,
      url: api.archivo?.url_publica ?? "#",
    },
    publicado_por: {
      id: api.publicado_por?.usuario_id ?? 0,
      nombre: api.publicado_por?.nombre ?? "",
    },
    publicado_at: api.fecha_publicacion ?? new Date().toISOString(),
  };
}

// ─── Mock publicación de informe ─────────────────────────────────────────────

const MOCK_VERSIONES_INFORME: VersionInforme[] = [
  {
    id: 1,
    descripcion: "Publicación inicial del informe final institucional",
    archivo_nombre: "informe_final_institucional_2026.pdf",
    archivo_size: "3.4 MB",
    publicado_por: "José Jara Arias",
    publicado_en: "2026-04-10T14:30:00",
    activa: true,
  },
  {
    id: 2,
    descripcion: "Actualización de criterios de la dimensión 3",
    archivo_nombre: "informe_final_institucional_v2_2026.pdf",
    archivo_size: "3.6 MB",
    publicado_por: "Cristina Zúñiga Cárdenas",
    publicado_en: "2026-03-01T10:00:00",
    activa: false,
  },
];

// ─── Modal de informe final ────────────────────────────────────────────────────

interface InformeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: VersionInforme | null;
  onSave: (data: InformeFormData) => void;
}

const InformeModal: React.FC<InformeModalProps> = ({ isOpen, onClose, initial, onSave }) => {
  const [form, setForm] = useState<InformeFormData>(EMPTY_INFORME_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? { descripcion: initial.descripcion, archivo: null }
          : EMPTY_INFORME_FORM,
      );
    }
  }, [isOpen, initial]);

  const archivoProgress: FileUploadProgressItem[] = useMemo(
    () => (form.archivo ? [{ file: form.archivo, status: "pending" as const, progress: 0 }] : []),
    [form.archivo],
  );

  const isEditing = initial != null;
  const isCompleto = isEditing ? true : form.archivo !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar versión" : "Publicar informe final"}
      subtitle="Informe Final Institucional"
      variant={isEditing ? "info" : "success"}
      size="lg"
      footerButtons={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!isCompleto} onClick={() => onSave(form)}>
            {isEditing ? "Guardar" : "Publicar"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="Descripción"
          placeholder="Ej: Publicación inicial del informe final 2026"
          value={form.descripcion}
          onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
        />

        <div>
          <p className={cn("font-medium text-negro-una-2 mb-2", TYPOGRAPHY.form.label)}>
            PDF del informe <span className="text-error-dark">*</span>
          </p>
          <DropZone
            onFilesSelected={(files) =>
              setForm((p) => ({
                ...p,
                archivo: files.find((f) => f.type === "application/pdf") ?? files[0] ?? null,
              }))
            }
            accept=".pdf"
            maxFiles={1}
            hint="Solo PDF · Máx. 50 MB"
          />
          {isEditing && !form.archivo && (
            <p className={cn("text-gris-una mt-2", TYPOGRAPHY.table.helper)}>
              Archivo actual: <span className="font-medium text-negro-una-2">{initial?.archivo_nombre}</span> · {initial?.archivo_size}. Deja el campo vacío para conservarlo.
            </p>
          )}
          {archivoProgress.length > 0 && (
            <FileUploadProgress
              files={archivoProgress}
              onCancel={() => setForm((p) => ({ ...p, archivo: null }))}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

// ─── Tipos y constantes del modal de resolución ────────────────────────────

interface ResolucionFormData {
  numero_resolucion: string;
  vigencia_inicio: string;
  vigencia_fin: string;
  esta_acreditada: boolean;
  observaciones: string;
  archivo: File | null;
}

const EMPTY_RESOLUCION_FORM: ResolucionFormData = {
  numero_resolucion: "",
  vigencia_inicio: "",
  vigencia_fin: "",
  esta_acreditada: true,
  observaciones: "",
  archivo: null,
};

const ACREDITADA_OPTIONS: RadioCardOption[] = [
  {
    value: "true",
    label: "Acreditada",
    description: "La carrera cumple con los estándares SINAES",
    icon: SystemIcons.interface.checkCircle({ size: "md", className: "text-verde-dark" }),
    iconBg: "bg-verde-ring",
  },
  {
    value: "false",
    label: "No acreditada",
    description: "La carrera no cumple con los estándares requeridos",
    icon: SystemIcons.auth.ShieldSlash({ size: "md", className: "text-error-dark" }),
    iconBg: "bg-error-ring",
  },
];

interface ResolucionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResolucionFormData) => void;
  isLoading?: boolean;
  initial?: Resolucion | null;
}

const ResolucionModal: React.FC<ResolucionModalProps> = ({ isOpen, onClose, onSave, isLoading, initial }) => {
  const [form, setForm] = useState<ResolucionFormData>(EMPTY_RESOLUCION_FORM);
  const isEditing = initial != null;

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? {
              numero_resolucion: initial.numero_resolucion,
              vigencia_inicio: initial.vigencia_inicio,
              vigencia_fin: initial.vigencia_fin,
              esta_acreditada: initial.esta_acreditada,
              observaciones: initial.observaciones ?? "",
              archivo: null,
            }
          : EMPTY_RESOLUCION_FORM
      );
    }
  }, [isOpen, initial]);

  const archivoProgress: FileUploadProgressItem[] = useMemo(
    () => (form.archivo ? [{ file: form.archivo, status: "pending" as const, progress: 0 }] : []),
    [form.archivo],
  );

  const isCompleto = isEditing
    ? form.numero_resolucion.trim() !== "" && form.vigencia_inicio !== "" && form.vigencia_fin !== ""
    : form.numero_resolucion.trim() !== "" &&
      form.vigencia_inicio !== "" &&
      form.vigencia_fin !== "" &&
      form.archivo !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar resolución" : "Nueva resolución"}
      subtitle="Resolución SINAES"
      variant={isEditing ? "info" : "success"}
      size="lg"
      footerButtons={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!isCompleto || isLoading} isLoading={isLoading} onClick={() => onSave(form)}>
            {isEditing ? "Guardar" : "Publicar"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="Número de resolución"
          placeholder="Ej: R-022-2026"
          value={form.numero_resolucion}
          onChange={(e) => setForm((p) => ({ ...p, numero_resolucion: e.target.value }))}
          maxLength={100}
          characterCount
          required
        />

        <RadioGroupCards
          name="esta_acreditada"
          label="Resultado de acreditación"
          value={String(form.esta_acreditada)}
          onChange={(v) => setForm((p) => ({ ...p, esta_acreditada: v === "true" }))}
          options={ACREDITADA_OPTIONS}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label="Vigencia desde"
            value={form.vigencia_inicio}
            onChange={(d) => setForm((p) => ({ ...p, vigencia_inicio: d }))}
            required
          />
          <DatePicker
            label="Vigencia hasta"
            value={form.vigencia_fin}
            minDate={form.vigencia_inicio || undefined}
            onChange={(d) => setForm((p) => ({ ...p, vigencia_fin: d }))}
            required
          />
        </div>

        <Textarea
          label="Observaciones"
          placeholder="Ej: Informe aprobado en sesión ordinaria del 20 de mayo."
          value={form.observaciones}
          onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
          maxLength={1000}
          characterCount
          rows={3}
        />

        <div>
          <p className={cn("font-medium text-negro-una-2 mb-2", TYPOGRAPHY.form.label)}>
            PDF de la resolución <span className="text-error-dark">*</span>
          </p>
          <DropZone
            onFilesSelected={(files) =>
              setForm((p) => ({
                ...p,
                archivo: files.find((f) => f.type === "application/pdf") ?? files[0] ?? null,
              }))
            }
            accept=".pdf"
            maxFiles={1}
            hint="Solo PDF oficial · Máx. 20 MB"
          />
          {isEditing && !form.archivo && (
            <p className={cn("text-gris-una mt-2", TYPOGRAPHY.table.helper)}>
              Archivo actual: <span className="font-medium text-negro-una-2">{initial?.archivo.nombre_original}</span>. Deja el campo vacío para conservarlo.
            </p>
          )}
          {archivoProgress.length > 0 && (
            <FileUploadProgress
              files={archivoProgress}
              onCancel={() => setForm((p) => ({ ...p, archivo: null }))}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

// ─── Modal de despublicación ─────────────────────────────────────────────────

interface DespublicarModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolucion: Resolucion | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DespublicarModal: React.FC<DespublicarModalProps> = ({ isOpen, onClose, resolucion, onConfirm, isLoading }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ocultar resolución"
      subtitle={resolucion ? `Nº ${resolucion.numero_resolucion}` : undefined}
      variant="warning"
      size="md"
      footerButtons={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="warning" isLoading={isLoading} onClick={onConfirm}>
            Sí, ocultar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className={cn("text-negro-una-2", TYPOGRAPHY.body)}>
          ¿Está seguro que desea ocultar esta resolución?
        </p>
        {resolucion?.esta_vigente && (
          <div className="flex items-start gap-2 p-3 bg-warning-ring/30 border border-warning/40 rounded-lg">
            <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.sm, "text-warning-dark shrink-0 mt-0.5")} />
            <p className={cn("text-warning-dark", TYPOGRAPHY.table.helper)}>
              Esta es la resolución actualmente vigente. Al ocultarla la carrera quedará sin resolución activa.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

const TABS = ["Resolución SINAES", "Informe Final Institucional"] as const;
type Tab = (typeof TABS)[number];

export const AccreditationReportAdminPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const moduleInfo = getModuleInfo("accreditation_report_admin");
  const [activeTab, setActiveTab] = useState<Tab>("Resolución SINAES");
  const { cycleId, careerCampusId } = useOperationalContextSnapshot();
  const historialErrorToastShownRef = useRef(false);

  // ─ Estado historial de resoluciones ─
  const [historial, setHistorial] = useState<Resolucion[]>([]);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);
  const [isSavingResolucion, setIsSavingResolucion] = useState(false);
  const [isDespublicando, setIsDespublicando] = useState(false);
  const [selectedCycleHasReport, setSelectedCycleHasReport] = useState(false);

  const loadHistorial = useCallback(async () => {
    if (!careerCampusId) {
      setHistorial([]);
      setIsLoadingHistorial(false);
      historialErrorToastShownRef.current = false;
      return;
    }

    setIsLoadingHistorial(true);
    try {
      const res = await fetchAdminReports(
        { carrera_campus_id: careerCampusId, include_unpublished: true }
      );
      setHistorial(res.data.map(mapApiToResolucion));
      historialErrorToastShownRef.current = false;
    } catch {
      if (!historialErrorToastShownRef.current) {
        showToast({ type: "error", title: "Error", message: "No se pudo cargar el historial de resoluciones." });
        historialErrorToastShownRef.current = true;
      }
    } finally {
      setIsLoadingHistorial(false);
    }
  }, [careerCampusId, showToast]);

  const loadSelectedCycleReport = useCallback(async () => {
    if (!cycleId) {
      setSelectedCycleHasReport(false);
      return;
    }

    try {
      const report = await fetchReportByCycle(cycleId);
      setSelectedCycleHasReport(report !== null);
    } catch {
      setSelectedCycleHasReport(false);
    }
  }, [cycleId]);

  useEffect(() => {
    historialErrorToastShownRef.current = false;
  }, [careerCampusId]);

  useEffect(() => {
    loadHistorial();
  }, [loadHistorial]);

  useEffect(() => {
    void loadSelectedCycleReport();
  }, [loadSelectedCycleReport]);

  // ─ Estado informe final ─
  const [versiones, setVersiones] = useState<VersionInforme[]>(MOCK_VERSIONES_INFORME);
  const [showInformeModal, setShowInformeModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<VersionInforme | null>(null);
  const [deletingVersion, setDeletingVersion] = useState<VersionInforme | null>(null);

  // ─ Estado modales de resolución ─
  const [showResolucionModal, setShowResolucionModal] = useState(false);
  const [editingResolucion, setEditingResolucion] = useState<Resolucion | null>(null);
  const [deletingResolucion, setDeletingResolucion] = useState<Resolucion | null>(null);
  const [isEditingResolucion, setIsEditingResolucion] = useState(false);
  const [isDeletingResolucion, setIsDeletingResolucion] = useState(false);
  const [despublicandoResolucion, setDespublicandoResolucion] = useState<Resolucion | null>(null);

  const handleEditResolucion = async (data: ResolucionFormData) => {
    if (!editingResolucion) return;
    setIsEditingResolucion(true);
    try {
      await updateReport(Number(editingResolucion.id), {
        archivo: data.archivo ?? undefined,
        numero_resolucion: data.numero_resolucion,
        vigencia_desde: data.vigencia_inicio,
        vigencia_hasta: data.vigencia_fin,
        esta_acreditada: data.esta_acreditada,
        observaciones: data.observaciones || undefined,
      });
      showToast({ type: "success", title: "Resolución actualizada", message: `La resolución Nº ${data.numero_resolucion} fue actualizada correctamente.` });
      setEditingResolucion(null);
      await loadHistorial();
    } catch (err) {
      const response = (err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } })?.response;
      const status = response?.status ?? 0;
      const detail = status === 422
        ? (response?.data?.errors ? Object.values(response.data.errors).flat().join(' ') : response?.data?.message ?? "Verificá los datos.")
        : "No se pudo actualizar la resolución. Inténtelo de nuevo.";
      showToast({ type: "error", title: "Error al editar", message: detail });
    } finally {
      setIsEditingResolucion(false);
    }
  };

  const handleDeleteResolucion = async () => {
    if (!deletingResolucion) return;
    setIsDeletingResolucion(true);
    try {
      await deleteReport(Number(deletingResolucion.id));
      showToast({ type: "success", title: "Resolución eliminada", message: `La resolución Nº ${deletingResolucion.numero_resolucion} fue eliminada del sistema.` });
      setDeletingResolucion(null);
      await loadHistorial();
    } catch {
      showToast({ type: "error", title: "Error al eliminar", message: "No se pudo eliminar la resolución." });
    } finally {
      setIsDeletingResolucion(false);
    }
  };

  const handleSaveResolucion = async (data: ResolucionFormData) => {
    if (!cycleId || !data.archivo) return;
    setIsSavingResolucion(true);
    try {
      await publishReport(cycleId, {
        archivo: data.archivo,
        numero_resolucion: data.numero_resolucion,
        vigencia_desde: data.vigencia_inicio,
        vigencia_hasta: data.vigencia_fin,
        esta_acreditada: data.esta_acreditada,
        observaciones: data.observaciones || undefined,
      });
      showToast({ type: "success", title: "Resolución publicada", message: `La resolución Nº ${data.numero_resolucion} fue publicada correctamente.` });
      setShowResolucionModal(false);
      await loadHistorial();
    } catch (err) {
      const response = (err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } })?.response;
      const status = response?.status ?? 0;
      let detail: string;
      if (status === 422 && response?.data?.errors) {
        detail = Object.values(response.data.errors).flat().join(' ');
      } else if (status === 422 && response?.data?.message) {
        detail = response.data.message;
      } else if (status === 404) {
        detail = "No se encontró el ciclo de acreditación. Verifique que el contexto operacional esté configurado correctamente.";
      } else {
        detail = "No se pudo publicar la resolución. Inténtelo de nuevo más tarde.";
      }
      showToast({ type: "error", title: "Error al publicar", message: detail });
    } finally {
      setIsSavingResolucion(false);
    }
  };

  const handleDespublicarResolucion = async () => {
    if (!despublicandoResolucion) return;
    setIsDespublicando(true);
    try {
      await unpublishReport(Number(despublicandoResolucion.id));
      showToast({ type: "success", title: "Resolución ocultada", message: `La resolución Nº ${despublicandoResolucion.numero_resolucion} fue ocultada.` });
      setDespublicandoResolucion(null);
      await loadHistorial();
    } catch {
      showToast({ type: "error", title: "Error al ocultar", message: "No se pudo ocultar la resolución." });
    } finally {
      setIsDespublicando(false);
    }
  };

  const handleSaveInforme = (data: InformeFormData) => {
    if (editingVersion) {
      setVersiones((prev) =>
        prev.map((v) =>
          v.id === editingVersion.id
            ? {
                ...v,
                descripcion: data.descripcion,
                ...(data.archivo
                  ? {
                      archivo_nombre: data.archivo.name,
                      archivo_size: `${(data.archivo.size / 1024 / 1024).toFixed(1)} MB`,
                    }
                  : {}),
              }
            : v,
        ),
      );
      showToast({
        type: "success",
        title: "Versión actualizada",
        message: "Los cambios fueron guardados correctamente.",
      });
    } else {
      const nueva: VersionInforme = {
        id: Date.now(),
        descripcion: data.descripcion,
        archivo_nombre: data.archivo?.name ?? "informe.pdf",
        archivo_size: data.archivo ? `${(data.archivo.size / 1024 / 1024).toFixed(1)} MB` : "—",
        publicado_por: "Usuario actual",
        publicado_en: new Date().toISOString(),
        activa: true,
      };
      setVersiones((prev) => [nueva, ...prev.map((v) => ({ ...v, activa: false }))]);
      showToast({
        type: "success",
        title: "Informe publicado",
        message: "El informe final institucional fue publicado correctamente.",
      });
    }
    setShowInformeModal(false);
    setEditingVersion(null);
  };

  const handleDeleteVersion = () => {
    if (!deletingVersion) return;
    setVersiones((prev) => prev.filter((v) => v.id !== deletingVersion.id));
    showToast({
      type: "success",
      title: "Versión eliminada",
      message: `La versión "${deletingVersion.descripcion}" fue eliminada.`,
    });
    setDeletingVersion(null);
  };

  const firstColumn = useFirstColumnConfig();
  const createResolutionDisabled = !cycleId || selectedCycleHasReport;
  const createResolutionTooltip = !cycleId
    ? "Seleccione un ciclo de acreditación para publicar una resolución"
    : selectedCycleHasReport
      ? "El ciclo seleccionado ya tiene una resolución registrada. Ocultarla no libera el ciclo; para continuar, edítela o elimínela."
      : "Publicar nueva resolución SINAES";

  // ─ Columnas historial ─────────────────────────────────────────────────────
  const historialColumns = useMemo<DataTableColumn<ResolucionRow>[]>(() => [
    {
      key: "numero_resolucion",
      header: "Resolución",
      align: "left",
      width: firstColumn.width,
      render: (_, r) => (
        <div className="flex flex-col">
          <span className={cn("font-bold text-negro-una-2", TYPOGRAPHY.table.cell)}>
            Nº {r.numero_resolucion}
          </span>
          <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>
            {r.archivo.nombre_original} · {(r.archivo.tamanio / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
      ),
    },
    {
      key: "publicado",
      header: "Publicado por",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, r) => (
        <div className="flex flex-col gap-0.5">
          <span className={cn("font-semibold text-negro-una-2", TYPOGRAPHY.table.helper)}>{r.publicado_por.nombre}</span>
          <span className={cn("text-gris-una", TYPOGRAPHY.table.helper)}>{formatDate(r.publicado_at)}</span>
        </div>
      ),
    },
    {
      key: "vigencia",
      header: "Vigencia",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, r) => (
        <div className="flex flex-col gap-0.5">
          <span className={cn("text-gris-una", TYPOGRAPHY.table.helper)}>{formatDate(r.vigencia_inicio)}</span>
          <span className={cn("text-gris-una", TYPOGRAPHY.table.helper)}>{formatDate(r.vigencia_fin)}</span>
        </div>
      ),
    },
    {
      key: "acreditacion",
      header: "Acreditación",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, r) => (
        <StatusBadge
          label={r.esta_acreditada ? "Acreditada" : "No acreditada"}
          colorClasses={r.esta_acreditada ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.error.colorClasses}
        />
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, r) => (
        <StatusBadge
          label={r.estado === "publicado" ? "Publicado" : "Oculto"}
          colorClasses={
            r.estado === "publicado"
              ? BADGE_COLORS.verde.colorClasses
              : BADGE_COLORS.warning.colorClasses
          }
        />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      width: TABLE_COLUMN_WIDTHS.actions,
      render: (_, r) => (
        <div className="flex items-center justify-center gap-1">
          <TableActionButton
            action="view"
            tooltip="Ver PDF"
            onClick={() => window.open(r.archivo.url, "_blank")}
          />
          <TableActionButton
            action="custom"
            customIcon={SystemIcons.actions.download({ className: TABLE_ACTION_BUTTON.icon })}
            customVariant="tablePower"
            tooltip="Descargar PDF"
            onClick={() => {}}
          />
          <TableActionButton
            action="edit"
            tooltip="Editar"
            onClick={() => setEditingResolucion(r as Resolucion)}
          />
          <TableActionButton
            action="power"
            tooltip="Ocultar"
            onClick={() => setDespublicandoResolucion(r as Resolucion)}
          />
          <TableActionButton
            action="delete"
            tooltip="Eliminar"
            onClick={() => setDeletingResolucion(r as Resolucion)}
          />
        </div>
      ),
    },
  ], [firstColumn.width]);

  // ─ Columnas versiones de informe ──────────────────────────────────────────
  const versionesColumns = useMemo<DataTableColumn<VersionInformeRow>[]>(() => [
    {
      key: "descripcion",
      header: "Descripción",
      align: "left",
      width: firstColumn.width,
      render: (_, v) => (
        <div className="flex flex-col">
          <span className={cn("font-bold text-negro-una-2", TYPOGRAPHY.table.cell)}>{v.descripcion}</span>
          <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>{v.archivo_nombre} · {v.archivo_size}</p>
        </div>
      ),
    },
    {
      key: "publicado",
      header: "Publicado por",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, v) => (
        <div className="flex flex-col gap-0.5">
          <span className={cn("font-semibold text-negro-una-2", TYPOGRAPHY.table.helper)}>{v.publicado_por}</span>
          <span className={cn("text-gris-una", TYPOGRAPHY.table.helper)}>{formatDate(v.publicado_en)}</span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, v) => (
        <StatusBadge
          label={v.activa ? "Activa" : "Archivada"}
          colorClasses={v.activa ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.gris.colorClasses}
        />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      width: TABLE_COLUMN_WIDTHS.actionsLarge,
      render: (_, v) => (
        <div className="flex items-center justify-center gap-1">
          <TableActionButton
            action="view"
            tooltip="Ver PDF"
            onClick={() => window.open("#", "_blank")}
          />
          <TableActionButton
            action="custom"
            customIcon={SystemIcons.actions.download({ className: TABLE_ACTION_BUTTON.icon })}
            customVariant="tablePower"
            tooltip="Descargar PDF"
            onClick={() => {}}
          />
          <TableActionButton
            action="edit"
            tooltip="Editar"
            onClick={() => {
              setEditingVersion(v as VersionInforme);
              setShowInformeModal(true);
            }}
          />
          <TableActionButton
            action="delete"
            tooltip="Eliminar"
            onClick={() => setDeletingVersion(v as VersionInforme)}
          />
        </div>
      ),
    },
  ], []);

  return (
    <ScreenContainer variant="full-width">
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
        headerExtra={
          <div className="flex items-center gap-2">
            {activeTab === "Resolución SINAES" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={createResolutionDisabled ? 0 : undefined}>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={createResolutionDisabled}
                      onClick={() => setShowResolucionModal(true)}
                    >
                      Crear
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {createResolutionTooltip}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowInformeModal(true)}
                  >
                    Crear
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Publicar nueva versión del informe</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.REPORTS_PUBLIC)}
                >
                  <SystemIcons.actions.view className={ICON_SIZES.md} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Ver vista pública</p>
              </TooltipContent>
            </Tooltip>
          </div>
        }
      />

      {/* ─ Tabs ─ */}
      <div className="flex border-b border-gris-light mb-6 gap-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab
                ? "border-rojo-una-2 text-rojo-una-2"
                : "border-transparent text-gris-una hover:text-negro-una-2",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ──────────── Tab: Resolución SINAES ──────────── */}
      {activeTab === "Resolución SINAES" && (
        <div className="space-y-6">

          {cycleId && selectedCycleHasReport && (
            <div className="rounded-lg border border-warning-ring bg-warning-light px-4 py-3">
              <p className={cn("text-warning-dark", TYPOGRAPHY.table.helper)}>
                El ciclo seleccionado ya tiene una resolución registrada. Ocultarla solo la quita de la vista pública; para continuar, edite o elimine la existente.
              </p>
            </div>
          )}

          {/* Historial de resoluciones */}
          <Card>
            <p className={cn("uppercase tracking-wider font-semibold text-gris-una px-4 pt-4 mb-4", TYPOGRAPHY.table.helper)}>
              Historial de resoluciones registradas
            </p>
            <DataTable<ResolucionRow>
              data={historial as ResolucionRow[]}
              columns={historialColumns}
              searchable={false}
              emptyMessage={
                !careerCampusId
                  ? "Seleccione una carrera y sede para ver el historial."
                  : isLoadingHistorial
                    ? "Cargando resoluciones..."
                    : "Sin resoluciones registradas."
              }
              unstyled
            />
          </Card>
        </div>
      )}

      {/* ──────────── Tab: Informe Final Institucional ──────────── */}
      {activeTab === "Informe Final Institucional" && (
        <div className="space-y-6">

          {/* Tabla de versiones */}
          <Card>
            <p className={cn("uppercase tracking-wider font-semibold text-gris-una px-4 pt-4 mb-4", TYPOGRAPHY.table.helper)}>
              Versiones publicadas
            </p>
            <DataTable<VersionInformeRow>
              data={versiones as VersionInformeRow[]}
              columns={versionesColumns}
              searchable={false}
              emptyMessage="Sin versiones publicadas."
              unstyled
            />
          </Card>
        </div>
      )}

      {/* ──────────── Modal: Publicar Resolución ──────────── */}
      <ResolucionModal
        isOpen={showResolucionModal}
        onClose={() => setShowResolucionModal(false)}
        onSave={handleSaveResolucion}
        isLoading={isSavingResolucion}
      />

      {/* ──────────── Modal: Editar Resolución ──────────── */}
      <ResolucionModal
        isOpen={editingResolucion !== null}
        onClose={() => setEditingResolucion(null)}
        onSave={handleEditResolucion}
        isLoading={isEditingResolucion}
        initial={editingResolucion}
      />

      {/* ──────────── Modal: Eliminar Resolución ──────────── */}
      <DeleteConfirmationModal
        isOpen={deletingResolucion !== null}
        onClose={() => setDeletingResolucion(null)}
        onConfirm={handleDeleteResolucion}
        title="Eliminar resolución"
        itemName={deletingResolucion?.numero_resolucion ?? ""}
        confirmLabel="Sí, eliminar"
        variant="danger"
        isLoading={isDeletingResolucion}
        footerMeta="Esta acción eliminará permanentemente la resolución y su PDF del sistema."
      />

      {/* ──────────── Modal: Ocultar Resolución ──────────── */}
      <DespublicarModal
        isOpen={despublicandoResolucion !== null}
        onClose={() => setDespublicandoResolucion(null)}
        resolucion={despublicandoResolucion}
        onConfirm={handleDespublicarResolucion}
        isLoading={isDespublicando}
      />

      {/* ──────────── Modal: Publicar informe final ──────────── */}
      <InformeModal
        isOpen={showInformeModal}
        onClose={() => {
          setShowInformeModal(false);
          setEditingVersion(null);
        }}
        initial={editingVersion}
        onSave={handleSaveInforme}
      />

      {/* ──────────── Modal: Eliminar versión de informe ──────────── */}
      <DeleteConfirmationModal
        isOpen={deletingVersion !== null}
        onClose={() => setDeletingVersion(null)}
        onConfirm={handleDeleteVersion}
        title="Eliminar versión"
        itemName={deletingVersion?.descripcion ?? ""}
        confirmLabel="Sí, eliminar"
        variant={deletingVersion?.activa ? "warning" : "danger"}
        footerMeta={
          deletingVersion?.activa
            ? "Esta es la versión activa. Al eliminarla, ninguna versión quedará publicada."
            : "Esta acción no se puede deshacer"
        }
      />
    </ScreenContainer>
  );
};

export default AccreditationReportAdminPage;
