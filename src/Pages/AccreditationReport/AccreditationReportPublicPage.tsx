import React, { useState, useMemo, useEffect } from "react";
import { ScreenContainer, PageHeader, Tooltip, TooltipTrigger, TooltipContent } from "@/Components/Ui/Index";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { Button } from "@/Components/Ui/Buttons/Button";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { BADGE_COLORS } from "@/Constants/StatusBadges";
import { ICON_SIZES, TABLE_COLUMN_WIDTHS, TABLE_ACTION_BUTTON } from "@/Constants/Components";
import { cn } from "@/Utils/ClassNames";
import { formatDate } from "@/Utils/DateUtils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/Constants/ROUTES";
import { useAuth } from "@/Context/AuthContext";
import { REPORTS_ACCESS_PERMISSIONS } from "@/Constants/PermissionCapabilities";
import { Card } from "@/Components/Ui/Layout/Card";
import { DataTable } from "@/Components/Ui/Table/DataTable";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import { useFirstColumnConfig } from "@/Hooks/UseFirstColumnConfig";
import { fetchReports } from "@/Services/AccreditationReportService";
import type { AccreditationReportApi } from "@/Types/AccreditationReportTypes";

// ─── Tipos SINAES ───────────────────────────────────────────────────────────

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

// ─── Tipos Informe Final ────────────────────────────────────────────────────

interface ArchivoPublico {
  id: number;
  nombre: string;
  size: string;
  url_publica: string;
}

interface EvidenciaPublica {
  id: number;
  nomenclatura: string;
  descripcion: string;
  archivos: ArchivoPublico[];
}

interface CriterioPublico {
  id: number;
  nomenclatura: string;
  descripcion: string;
  evidencias: EvidenciaPublica[];
}

interface DimensionPublica {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterios: CriterioPublico[];
}

interface InformePublicado {
  publicado_por: string;
  publicado_en: string;
  dimensiones: DimensionPublica[];
}

interface Resolucion {
  id: string;
  numero_resolucion: string;
  estado: "publicado" | "despublicado";
  fecha_publicacion: string;
  vigencia_inicio: string;
  vigencia_fin: string;
  esta_vigente: boolean;
  observaciones: string | null;
  archivo: ResolucionArchivo;
  publicado_por: { id: number; nombre: string };
  publicado_at: string;
}

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

// ─── Datos mock Informe Final ───────────────────────────────────────────────

const MOCK_INFORME: InformePublicado = {
  publicado_por: "José Jara Arias",
  publicado_en: "2026-04-10T14:30:00",
  dimensiones: [
    {
      id: 1,
      nomenclatura: "D1",
      descripcion: "Gestión del Plan de Estudios",
      criterios: [
        {
          id: 11,
          nomenclatura: "C1.1",
          descripcion: "Coherencia del perfil de egreso con las necesidades del entorno",
          evidencias: [
            {
              id: 111,
              nomenclatura: "E-01",
              descripcion: "Perfil de egreso aprobado por el Consejo de Carrera",
              archivos: [
                { id: 1, nombre: "perfil_egreso_2024.pdf", size: "240 KB", url_publica: "#" },
              ],
            },
            {
              id: 112,
              nomenclatura: "E-02",
              descripcion: "Plan de Estudios vigente",
              archivos: [
                { id: 2, nombre: "plan_estudios_2024.pdf", size: "1.1 MB", url_publica: "#" },
              ],
            },
          ],
        },
        {
          id: 12,
          nomenclatura: "C1.2",
          descripcion: "Actualización curricular documentada",
          evidencias: [
            {
              id: 121,
              nomenclatura: "E-03",
              descripcion: "Actas de comisión de revisión curricular 2023",
              archivos: [
                { id: 3, nombre: "actas_revision_curricular_2023.pdf", size: "890 KB", url_publica: "#" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      nomenclatura: "D2",
      descripcion: "Personal Académico",
      criterios: [
        {
          id: 21,
          nomenclatura: "C2.1",
          descripcion: "Formación académica del cuerpo docente",
          evidencias: [
            {
              id: 211,
              nomenclatura: "E-04",
              descripcion: "CVs del personal docente con grados académicos",
              archivos: [
                { id: 4, nombre: "cvs_docentes_2025.pdf", size: "2.3 MB", url_publica: "#" },
              ],
            },
          ],
        },
        {
          id: 22,
          nomenclatura: "C2.2",
          descripcion: "Distribución de cargas académicas",
          evidencias: [
            {
              id: 221,
              nomenclatura: "E-05",
              descripcion: "Cargas académicas por docente — I Semestre 2026",
              archivos: [
                { id: 5, nombre: "cargas_i_2026.xlsx", size: "180 KB", url_publica: "#" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      nomenclatura: "D3",
      descripcion: "Infraestructura y Recursos de Apoyo",
      criterios: [
        {
          id: 31,
          nomenclatura: "C3.1",
          descripcion: "Disponibilidad de laboratorios y equipos",
          evidencias: [
            {
              id: 311,
              nomenclatura: "E-06",
              descripcion: "Inventario de equipos de laboratorio actualizado",
              archivos: [
                { id: 6, nombre: "inventario_laboratorio_2025.pdf", size: "560 KB", url_publica: "#" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ─── Componente: vista de una dimensión (acordeón) ──────────────────────────

interface DimensionAccordionProps {
  dimension: DimensionPublica;
}

const DimensionAccordion: React.FC<DimensionAccordionProps> = ({ dimension }) => {
  const [open, setOpen] = useState(true);
  const [openCriterios, setOpenCriterios] = useState<Set<number>>(
    new Set(dimension.criterios.map((c) => c.id)),
  );

  const toggleCriterio = (id: number) =>
    setOpenCriterios((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="bg-blanco-una border border-gris-claro rounded-xl overflow-hidden shadow-sm">
      {/* Cabecera dimensión */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gris-fondo transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-rojo-una/10 flex items-center justify-center shrink-0">
          <SystemIcons.interface.chevronRight
            className={cn(ICON_SIZES.sm, "text-rojo-una transition-transform", open && "rotate-90")}
          />
        </div>
        <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
          <span className={cn("font-bold shrink-0 text-rojo-una", TYPOGRAPHY.table.cell)}>
            {dimension.nomenclatura}
          </span>
          <span className={cn("font-normal text-negro-una-2", TYPOGRAPHY.table.cell)}>
            {dimension.descripcion}
          </span>
        </div>
        <span className={cn("text-gris-una shrink-0", TYPOGRAPHY.table.helper)}>
          {dimension.criterios.length} criterio{dimension.criterios.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Criterios */}
      {open && (
        <div className="border-t border-gris-claro divide-y divide-gris-claro">
          {dimension.criterios.map((criterio) => (
            <div key={criterio.id} className="bg-gris-fondo/40">
              {/* Cabecera criterio */}
              <button
                onClick={() => toggleCriterio(criterio.id)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gris-fondo transition-colors text-left"
              >
                <SystemIcons.interface.chevronRight
                  className={cn(
                    ICON_SIZES.sm,
                    "text-gris-una transition-transform shrink-0 ml-3",
                    openCriterios.has(criterio.id) && "rotate-90",
                  )}
                />
                <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
                  <span className={cn("font-bold shrink-0 text-negro-una-2", TYPOGRAPHY.table.cell)}>
                    {criterio.nomenclatura}
                  </span>
                  <span className={cn("font-normal text-gris-una-2", TYPOGRAPHY.table.cell)}>
                    {criterio.descripcion}
                  </span>
                </div>
                <span className={cn("text-gris-una shrink-0", TYPOGRAPHY.table.helper)}>
                  {criterio.evidencias.length} evidencia{criterio.evidencias.length !== 1 ? "s" : ""}
                </span>
              </button>

              {/* Evidencias */}
              {openCriterios.has(criterio.id) && (
                <div className="pl-12 pr-5 pb-3 space-y-2">
                  {criterio.evidencias.length === 0 ? (
                    <p className={cn("text-gris-una py-2", TYPOGRAPHY.table.helper)}>
                      Sin evidencias.
                    </p>
                  ) : (
                    criterio.evidencias.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-3 bg-blanco-una border border-gris-claro rounded-lg px-4 py-2.5"
                      >
                        <SystemIcons.navigation.reports
                          className={cn(ICON_SIZES.sm, "text-gris-una shrink-0")}
                        />
                        <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
                          <span className={cn("font-bold shrink-0 text-negro-una-2", TYPOGRAPHY.table.helper)}>
                            {ev.nomenclatura}
                          </span>
                          <span className={cn("font-normal text-gris-una-2 truncate", TYPOGRAPHY.table.helper)}>
                            {ev.descripcion}
                          </span>
                        </div>
                        {ev.archivos.length > 0 && (
                          <div className="flex items-center gap-2 shrink-0">
                            {ev.archivos.map((arch) => (
                              <Button
                                key={arch.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(arch.url_publica, "_blank")}
                              >
                                <SystemIcons.actions.download className={ICON_SIZES.sm} />
                                {arch.nombre.length > 20
                                  ? arch.nombre.slice(0, 18) + "…"
                                  : arch.nombre}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// DataTable requiere T extends Record<string, unknown>
type ResolucionRow = Resolucion & Record<string, unknown>;

// ─── Componente principal ────────────────────────────────────────────────────

const TABS = ["Resolución SINAES", "Informe Final Institucional"] as const;
type Tab = (typeof TABS)[number];

export const AccreditationReportPublicPage: React.FC = () => {
  const moduleInfo = getModuleInfo("accreditation_report_public");
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canViewAdmin = canAccess({ requireAnyPermissions: REPORTS_ACCESS_PERMISSIONS });
  const [activeTab, setActiveTab] = useState<Tab>("Resolución SINAES");
  const [historial, setHistorial] = useState<Resolucion[]>([]);

  useEffect(() => {
    fetchReports()
      .then((res) => setHistorial(res.data.map(mapApiToResolucion)))
      .catch(() => {/* errores silenciados en la página pública */});
  }, []);

  const resolucionActiva = historial.find((r) => r.esta_vigente) ?? null;
  const isAcreditada = resolucionActiva?.esta_acreditada ?? false;
  const firstColumn = useFirstColumnConfig();

  const historialColumns = useMemo<DataTableColumn<ResolucionRow>[]>(() => [
    {
      key: "numero_resolucion",
      header: "Resolución",
      align: "left",
      width: firstColumn.width,
      render: (_, r) => (
        <div className="flex flex-col">
          <span className={cn("font-bold text-negro-una-2", TYPOGRAPHY.table.cell)}>Nº {r.numero_resolucion}</span>
          <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>
            {formatDate(r.publicado_at)} · {(r.archivo.tamanio / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
      ),
    },
    {
      key: "vigencia",
      header: "Vigencia",
      align: "left",
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
        </div>
      ),
    },
  ], [firstColumn.width]);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="none"
        headerExtra={
          canViewAdmin ? (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.SINAES_ADMIN)}
                >
                  <SystemIcons.auth.EyeSlash className={ICON_SIZES.md} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Vista administrativa</p>
              </TooltipContent>
            </Tooltip>
          ) : undefined
        }
      />

      {/* ─ Hero acreditación ─ */}
      {resolucionActiva && (
        <div
          className={cn(
            "flex items-center gap-5 p-5 rounded-xl border mb-6",
            isAcreditada
              ? "bg-verde-ring/20 border-verde-dark/25"
              : "bg-error-ring/20 border-error-dark/25",
          )}
        >
          {/* Insignia SINAES solo si está acreditada */}
          {isAcreditada ? (
            <img
              src="/Images/SINAES.png"
              alt="Insignia SINAES"
              className="w-16 h-16 object-contain shrink-0"
              onError={(e) => {
                // Fallback si no carga la imagen
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-error-ring border border-error-dark/20 flex items-center justify-center shrink-0">
              <SystemIcons.auth.ShieldSlash className={cn(ICON_SIZES.md, "text-error-dark")} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-semibold",
                TYPOGRAPHY.pageSubtitle,
                isAcreditada ? "text-verde-dark" : "text-error-dark",
              )}
            >
              {isAcreditada
                ? "Carrera Acreditada por SINAES"
                : "Carrera Sin Acreditación Vigente"}
            </p>
            <p className={cn("mt-1", TYPOGRAPHY.table.cell, "text-negro-una-2")}>
              Resolución SINAES Nº {resolucionActiva.numero_resolucion}
              &nbsp;·&nbsp;
              Vigente del {formatDate(resolucionActiva.vigencia_inicio)} al {formatDate(resolucionActiva.vigencia_fin)}
            </p>
            <p className={cn("mt-0.5 text-gris-una", TYPOGRAPHY.table.helper)}>
              Publicado por {resolucionActiva.publicado_por.nombre} el {formatDate(resolucionActiva.publicado_at)}
            </p>
          </div>
        </div>
      )}

      {/* Sin resolución publicada */}
      {!resolucionActiva && (
        <div className="flex items-center gap-3 p-4 bg-gris-fondo border border-gris-claro rounded-xl mb-6">
          <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.md, "text-gris-una shrink-0")} />
          <p className={cn("text-gris-una", TYPOGRAPHY.table.cell)}>
            No hay resolución de acreditación publicada para esta carrera.
          </p>
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

      {/* ──────────── Tab: Resolución SINAES ──────────── */}
      {activeTab === "Resolución SINAES" && (
        <div className="space-y-6">
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
        <div className="space-y-4">
          {/* Acordeón de dimensiones */}
          {MOCK_INFORME.dimensiones.map((dim) => (
            <DimensionAccordion key={dim.id} dimension={dim} />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
};

export default AccreditationReportPublicPage;
