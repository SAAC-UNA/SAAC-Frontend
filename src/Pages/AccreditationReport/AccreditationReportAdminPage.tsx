import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { fetchReports, publishReport, unpublishReport } from "@/Services/AccreditationReportService";
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
            {isEditing ? "Guardar cambios" : "Publicar"}
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
}

const ResolucionModal: React.FC<ResolucionModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [form, setForm] = useState<ResolucionFormData>(EMPTY_RESOLUCION_FORM);

  useEffect(() => {
    if (isOpen) setForm(EMPTY_RESOLUCION_FORM);
  }, [isOpen]);

  const archivoProgress: FileUploadProgressItem[] = useMemo(
    () => (form.archivo ? [{ file: form.archivo, status: "pending" as const, progress: 0 }] : []),
    [form.archivo],
  );

  const isCompleto =
    form.numero_resolucion.trim() !== "" &&
    form.vigencia_inicio !== "" &&
    form.vigencia_fin !== "" &&
    form.archivo !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva resolución"
      subtitle="Resolución SINAES"
      variant="success"
      size="lg"
      footerButtons={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!isCompleto || isLoading} isLoading={isLoading} onClick={() => onSave(form)}>
            Publicar
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
  onConfirm: (motivo: string) => void;
  isLoading?: boolean;
}

const DespublicarModal: React.FC<DespublicarModalProps> = ({ isOpen, onClose, resolucion, onConfirm, isLoading }) => {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (isOpen) setMotivo("");
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Despublicar resolución"
      subtitle={resolucion ? `Nº ${resolucion.numero_resolucion}` : undefined}
      variant="warning"
      size="md"
      footerButtons={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="warning" isLoading={isLoading} onClick={() => onConfirm(motivo)}>
            Sí, despublicar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {resolucion?.esta_vigente && (
          <div className="flex items-start gap-2 p-3 bg-warning-ring/30 border border-warning/40 rounded-lg">
            <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.sm, "text-warning-dark shrink-0 mt-0.5")} />
            <p className={cn("text-warning-dark", TYPOGRAPHY.table.helper)}>
              Esta es la resolución actualmente vigente. Al despublicarla la carrera quedará sin resolución activa.
            </p>
          </div>
        )}
        <Textarea
          label="Motivo (opcional)"
          placeholder="Ej: Se detectó un error en la resolución indicada."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={500}
          rows={3}
        />
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

  // ─ Estado historial de resoluciones ─
  const [historial, setHistorial] = useState<Resolucion[]>([]);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);
  const [isSavingResolucion, setIsSavingResolucion] = useState(false);
  const [isDespublicando, setIsDespublicando] = useState(false);

  const loadHistorial = useCallback(async () => {
    setIsLoadingHistorial(true);
    try {
      const res = await fetchReports(
        careerCampusId ? { carrera_campus_id: careerCampusId } : {}
      );
      setHistorial(res.data.map(mapApiToResolucion));
    } catch {
      showToast({ type: "error", title: "Error", message: "No se pudo cargar el historial de resoluciones." });
    } finally {
      setIsLoadingHistorial(false);
    }
  }, [careerCampusId, showToast]);

  useEffect(() => {
    loadHistorial();
  }, [loadHistorial]);

  // ─ Estado informe final ─
  const [versiones, setVersiones] = useState<VersionInforme[]>(MOCK_VERSIONES_INFORME);
  const [showInformeModal, setShowInformeModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<VersionInforme | null>(null);
  const [deletingVersion, setDeletingVersion] = useState<VersionInforme | null>(null);

  // ─ Estado modales de resolución ─
  const [showResolucionModal, setShowResolucionModal] = useState(false);
  const [despublicandoResolucion, setDespublicandoResolucion] = useState<Resolucion | null>(null);

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
    } catch {
      showToast({ type: "error", title: "Error al publicar", message: "No se pudo publicar la resolución. Verificá los datos e intentá de nuevo." });
    } finally {
      setIsSavingResolucion(false);
    }
  };

  const handleDespublicarResolucion = async (motivo: string) => {
    if (!despublicandoResolucion) return;
    setIsDespublicando(true);
    try {
      await unpublishReport(Number(despublicandoResolucion.id), motivo || undefined);
      showToast({ type: "success", title: "Resolución despublicada", message: `La resolución Nº ${despublicandoResolucion.numero_resolucion} fue despublicada.` });
      setDespublicandoResolucion(null);
      await loadHistorial();
    } catch {
      showToast({ type: "error", title: "Error al despublicar", message: "No se pudo despublicar la resolución." });
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
          label={r.esta_vigente ? "Vigente" : "Archivada"}
          colorClasses={r.esta_vigente ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.gris.colorClasses}
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
            action="delete"
            tooltip="Despublicar"
            onClick={() => setDespublicandoResolucion(r as Resolucion)}
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
                  <Button
                    variant="secondary"
                    size="sm"
                  onClick={() => setShowResolucionModal(true)}
                  >
                    Crear
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Publicar nueva resolución SINAES</TooltipContent>
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

          {/* Historial de resoluciones */}
          <Card>
            <p className={cn("uppercase tracking-wider font-semibold text-gris-una px-4 pt-4 mb-4", TYPOGRAPHY.table.helper)}>
              Historial de resoluciones publicadas
            </p>
            <DataTable<ResolucionRow>
              data={historial as ResolucionRow[]}
              columns={historialColumns}
              searchable={false}
              emptyMessage={isLoadingHistorial ? "Cargando resoluciones..." : "Sin resoluciones registradas."}
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

      {/* ──────────── Modal: Despublicar Resolución ──────────── */}
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
