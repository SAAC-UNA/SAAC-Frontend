import React, { useState, useMemo, useEffect } from "react";
import {
  ScreenContainer,
  PageHeader,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/Components/Ui/Index";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { Button } from "@/Components/Ui/Buttons/Button";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { BADGE_COLORS } from "@/Constants/StatusBadges";
import {
  ICON_SIZES,
  TABLE_COLUMN_WIDTHS,
} from "@/Constants/Components";
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
import { useOperationalContextSnapshot } from "@/Hooks/useOperationalContextSnapshot";
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
  estado: "publicado" | "despublicado";
  fecha_publicacion: string;
  observaciones: string | null;
  archivo: ResolucionArchivo;
  publicado_por: { id: number; nombre: string };
  publicado_at: string;
}

// ─── Mapeo API → tipo local ──────────────────────────────────────────────────

function mapApiToResolucion(api: AccreditationReportApi): Resolucion {
  return {
    id: String(api.informe_archivo_id),
    estado: api.estado,
    fecha_publicacion:
      api.fecha_publicacion ?? api.created_at ?? new Date().toISOString(),
    observaciones: api.observaciones,
    archivo: {
      id: String(api.informe_archivo_id),
      nombre_original: api.archivo?.nombre_original ?? "",
      tamanio: api.archivo?.tamanio ?? 0,
      url: api.archivo?.url_publica ?? "#",
    },
    publicado_por: {
      id: api.publicado_por?.usuario_id ?? 0,
      nombre: api.publicado_por?.nombre ?? "",
    },
    publicado_at:
      api.fecha_publicacion ?? api.created_at ?? new Date().toISOString(),
  };
}

// ─── Tipos Mock para Informe Final ────────────────────────────────────────────

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
          descripcion:
            "Coherencia del perfil de egreso con las necesidades del entorno",
          evidencias: [
            {
              id: 111,
              nomenclatura: "E-01",
              descripcion:
                "Perfil de egreso aprobado por el Consejo de Carrera",
              archivos: [
                {
                  id: 1,
                  nombre: "perfil_egreso_2024.pdf",
                  size: "240 KB",
                  url_publica: "#",
                },
              ],
            },
            {
              id: 112,
              nomenclatura: "E-02",
              descripcion: "Plan de Estudios vigente",
              archivos: [
                {
                  id: 2,
                  nombre: "plan_estudios_2024.pdf",
                  size: "1.1 MB",
                  url_publica: "#",
                },
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
                {
                  id: 3,
                  nombre: "actas_revision_curricular_2023.pdf",
                  size: "890 KB",
                  url_publica: "#",
                },
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
                {
                  id: 4,
                  nombre: "cvs_docentes_2025.pdf",
                  size: "2.3 MB",
                  url_publica: "#",
                },
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
                {
                  id: 5,
                  nombre: "cargas_i_2026.xlsx",
                  size: "180 KB",
                  url_publica: "#",
                },
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
                {
                  id: 6,
                  nombre: "inventario_laboratorio_2025.pdf",
                  size: "560 KB",
                  url_publica: "#",
                },
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

const DimensionAccordion: React.FC<DimensionAccordionProps> = ({
  dimension,
}) => {
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
    <div className="bg-blanco-una border border-gris-claro rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Cabecera dimensión */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-gris-fondo/50 transition-colors text-left"
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
            open
              ? "bg-rojo-una text-blanco-una shadow-lg shadow-rojo-una/20"
              : "bg-rojo-una/10 text-rojo-una",
          )}
        >
          <SystemIcons.interface.chevronRight
            className={cn(
              ICON_SIZES.sm,
              "transition-transform duration-300",
              open && "rotate-90",
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={cn(
                "font-bold text-rojo-una uppercase tracking-wider text-xs",
              )}
            >
              Dimensión {dimension.nomenclatura}
            </span>
          </div>
          <h3
            className={cn(
              "font-bold text-negro-una leading-tight",
              TYPOGRAPHY.table.cell,
            )}
          >
            {dimension.descripcion}
          </h3>
        </div>
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span
            className={cn("text-gris-una font-medium", TYPOGRAPHY.table.helper)}
          >
            {dimension.criterios.length}
          </span>
          <span
            className={cn(
              "text-gris-una text-[10px] uppercase tracking-tighter",
              TYPOGRAPHY.table.helper,
            )}
          >
            Criterios
          </span>
        </div>
      </button>

      {/* Criterios */}
      {open && (
        <div className="border-t border-gris-claro divide-y divide-gris-claro bg-gris-fondo/20">
          {dimension.criterios.map((criterio) => (
            <div key={criterio.id} className="group">
              {/* Cabecera criterio */}
              <button
                onClick={() => toggleCriterio(criterio.id)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-blanco-una transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full border-2 border-gris-claro flex items-center justify-center shrink-0 group-hover:border-rojo-una/30 transition-colors">
                  <SystemIcons.interface.chevronRight
                    className={cn(
                      "w-3 h-3 text-gris-una transition-transform duration-300 group-hover:text-rojo-una",
                      openCriterios.has(criterio.id) && "rotate-90",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "font-bold text-negro-una-2 shrink-0",
                        TYPOGRAPHY.table.cell,
                      )}
                    >
                      {criterio.nomenclatura}
                    </span>
                    <span
                      className={cn(
                        "font-normal text-gris-una-2 leading-snug",
                        TYPOGRAPHY.table.cell,
                      )}
                    >
                      {criterio.descripcion}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-gris-una-2 bg-gris-claro/20 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase shrink-0",
                  )}
                >
                  {criterio.evidencias.length} Evid.
                </span>
              </button>

              {/* Evidencias */}
              {openCriterios.has(criterio.id) && (
                <div className="pl-16 pr-6 pb-4 space-y-3">
                  {criterio.evidencias.length === 0 ? (
                    <div className="flex items-center gap-2 text-gris-una py-2 bg-blanco-una/50 rounded-lg px-4 border border-dashed border-gris-claro">
                      <SystemIcons.interface.informationCircle className="w-4 h-4" />
                      <p className={TYPOGRAPHY.table.helper}>
                        Sin evidencias registradas.
                      </p>
                    </div>
                  ) : (
                    criterio.evidencias.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 bg-blanco-una border border-gris-claro rounded-xl px-5 py-3.5 shadow-sm hover:border-rojo-una/20 transition-all group/ev"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gris-fondo flex items-center justify-center shrink-0 group-hover/ev:bg-rojo-una/5 transition-colors">
                          <SystemIcons.navigation.reports
                            className={cn(
                              "w-4 h-4 text-gris-una group-hover/ev:text-rojo-una transition-colors",
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span
                              className={cn(
                                "font-bold text-negro-una-2 shrink-0",
                                TYPOGRAPHY.table.helper,
                              )}
                            >
                              {ev.nomenclatura}
                            </span>
                            <span
                              className={cn(
                                "font-normal text-gris-una-2 leading-tight",
                                TYPOGRAPHY.table.helper,
                              )}
                            >
                              {ev.descripcion}
                            </span>
                          </div>
                        </div>
                        {ev.archivos.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 shrink-0 mt-2 sm:mt-0">
                            {ev.archivos.map((arch) => (
                              <Button
                                key={arch.id}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs bg-gris-fondo/30 border-gris-claro hover:bg-rojo-una hover:text-blanco-una hover:border-rojo-una transition-all rounded-lg"
                                onClick={() =>
                                  window.open(arch.url_publica, "_blank")
                                }
                              >
                                <SystemIcons.actions.download className="w-3.5 h-3.5 mr-1.5" />
                                {arch.nombre.length > 15
                                  ? arch.nombre.slice(0, 13) + "…"
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
  const { careerCampusId } = useOperationalContextSnapshot();
  const canViewAdmin = canAccess({
    requireAnyPermissions: REPORTS_ACCESS_PERMISSIONS,
  });
  const [activeTab, setActiveTab] = useState<Tab>("Resolución SINAES");
  const [historial, setHistorial] = useState<Resolucion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchReports(careerCampusId ? { carrera_campus_id: careerCampusId } : {})
      .then((res) => setHistorial(res.data.map(mapApiToResolucion)))
      .catch(() => {
        /* errores silenciados en la página pública */
      })
      .finally(() => setIsLoading(false));
  }, [careerCampusId]);

  const resolucionActiva = historial.length > 0 ? historial[0] : null;
  const firstColumn = useFirstColumnConfig();

  const historialColumns = useMemo<DataTableColumn<ResolucionRow>[]>(
    () => [
      {
        key: "archivo",
        header: "Documento",
        align: "left",
        width: firstColumn.width,
        render: (_, r) => (
          <div className="flex flex-col">
            <span
              className={cn(
                "font-bold text-negro-una-2",
                TYPOGRAPHY.table.cell,
              )}
            >
              {r.archivo.nombre_original}
            </span>
            <p className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}>
              Publicado el {formatDate(r.publicado_at)} ·{" "}
              {(r.archivo.tamanio / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        ),
      },
      {
        key: "estado",
        header: "Estado",
        align: "left",
        width: TABLE_COLUMN_WIDTHS.status,
        render: (_, r) => (
          <StatusBadge
            label={r.estado === "publicado" ? "Publicado" : "Borrador"}
            colorClasses={
              r.estado === "publicado"
                ? BADGE_COLORS.verde.colorClasses
                : BADGE_COLORS.gris.colorClasses
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
          </div>
        ),
      },
    ],
    [firstColumn.width],
  );

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
            "relative overflow-hidden flex flex-col md:flex-row items-center gap-6 p-8 rounded-2xl border mb-8 bg-gradient-to-br from-verde-ring/30 to-blanco-una border-verde-dark/20 shadow-sm",
          )}
        >
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-verde-dark/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 rounded-2xl bg-verde-dark flex items-center justify-center shrink-0 shadow-lg shadow-verde-dark/20 rotate-3 transition-transform hover:rotate-0">
            <SystemIcons.navigation.reports
              className={cn("w-10 h-10 text-blanco-una")}
            />
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="scale-90">
                <StatusBadge
                  label="Publicado"
                  colorClasses={BADGE_COLORS.verde.colorClasses}
                />
              </div>
              <span className={cn("text-gris-una", TYPOGRAPHY.table.helper)}>
                Documento oficial
              </span>
            </div>

            <h2
              className={cn(
                "font-bold text-negro-una tracking-tight leading-tight",
                TYPOGRAPHY.pageSubtitle,
                "text-2xl",
              )}
            >
              Resolución de Acreditación Vigente
            </h2>

            <p
              className={cn(
                "mt-2 font-medium text-negro-una-2",
                TYPOGRAPHY.table.cell,
              )}
            >
              {resolucionActiva.archivo.nombre_original}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-4 text-gris-una">
              <div className="flex items-center gap-1.5">
                <SystemIcons.users.user className="w-4 h-4" />
                <span className={TYPOGRAPHY.table.helper}>
                  {resolucionActiva.publicado_por.nombre}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <SystemIcons.interface.calendar className="w-4 h-4" />
                <span className={TYPOGRAPHY.table.helper}>
                  {formatDate(resolucionActiva.publicado_at)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <SystemIcons.interface.informationCircle className="w-4 h-4" />
                <span className={TYPOGRAPHY.table.helper}>
                  {(resolucionActiva.archivo.tamanio / 1024 / 1024).toFixed(1)}{" "}
                  MB
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex gap-2">
            <Button
              variant="primary"
              className="rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all"
              onClick={() =>
                window.open(resolucionActiva.archivo.url, "_blank")
              }
            >
              <SystemIcons.actions.download
                className={cn(ICON_SIZES.sm, "mr-2")}
              />
              Ver Resolución
            </Button>
          </div>
        </div>
      )}

      {/* Sin resolución publicada */}
      {!isLoading && !resolucionActiva && (
        <div className="flex flex-col items-center justify-center p-12 bg-gris-fondo/50 border-2 border-dashed border-gris-claro rounded-3xl mb-8 text-center">
          <div className="w-16 h-16 bg-gris-claro/30 rounded-full flex items-center justify-center mb-4">
            <SystemIcons.interface.informationCircle
              className={cn("w-8 h-8 text-gris-una")}
            />
          </div>
          <h3
            className={cn(
              "font-bold text-negro-una-2",
              TYPOGRAPHY.pageSubtitle,
            )}
          >
            Sin informes publicados
          </h3>
          <p className={cn("text-gris-una mt-2 max-w-md", TYPOGRAPHY.body)}>
            Actualmente no hay informes de acreditación o resoluciones SINAES
            publicadas para esta carrera y sede.
          </p>
        </div>
      )}

      {/* ─ Tabs ─ */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-gris-claro">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 text-sm font-bold transition-all duration-300 relative",
                activeTab === tab
                  ? "text-rojo-una"
                  : "text-gris-una hover:text-negro-una-2",
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-rojo-una rounded-t-full shadow-[0_-2px_10px_rgba(190,15,45,0.3)]" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "Informe Final Institucional" && (
          <div className="flex items-center gap-2 pb-2">
            <span
              className={cn(
                "text-gris-una text-xs font-medium uppercase tracking-widest",
                TYPOGRAPHY.table.helper,
              )}
            >
              Última actualización: {formatDate(MOCK_INFORME.publicado_en)}
            </span>
          </div>
        )}
      </div>

      {/* ──────────── Tab: Resolución SINAES ──────────── */}
      {activeTab === "Resolución SINAES" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="overflow-hidden border-gris-claro shadow-sm">
            <div className="bg-gris-fondo/30 px-6 py-4 border-b border-gris-claro flex items-center justify-between">
              <h4
                className={cn(
                  "uppercase tracking-widest font-bold text-gris-una text-[10px]",
                )}
              >
                Historial de resoluciones publicadas
              </h4>
              {historial.length > 0 && (
                <span className="bg-blanco-una text-gris-una px-2 py-0.5 rounded-full text-[10px] font-bold border border-gris-claro">
                  {historial.length} Documentos
                </span>
              )}
            </div>
            <DataTable<ResolucionRow>
              data={historial as ResolucionRow[]}
              columns={historialColumns}
              loading={isLoading}
              emptyMessage="No se encontraron resoluciones históricas."
              unstyled
            />
          </Card>
        </div>
      )}

      {/* ──────────── Tab: Informe Final Institucional ──────────── */}
      {activeTab === "Informe Final Institucional" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 gap-6">
            {MOCK_INFORME.dimensiones.map((dim) => (
              <DimensionAccordion key={dim.id} dimension={dim} />
            ))}
          </div>

          <div className="mt-12 p-8 bg-rojo-una/5 rounded-3xl border border-rojo-una/10 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-rojo-una/10 rounded-full flex items-center justify-center mb-4">
              <SystemIcons.interface.informationCircle className="w-6 h-6 text-rojo-una" />
            </div>
            <h4
              className={cn(
                "font-bold text-negro-una",
                TYPOGRAPHY.pageSubtitle,
              )}
            >
              ¿Necesita más información?
            </h4>
            <p className={cn("text-gris-una mt-2 max-w-lg", TYPOGRAPHY.body)}>
              Los informes finales institucionales contienen el detalle
              exhaustivo del proceso de autoevaluación realizado por la carrera.
              Si tiene dudas sobre los criterios aplicados, puede contactar a la
              unidad académica.
            </p>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
};

export default AccreditationReportPublicPage;
