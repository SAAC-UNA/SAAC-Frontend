import React, { useState, useMemo, useEffect } from "react";
import { ScreenContainer, PageHeader, Tooltip, TooltipTrigger, TooltipContent } from "@/Components/Ui/Index";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { Button } from "@/Components/Ui/Buttons/Button";
import { Input } from "@/Components/Ui/Index";
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
import { RadioGroupCards } from "@/Components/Ui/Forms/RadioGroupCards";
import type { RadioCardOption } from "@/Components/Ui/Forms/RadioGroupCards";
import { DatePicker } from "@/Components/Ui/Calendar/DatePicker";

// ─── Tipos ─────────────────────────────────────────────────────────────────

type EstadoAcreditacion = "acreditada" | "no_acreditada";

interface Resolucion {
  id: number;
  numero: string;
  estado: EstadoAcreditacion;
  vigencia_inicio: string;
  vigencia_fin: string;
  archivo_nombre: string;
  archivo_size: string;
  publicado_por: string;
  publicado_en: string;
  activa: boolean;
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

// ─── Datos mock ─────────────────────────────────────────────────────────────

const MOCK_HISTORIAL: Resolucion[] = [
  {
    id: 1,
    numero: "R-021-2026",
    estado: "acreditada",
    vigencia_inicio: "2026-01-01",
    vigencia_fin: "2030-12-31",
    archivo_nombre: "resolucion_sinaes_r021_2026.pdf",
    archivo_size: "1.2 MB",
    publicado_por: "José Jara Arias",
    publicado_en: "2026-04-10T09:14:00",
    activa: true,
  },
  {
    id: 2,
    numero: "R-004-2021",
    estado: "acreditada",
    vigencia_inicio: "2021-01-01",
    vigencia_fin: "2025-12-31",
    archivo_nombre: "resolucion_sinaes_r004_2021.pdf",
    archivo_size: "980 KB",
    publicado_por: "Cristina Zúñiga Cárdenas",
    publicado_en: "2021-01-03T08:00:00",
    activa: false,
  },
  {
    id: 3,
    numero: "R-117-2016",
    estado: "acreditada",
    vigencia_inicio: "2016-06-01",
    vigencia_fin: "2020-12-31",
    archivo_nombre: "resolucion_sinaes_r117_2016.pdf",
    archivo_size: "760 KB",
    publicado_por: "Naydelin Jirón Castellón",
    publicado_en: "2016-06-15T10:00:00",
    activa: false,
  },
];

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
  numero: string;
  estado: EstadoAcreditacion;
  vigencia_inicio: string;
  vigencia_fin: string;
  archivo: File | null;
}

const EMPTY_RESOLUCION_FORM: ResolucionFormData = {
  numero: "",
  estado: "acreditada",
  vigencia_inicio: "",
  vigencia_fin: "",
  archivo: null,
};

const ESTADO_OPTIONS: RadioCardOption[] = [
  {
    value: "acreditada",
    label: "Acreditada",
    description: "La carrera cumple con los estándares SINAES",
    icon: SystemIcons.interface.checkCircle({ size: "md", className: "text-verde-dark" }),
    iconBg: "bg-verde-ring",
  },
  {
    value: "no_acreditada",
    label: "No acreditada",
    description: "La carrera no cumple con los estándares requeridos",
    icon: SystemIcons.auth.ShieldSlash({ size: "md", className: "text-error-dark" }),
    iconBg: "bg-error-ring",
  },
];

interface ResolucionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: Resolucion | null;
  onSave: (data: ResolucionFormData) => void;
}

const ResolucionModal: React.FC<ResolucionModalProps> = ({ isOpen, onClose, initial, onSave }) => {
  const [form, setForm] = useState<ResolucionFormData>(EMPTY_RESOLUCION_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? {
              numero: initial.numero,
              estado: initial.estado,
              vigencia_inicio: initial.vigencia_inicio,
              vigencia_fin: initial.vigencia_fin,
              archivo: null,
            }
          : EMPTY_RESOLUCION_FORM,
      );
    }
  }, [isOpen, initial]);

  const archivoProgress: FileUploadProgressItem[] = useMemo(
    () => (form.archivo ? [{ file: form.archivo, status: "pending" as const, progress: 0 }] : []),
    [form.archivo],
  );

  const isCompleto =
    form.numero.trim() !== "" &&
    form.vigencia_inicio !== "" &&
    form.vigencia_fin !== "" &&
    (form.archivo !== null || initial != null);

  const isEditing = initial != null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar resolución" : "Nueva resolución"}
      subtitle="Resolución SINAES"
      variant="success"
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
          label="Número de resolución"
          placeholder="Ej: R-022-2026"
          value={form.numero}
          onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))}
          required
        />

        <RadioGroupCards
          name="estado_acreditacion"
          label="Estado de acreditación"
          value={form.estado}
          onChange={(v) => setForm((p) => ({ ...p, estado: v as EstadoAcreditacion }))}
          options={ESTADO_OPTIONS}
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

        <div>
          <p className={cn("font-medium text-negro-una-2 mb-2", TYPOGRAPHY.form.label)}>
            PDF de la resolución{" "}
            {isEditing && <span className="font-normal text-gris-una">(opcional al editar)</span>}
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

// ─── Componente principal ────────────────────────────────────────────────────

const TABS = ["Resolución SINAES", "Informe Final Institucional"] as const;
type Tab = (typeof TABS)[number];

export const AccreditationReportAdminPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const moduleInfo = getModuleInfo("accreditation_report_admin");
  const [activeTab, setActiveTab] = useState<Tab>("Resolución SINAES");
  const [historial] = useState<Resolucion[]>(MOCK_HISTORIAL);

  // ─ Estado informe final ─
  const [versiones, setVersiones] = useState<VersionInforme[]>(MOCK_VERSIONES_INFORME);
  const [showInformeModal, setShowInformeModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<VersionInforme | null>(null);
  const [deletingVersion, setDeletingVersion] = useState<VersionInforme | null>(null);

  // ─ Estado modales de resolución ─
  const [showResolucionModal, setShowResolucionModal] = useState(false);
  const [editingResolucion, setEditingResolucion] = useState<Resolucion | null>(null);
  const [deletingResolucion, setDeletingResolucion] = useState<Resolucion | null>(null);

  const handleSaveResolucion = (data: ResolucionFormData) => {
    showToast({
      type: "success",
      title: editingResolucion ? "Resolución actualizada" : "Resolución publicada",
      message: editingResolucion
        ? `La resolución Nº ${data.numero} fue actualizada correctamente.`
        : `La resolución Nº ${data.numero} fue publicada correctamente.`,
    });
    setShowResolucionModal(false);
    setEditingResolucion(null);
  };

  const handleDeleteResolucion = () => {
    if (!deletingResolucion) return;
    showToast({
      type: "success",
      title: "Resolución eliminada",
      message: `La resolución Nº ${deletingResolucion.numero} fue eliminada.`,
    });
    setDeletingResolucion(null);
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
      key: "numero",
      header: "Resolución",
      align: "left",
      width: firstColumn.width,
      render: (_, r) => (
        <div className="flex flex-col">
          <span className={cn("font-bold text-negro-una-2", TYPOGRAPHY.table.cell)}>
            Nº {r.numero}
          </span>
          <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>{r.archivo_size}</p>
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
          <span className={cn("font-semibold text-negro-una-2", TYPOGRAPHY.table.helper)}>{r.publicado_por}</span>
          <span className={cn("text-gris-una", TYPOGRAPHY.table.helper)}>{formatDate(r.publicado_en)}</span>
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
          label={r.activa ? "Activa" : "Archivada"}
          colorClasses={r.activa ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.gris.colorClasses}
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
          label={r.estado === "acreditada" ? "Acreditada" : "No acreditada"}
          colorClasses={r.estado === "acreditada" ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.error.colorClasses}
        />
      ),

    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      width: TABLE_COLUMN_WIDTHS.actionsLarge,
      render: (_, r) => (
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
              setEditingResolucion(r as Resolucion);
              setShowResolucionModal(true);
            }}
          />
          <TableActionButton
            action="delete"
            tooltip="Eliminar"
            onClick={() => setDeletingResolucion(r as Resolucion)}
          />
        </div>
      ),
    },
  ], []);

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
                    onClick={() => {
                      setEditingResolucion(null);
                      setShowResolucionModal(true);
                    }}
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
              emptyMessage="Sin resoluciones registradas."
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

      {/* ──────────── Modal: Crear / Editar Resolución ──────────── */}
      <ResolucionModal
        isOpen={showResolucionModal}
        onClose={() => {
          setShowResolucionModal(false);
          setEditingResolucion(null);
        }}
        initial={editingResolucion}
        onSave={handleSaveResolucion}
      />

      {/* ──────────── Modal: Confirmar eliminación de resolución ──────────── */}
      <DeleteConfirmationModal
        isOpen={deletingResolucion !== null}
        onClose={() => setDeletingResolucion(null)}
        onConfirm={handleDeleteResolucion}
        title="Eliminar resolución"
        itemName={`Nº ${deletingResolucion?.numero ?? ""}`}
        confirmLabel="Sí, eliminar"
        variant={deletingResolucion?.activa ? "warning" : "danger"}
        footerMeta={
          deletingResolucion?.activa
            ? "Esta es la resolución activa."
            : "Esta acción no se puede deshacer"
        }
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
