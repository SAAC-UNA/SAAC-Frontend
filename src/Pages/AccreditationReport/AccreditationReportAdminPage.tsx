/**
 * Página mínima para probar los endpoints `informes-archivos` (HU archivos de informe).
 * Solo carga de archivos físicos (multipart). Usa el proceso del filtro global o un ID manual.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScreenContainer, PageHeader, Button } from "@/Components/Ui/Index";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { BADGE_COLORS } from "@/Constants/StatusBadges";
import { TABLE_COLUMN_WIDTHS } from "@/Constants/Components";
import { cn } from "@/Utils/ClassNames";
import { formatDate } from "@/Utils/DateUtils";
import { useToast } from "@/Context/ToastContext";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { Card } from "@/Components/Ui/Layout/Card";
import { DropZone } from "@/Components/Ui/Upload/DropZone";
import { DataTable } from "@/Components/Ui/Table/DataTable";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import { TABLE_ACTION_BUTTON } from "@/Constants/Components";
import { useFirstColumnConfig } from "@/Hooks/UseFirstColumnConfig";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { DeleteConfirmationModal } from "@/Components/Ui/Modals/DeleteConfirmationModal";
import { useOperationalContextSnapshot } from "@/Hooks/useOperationalContextSnapshot";
import { reportFileService } from "@/Services/ReportFileService";
import type { ReportFileApi } from "@/Types/ReportFileTypes";

const TABS = [
  "Informes Universitarios",
  "Informes SINAES",
  "Resoluciones SINAES",
  "Certificaciones",
] as const;
type TabType = (typeof TABS)[number];

type ReportFileRow = ReportFileApi & Record<string, unknown>;

export const AccreditationReportAdminPage: React.FC = () => {
  const { showToast } = useToast();
  const moduleInfo = getModuleInfo("accreditation_report_admin");
  const { processId } = useOperationalContextSnapshot();
  const firstColumn = useFirstColumnConfig();

  const [activeTab, setActiveTab] = useState<TabType>(
    "Informes Universitarios",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<ReportFileApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadArchivos, setUploadArchivos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ReportFileApi | null>(null);

  const [deleting, setDeleting] = useState<ReportFileApi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFiles = useCallback(async () => {
    if (!processId) {
      setFiles([]);
      return;
    }
    setIsLoading(true);
    try {
      const list = await reportFileService.list(processId);
      setFiles(list);
    } catch {
      showToast({
        type: "error",
        title: "Error al cargar archivos",
        message: "No se pudieron obtener los archivos del informe.",
      });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [processId, showToast]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const openDetail = async (row: ReportFileApi) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailRecord(null);
    try {
      const full = await reportFileService.show(row.informe_archivo_id);
      setDetailRecord(full);
    } catch {
      showToast({
        type: "error",
        title: "Error al cargar detalle",
        message: "No se pudo obtener la información completa del archivo.",
      });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!processId) return;
    if (uploadArchivos.length === 0) {
      showToast({
        type: "warning",
        title: "Validación",
        message: "Seleccione al menos un archivo.",
      });
      return;
    }

    setIsUploading(true);
    try {
      await reportFileService.uploadFiles(processId, uploadArchivos, activeTab);
      showToast({
        type: "success",
        title: "Carga exitosa",
        message: "Los archivos se han subido correctamente.",
      });
      setShowUploadModal(false);
      setUploadArchivos([]);
      await loadFiles();
    } catch {
      showToast({
        type: "error",
        title: "Error al subir",
        message: "Hubo un problema al procesar la carga de archivos.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await reportFileService.remove(deleting.informe_archivo_id);
      showToast({
        type: "success",
        title: "Archivo eliminado",
        message: "El archivo ha sido eliminado.",
      });
      setDeleting(null);
      await loadFiles();
    } catch {
      showToast({
        type: "error",
        title: "Error al eliminar",
        message: "No se pudo eliminar el archivo.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<DataTableColumn<ReportFileRow>[]>(
    () => [
      {
        key: "nombre_original",
        header: "Nombre del Archivo",
        align: "left",
        width: firstColumn.width,
        render: (_, r) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gris-fondo flex items-center justify-center shrink-0 border border-gris-claro shadow-sm">
              <SystemIcons.navigation.reports className="w-5 h-5 text-gris-una" />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "font-bold text-negro-una leading-tight truncate",
                  TYPOGRAPHY.table.cell,
                )}
              >
                {r.nombre_original}
              </span>
              <span
                className={cn("text-gris-una mt-0.5", TYPOGRAPHY.table.helper)}
              >
                {[
                  (r.tamanio ?? 0) > 0
                    ? `${((r.tamanio ?? 0) / 1024 / 1024).toFixed(2)} MB`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "fecha_subida",
        header: "Fecha de Subida",
        align: "left",
        width: TABLE_COLUMN_WIDTHS.status,
        render: (_, r) => (
          <div className="flex flex-col">
            <span
              className={cn(
                "font-medium text-negro-una-2",
                TYPOGRAPHY.table.cell,
              )}
            >
              {r.fecha_subida ? formatDate(r.fecha_subida) : "—"}
            </span>
            <span
              className={cn(
                "text-gris-una text-[10px]",
                TYPOGRAPHY.table.helper,
              )}
            >
              {r.fecha_subida
                ? new Date(r.fecha_subida).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>
        ),
      },
      {
        key: "is_publico",
        header: "Visibilidad",
        align: "left",
        width: TABLE_COLUMN_WIDTHS.status,
        render: (_, r) => (
          <StatusBadge
            label={r.is_publico ? "Público" : "Privado"}
            colorClasses={
              r.is_publico
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
        width: TABLE_COLUMN_WIDTHS.actionsLarge,
        render: (_, r) => (
          <div className="flex items-center justify-center gap-1">
            <TableActionButton
              action="view"
              tooltip="Ver detalles"
              onClick={() => void openDetail(r)}
            />
            <TableActionButton
              action="custom"
              customIcon={SystemIcons.actions.download({
                className: TABLE_ACTION_BUTTON.icon,
              })}
              customVariant="tablePower"
              tooltip="Descargar archivo"
              onClick={() =>
                window.open(
                  reportFileService.getDownloadUrl(r.informe_archivo_id),
                  "_blank",
                )
              }
            />
            {r.is_publico ? (
              <TableActionButton
                action="power"
                tooltip="Hacer privado"
                onClick={async () => {
                  try {
                    const updated = await reportFileService.revokePublic(
                      r.informe_archivo_id,
                    );
                    setFiles((prev) =>
                      prev.map((f) =>
                        f.informe_archivo_id === updated.informe_archivo_id
                          ? updated
                          : f,
                      ),
                    );
                    showToast({
                      type: "success",
                      title: "Actualizado",
                      message: "El archivo ahora es privado.",
                    });
                  } catch {
                    showToast({
                      type: "error",
                      title: "Error",
                      message: "No se pudo cambiar la visibilidad.",
                    });
                  }
                }}
              />
            ) : (
              <TableActionButton
                action="custom"
                customIcon={SystemIcons.interface.link({
                  className: TABLE_ACTION_BUTTON.icon,
                })}
                customVariant="tablePower"
                tooltip="Hacer público"
                onClick={async () => {
                  try {
                    const updated = await reportFileService.makePublic(
                      r.informe_archivo_id,
                    );
                    setFiles((prev) =>
                      prev.map((f) =>
                        f.informe_archivo_id === updated.informe_archivo_id
                          ? updated
                          : f,
                      ),
                    );
                    showToast({
                      type: "success",
                      title: "Actualizado",
                      message: "El archivo ahora es público.",
                    });
                  } catch {
                    showToast({
                      type: "error",
                      title: "Error",
                      message: "No se pudo cambiar la visibilidad.",
                    });
                  }
                }}
              />
            )}
            <TableActionButton
              action="delete"
              tooltip="Eliminar"
              onClick={() => setDeleting(r)}
            />
          </div>
        ),
      },
    ],
    [firstColumn.width, showToast],
  );

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
        headerExtra={
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl shadow-md shadow-rojo-una/10 bg-rojo-una hover:bg-rojo-una-2 text-blanco-una"
              disabled={!processId}
              onClick={() => {
                setUploadArchivos([]);
                setShowUploadModal(true);
              }}
            >
              Subir
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap border-b border-gris-light mb-6 gap-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery("");
            }}
            className={cn(
              "px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              activeTab === tab
                ? "border-rojo-una-2 text-rojo-una-2"
                : "border-transparent text-gris-una hover:text-negro-una-2",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {processId && (
        <div className="flex justify-end mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nombre de informe..."
          />
        </div>
      )}

      {!processId && (
        <Card className="mb-6 p-12 flex flex-col items-center justify-center text-center bg-gris-fondo/30 border-dashed animate-in fade-in duration-700">
          <div className="w-20 h-20 rounded-full bg-gris-claro/30 flex items-center justify-center mb-4">
            <SystemIcons.interface.informationCircle className="w-10 h-10 text-gris-una" />
          </div>
          <h3
            className={cn(
              "text-xl font-bold text-negro-una",
              TYPOGRAPHY.pageSubtitle,
            )}
          >
            Seleccione un proceso
          </h3>
          <p className={cn("mt-2 text-gris-una max-w-md", TYPOGRAPHY.body)}>
            Para gestionar los informes de acreditación, primero debe
            seleccionar una carrera, ciclo y proceso en el filtro superior.
          </p>
        </Card>
      )}

      {processId && (
        <DataTable<ReportFileRow>
          data={
            files.filter(
              (f) =>
                f.tipo === activeTab &&
                f.nombre_original
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()),
            ) as ReportFileRow[]
          }
          columns={columns}
          searchable={false}
          emptyMessage={
            isLoading
              ? "Cargando informes..."
              : "No hay informes registrados para esta categoría."
          }
        />
      )}

      {/* Modal de Carga */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => !isUploading && setShowUploadModal(false)}
        title="Subir Informes de Acreditación"
        subtitle="Seleccione los documentos oficiales que corresponden a los informes de acreditación."
        size="lg"
        footerButtons={
          <>
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              disabled={isUploading}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={uploadArchivos.length === 0}
              isLoading={isUploading}
              onClick={() => void handleUpload()}
              className="rounded-xl shadow-md shadow-rojo-una/10"
            >
              Comenzar Carga
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="bg-azul-una/5 border border-azul-una/20 p-4 rounded-xl flex gap-3">
            <SystemIcons.interface.informationCircle className="w-5 h-5 text-azul-una shrink-0 mt-0.5" />
            <p className={cn("text-azul-una-dark", TYPOGRAPHY.table.helper)}>
              Puede subir hasta 5 archivos simultáneamente. Los formatos
              permitidos incluyen PDF, Word y Excel, con un tamaño máximo de 50
              MB por archivo.
            </p>
          </div>

          <div className="space-y-2">
            <p
              className={cn(
                "font-bold text-negro-una mb-2 flex items-center gap-2",
                TYPOGRAPHY.form.label,
              )}
            >
              <SystemIcons.interface.uploadArrow className="w-4 h-4" />
              Informes a subir
            </p>
            <DropZone
              onFilesSelected={(selected) =>
                setUploadArchivos((prev) => [...prev, ...selected].slice(0, 5))
              }
              maxFiles={5}
              hint="Arrastre informes aquí o haga clic para seleccionar"
            />
          </div>

          {uploadArchivos.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <p
                className={cn(
                  "text-xs font-bold text-gris-una uppercase tracking-wider",
                )}
              >
                Lista de informes ({uploadArchivos.length}/5)
              </p>
              <ul className="space-y-2">
                {uploadArchivos.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-3 bg-gris-fondo p-3 rounded-xl border border-gris-claro group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blanco-una flex items-center justify-center border border-gris-claro shrink-0">
                        <SystemIcons.navigation.reports className="w-4 h-4 text-gris-una" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-negro-una truncate">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-gris-una">
                          {(f.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-2 text-gris-una hover:text-rojo-una hover:bg-rojo-una/5 rounded-lg transition-colors"
                      onClick={() =>
                        setUploadArchivos((prev) =>
                          prev.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <SystemIcons.interface.closeCircle className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Detalle */}
      <Modal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailRecord(null);
        }}
        title="Detalles del Archivo"
        variant="info"
        size="lg"
        footerButtons={
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setDetailOpen(false);
              setDetailRecord(null);
            }}
          >
            Cerrar
          </Button>
        }
      >
        {detailLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-azul-una/20 border-t-azul-una rounded-full animate-spin mb-4" />
            <p className={cn("text-gris-una", TYPOGRAPHY.body)}>
              Cargando información...
            </p>
          </div>
        ) : detailRecord ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gris-una uppercase tracking-widest">
                  Nombre Original
                </p>
                <p className="text-sm font-bold text-negro-una break-all">
                  {detailRecord.nombre_original}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gris-una uppercase tracking-widest">
                  Tamaño
                </p>
                <p className="text-sm font-medium text-negro-una">
                  {detailRecord.tamanio && detailRecord.tamanio > 0
                    ? `${(detailRecord.tamanio / 1024 / 1024).toFixed(2)} MB`
                    : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gris-una uppercase tracking-widest">
                  Fecha de Subida
                </p>
                <p className="text-sm font-medium text-negro-una">
                  {detailRecord.fecha_subida
                    ? formatDate(detailRecord.fecha_subida)
                    : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gris-una uppercase tracking-widest">
                  Visibilidad
                </p>
                <div>
                  <StatusBadge
                    label={detailRecord.is_publico ? "Público" : "Privado"}
                    colorClasses={
                      detailRecord.is_publico
                        ? BADGE_COLORS.verde.colorClasses
                        : BADGE_COLORS.gris.colorClasses
                    }
                  />
                </div>
              </div>
            </div>

            {detailRecord.url_publica && (
              <div className="pt-4 border-t border-gris-claro">
                <p className="text-sm font-bold text-negro-una mb-2">
                  enlace publico
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gris-fondo p-3 rounded-xl border border-gris-claro text-xs font-mono truncate text-negro-una-2">
                    {detailRecord.url_publica}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-xl bg-azul-una hover:bg-azul-una-2 text-blanco-una px-3"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        detailRecord.url_publica!,
                      );
                      showToast({
                        type: "success",
                        title: "Copiado",
                        message: "Enlace copiado al portapapeles",
                      });
                    }}
                  >
                    <SystemIcons.actions.copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar Archivo"
        itemName={deleting?.nombre_original ?? ""}
        confirmLabel="Eliminar Archivo"
        variant="danger"
        isLoading={isDeleting}
        footerMeta="Esta acción no se puede deshacer. El archivo será removido permanentemente del informe."
      />
    </ScreenContainer>
  );
};

export default AccreditationReportAdminPage;
