import React, { useState, useRef } from "react";
import { ScreenContainer, PageHeader } from "@/Components/Ui/Index";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { Button } from "@/Components/Ui/Buttons/Button";
import { Input } from "@/Components/Ui/Index";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { BADGE_COLORS } from "@/Constants/StatusBadges";
import { ICON_SIZES } from "@/Constants/Components";
import { cn } from "@/Utils/ClassNames";
import { formatDate } from "@/Utils/DateUtils";
import { useToast } from "@/Context/ToastContext";
import { getModuleInfo } from "@/Constants/ModuleInfo";

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

type EstadoInforme = "sin_publicar" | "publicado";

interface PublicacionInforme {
  estado: EstadoInforme;
  publicado_por: string;
  publicado_en: string;
}

interface BitacoraItem {
  id: number;
  accion: string;
  usuario: string;
  fecha: string;
}

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

const MOCK_PUBLICACION_INFORME: PublicacionInforme = {
  estado: "publicado",
  publicado_por: "José Jara Arias",
  publicado_en: "2026-04-10T14:30:00",
};

const MOCK_BITACORA: BitacoraItem[] = [
  {
    id: 1,
    accion: "Informe final publicado en el sistema",
    usuario: "José Jara Arias",
    fecha: "2026-04-10T14:30:00",
  },
  {
    id: 2,
    accion: "Informe final actualizado y republicado",
    usuario: "Cristina Zúñiga Cárdenas",
    fecha: "2026-03-01T10:00:00",
  },
];

// ─── Componente principal ────────────────────────────────────────────────────

const TABS = ["Publicación actual", "Informe Final", "Historial"] as const;
type Tab = (typeof TABS)[number];

export const AccreditationReportAdminPage: React.FC = () => {
  const { showToast } = useToast();
  const moduleInfo = getModuleInfo("accreditation_report_admin");
  const [activeTab, setActiveTab] = useState<Tab>("Publicación actual");
  const [historial] = useState<Resolucion[]>(MOCK_HISTORIAL);
  const resolucionActiva = historial.find((r) => r.activa) ?? null;

  // ─ Estado informe final ─
  const [publicacionInforme, setPublicacionInforme] = useState<PublicacionInforme>(MOCK_PUBLICACION_INFORME);
  const [bitacora] = useState<BitacoraItem[]>(MOCK_BITACORA);
  const [showConfirmPublicar, setShowConfirmPublicar] = useState(false);
  const [isPublicando, setIsPublicando] = useState(false);

  // ─ Formulario de nueva resolución ─
  const [form, setForm] = useState({
    numero: "",
    estado: "acreditada" as EstadoAcreditacion,
    vigencia_inicio: "",
    vigencia_fin: "",
  });
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setArchivoSeleccionado(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") setArchivoSeleccionado(file);
  };

  const handlePublicar = () => {
    // Sin backend aún — placeholder
    alert("(Sin backend) Publicaría la resolución con los datos del formulario.");
  };

  const handlePublicarInforme = () => {
    setIsPublicando(true);
    // Sin backend aún — simula publicación
    setTimeout(() => {
      setPublicacionInforme({
        estado: "publicado",
        publicado_por: "Usuario actual",
        publicado_en: new Date().toISOString(),
      });
      setIsPublicando(false);
      setShowConfirmPublicar(false);
      showToast({
        type: "success",
        title: "Informe publicado",
        message: "El informe final ha sido publicado y está disponible para todos los usuarios.",
      });
    }, 1200);
  };

  const formCompleto =
    form.numero.trim() !== "" &&
    form.vigencia_inicio !== "" &&
    form.vigencia_fin !== "" &&
    archivoSeleccionado !== null;

  return (
    <ScreenContainer variant="full-width">
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
      />

      {/* ─ Banner resolución activa ─ */}
      {resolucionActiva && (
        <div
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border mb-6",
            resolucionActiva.estado === "acreditada"
              ? "bg-verde-ring border-verde-ring"
              : "bg-error-ring border-error-ring",
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              resolucionActiva.estado === "acreditada"
                ? "bg-verde-ring border border-verde-dark/30"
                : "bg-error-ring border border-error-dark/30",
            )}
          >
            <SystemIcons.users.roles
              className={cn(
                ICON_SIZES.sm,
                resolucionActiva.estado === "acreditada"
                  ? "text-verde-dark"
                  : "text-error-dark",
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("font-semibold", TYPOGRAPHY.table.cell,
              resolucionActiva.estado === "acreditada" ? "text-verde-dark" : "text-error-dark"
            )}>
              Resolución activa: Nº {resolucionActiva.numero}
            </p>
            <p className={cn(TYPOGRAPHY.table.helper, "text-negro-una-2 mt-0.5")}>
              Vigente {formatDate(resolucionActiva.vigencia_inicio)} — {formatDate(resolucionActiva.vigencia_fin)}
              &nbsp;· Publicado por {resolucionActiva.publicado_por}
            </p>
          </div>
          <StatusBadge
            label={resolucionActiva.estado === "acreditada" ? "Acreditada" : "No acreditada"}
            colorClasses={
              resolucionActiva.estado === "acreditada"
                ? BADGE_COLORS.verde.colorClasses
                : BADGE_COLORS.error.colorClasses
            }
          />
        </div>
      )}

      {/* ─ Tabs ─ */}
      <div className="flex border-b border-gris-claro mb-6 gap-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab
                ? "border-rojo-una text-rojo-una"
                : "border-transparent text-gris-una hover:text-negro-una-2",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ──────────── Tab: Publicación actual ──────────── */}
      {activeTab === "Publicación actual" && (
        <div className="space-y-6">

          {/* Documento activo */}
          {resolucionActiva && (
            <div className="bg-blanco-una border border-gris-claro rounded-xl p-5 shadow-sm">
              <p className={cn("uppercase tracking-wider font-semibold text-gris-una mb-4", TYPOGRAPHY.table.helper)}>
                Documento publicado
              </p>
              <div className="flex items-center gap-3 p-3 bg-gris-fondo rounded-lg border border-gris-claro">
                <div className="w-9 h-11 bg-error-ring rounded flex items-center justify-center shrink-0 border border-error-dark/15">
                  <span className={cn("font-bold text-error-dark", TYPOGRAPHY.table.helper)}>PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-negro-una-2 truncate", TYPOGRAPHY.table.cell)}>
                    {resolucionActiva.archivo_nombre}
                  </p>
                  <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>
                    {resolucionActiva.archivo_size} · Subido el {formatDate(resolucionActiva.publicado_en)}
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  <SystemIcons.actions.download className={ICON_SIZES.sm} />
                  Descargar
                </Button>
              </div>
            </div>
          )}

          {/* Formulario nueva resolución */}
          <div className="bg-blanco-una border border-gris-claro rounded-xl p-5 shadow-sm space-y-4">
            <p className={cn("uppercase tracking-wider font-semibold text-gris-una", TYPOGRAPHY.table.helper)}>
              Publicar nueva resolución
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Número de resolución"
                placeholder="Ej: R-022-2026"
                value={form.numero}
                onChange={(e) => handleFormChange("numero", e.target.value)}
              />

              {/* Estado de acreditación */}
              <div className="flex flex-col gap-1.5">
                <label className={cn("font-medium text-negro-una-2", TYPOGRAPHY.form.label)}>
                  Estado de acreditación
                </label>
                <div className="flex gap-2">
                  {(["acreditada", "no_acreditada"] as const).map((estado) => (
                    <button
                      key={estado}
                      onClick={() => handleFormChange("estado", estado)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors",
                        form.estado === estado
                          ? estado === "acreditada"
                            ? "bg-verde-ring border-verde-dark text-verde-dark"
                            : "bg-error-ring border-error-dark text-error-dark"
                          : "bg-gris-fondo border-gris-claro text-gris-una hover:border-negro-una-2",
                      )}
                    >
                      {estado === "acreditada" ? "Acreditada" : "No acreditada"}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Vigencia desde"
                type="date"
                value={form.vigencia_inicio}
                onChange={(e) => handleFormChange("vigencia_inicio", e.target.value)}
              />

              <Input
                label="Vigencia hasta"
                type="date"
                value={form.vigencia_fin}
                onChange={(e) => handleFormChange("vigencia_fin", e.target.value)}
              />
            </div>

            {/* Drop zone PDF */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors",
                archivoSeleccionado
                  ? "border-verde-dark bg-verde-ring/20"
                  : "border-gris-claro hover:border-rojo-una hover:bg-error-ring/10",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {archivoSeleccionado ? (
                <div className="flex items-center justify-center gap-3">
                  <SystemIcons.interface.checkCircle className={cn(ICON_SIZES.md, "text-verde-dark")} />
                  <div className="text-left">
                    <p className={cn("font-medium text-verde-dark", TYPOGRAPHY.table.cell)}>
                      {archivoSeleccionado.name}
                    </p>
                    <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>
                      {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB · listo para subir
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setArchivoSeleccionado(null); }}
                    className="ml-2 text-gris-una hover:text-error-dark transition-colors"
                  >
                    <SystemIcons.interface.xCircle className={ICON_SIZES.sm} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gris-fondo rounded-full flex items-center justify-center mx-auto mb-3">
                    <SystemIcons.interface.uploadArrow className={cn(ICON_SIZES.md, "text-gris-una")} />
                  </div>
                  <p className={cn("font-medium text-negro-una-2", TYPOGRAPHY.table.cell)}>
                    Arrastrá el PDF oficial aquí o hacé clic para seleccionar
                  </p>
                  <p className={cn("text-gris-una mt-1", TYPOGRAPHY.table.helper)}>
                    Solo archivos PDF · Máximo 20 MB
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                disabled={!formCompleto}
                onClick={handlePublicar}
              >
                <SystemIcons.navigation.reports className={ICON_SIZES.sm} />
                Publicar resolución
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────── Tab: Informe Final ──────────── */}
      {activeTab === "Informe Final" && (
        <div className="space-y-6">

          {/* Estado de publicación */}
          <div
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border",
              publicacionInforme.estado === "publicado"
                ? "bg-verde-ring/20 border-verde-dark/25"
                : "bg-gris-fondo border-gris-claro",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                publicacionInforme.estado === "publicado"
                  ? "bg-verde-ring border border-verde-dark/30"
                  : "bg-gris-claro border border-gris-una/30",
              )}
            >
              {publicacionInforme.estado === "publicado" ? (
                <SystemIcons.interface.checkCircle className={cn(ICON_SIZES.sm, "text-verde-dark")} />
              ) : (
                <SystemIcons.interface.alert className={cn(ICON_SIZES.sm, "text-gris-una")} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-semibold",
                  TYPOGRAPHY.table.cell,
                  publicacionInforme.estado === "publicado" ? "text-verde-dark" : "text-gris-una",
                )}
              >
                {publicacionInforme.estado === "publicado"
                  ? "Informe final publicado en el sistema"
                  : "Informe final no publicado"}
              </p>
              {publicacionInforme.estado === "publicado" && (
                <p className={cn(TYPOGRAPHY.table.helper, "text-negro-una-2 mt-0.5")}>
                  Publicado por {publicacionInforme.publicado_por} · {formatDate(publicacionInforme.publicado_en)}
                </p>
              )}
            </div>
            <StatusBadge
              label={publicacionInforme.estado === "publicado" ? "Publicado" : "Sin publicar"}
              colorClasses={
                publicacionInforme.estado === "publicado"
                  ? BADGE_COLORS.verde.colorClasses
                  : BADGE_COLORS.gris.colorClasses
              }
            />
          </div>

          {/* Acción de publicación */}
          <div className="bg-blanco-una border border-gris-claro rounded-xl p-5 shadow-sm">
            <p className={cn("uppercase tracking-wider font-semibold text-gris-una mb-1", TYPOGRAPHY.table.helper)}>
              Publicar informe
            </p>
            <p className={cn("text-gris-una mb-4", TYPOGRAPHY.table.cell)}>
              Al publicar, todos los usuarios con acceso al sistema podrán visualizar en modo lectura las
              dimensiones, componentes, criterios, evidencias y enlaces del informe final.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowConfirmPublicar(true)}
            >
              <SystemIcons.navigation.reports className={ICON_SIZES.sm} />
              {publicacionInforme.estado === "publicado" ? "Republicar informe" : "Publicar informe"}
            </Button>
          </div>

          {/* Bitácora */}
          <div className="bg-blanco-una border border-gris-claro rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gris-claro">
              <p className={cn("uppercase tracking-wider font-semibold text-gris-una", TYPOGRAPHY.table.helper)}>
                Bitácora de publicaciones
              </p>
            </div>
            {bitacora.length === 0 ? (
              <p className={cn("text-center py-8 text-gris-una", TYPOGRAPHY.table.cell)}>Sin registros.</p>
            ) : (
              <div className="divide-y divide-gris-claro">
                {bitacora.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                    <SystemIcons.interface.informationCircle
                      className={cn(ICON_SIZES.sm, "text-gris-una shrink-0 mt-0.5")}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-negro-una-2", TYPOGRAPHY.table.cell)}>
                        {item.accion}
                      </p>
                      <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>
                        {item.usuario} · {formatDate(item.fecha)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────── Modal de confirmación ──────────── */}
      {showConfirmPublicar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro-una/40 px-4">
          <div className="bg-blanco-una rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-azul-ring flex items-center justify-center shrink-0">
                <SystemIcons.navigation.reports className={cn(ICON_SIZES.md, "text-azul-una")} />
              </div>
              <div>
                <p className={cn("font-semibold text-negro-una", TYPOGRAPHY.pageSubtitle)}>Confirmar publicación</p>
                <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>Esta acción quedará registrada en la bitácora.</p>
              </div>
            </div>
            <p className={cn("text-gris-una-2", TYPOGRAPHY.table.cell)}>
              ¿Confirmás la publicación del informe final? Los usuarios del sistema podrán visualizarlo en modo lectura.
            </p>
            <div className="flex gap-3 justify-end pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirmPublicar(false)}
                disabled={isPublicando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublicarInforme}
                disabled={isPublicando}
              >
                {isPublicando ? "Publicando..." : "Sí, publicar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────── Tab: Historial ──────────── */}
      {activeTab === "Historial" && (
        <div className="bg-blanco-una border border-gris-claro rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gris-claro">
            <p className={cn("uppercase tracking-wider font-semibold text-gris-una", TYPOGRAPHY.table.helper)}>
              Historial de resoluciones publicadas
            </p>
          </div>
          <div className="divide-y divide-gris-claro">
            {historial.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold text-negro-una-2", TYPOGRAPHY.table.cell)}>
                    Nº {r.numero}
                  </p>
                  <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>
                    {formatDate(r.publicado_en)} · {r.publicado_por} · {r.archivo_size}
                  </p>
                </div>
                <StatusBadge
                  label={r.activa ? "Activa" : "Archivada"}
                  colorClasses={r.activa ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.gris.colorClasses}
                />
                <Button variant="ghost" size="sm">
                  <SystemIcons.interface.back className={ICON_SIZES.sm} />
                  Ver PDF
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ScreenContainer>
  );
};

export default AccreditationReportAdminPage;
