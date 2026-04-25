/**
 * Página mínima para probar los endpoints `informes-archivos` (HU archivos de informe).
 * Solo carga de archivos físicos (multipart). Usa el proceso del filtro global o un ID manual.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScreenContainer,
  PageHeader,
  Button,
  LoadingSpinner,
} from "@/Components/Ui/Index";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { BADGE_COLORS } from "@/Constants/StatusBadges";
import { TABLE_COLUMN_WIDTHS, ICON_SIZES } from "@/Constants/Components";
import { cn } from "@/Utils/ClassNames";
import { formatDate } from "@/Utils/DateUtils";
import { truncateText } from "@/Utils/TextUtils";
import { useToast } from "@/Context/ToastContext";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { Card } from "@/Components/Ui/Layout/Card";
import { FileUploader, FileUploadProgress } from "@/Components/Ui/Upload";
import type { FileUploadProgressItem } from "@/Components/Ui/Upload";
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

const ModalSeparator: React.FC = () => (
  <div className="col-span-5 py-1">
    <hr className="border-gray-200" />
  </div>
);

export const AccreditationReportAdminPage: React.FC = () => {
  const normalizeSearchText = (value: string): string =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

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
  const [uploadModalState, setUploadModalState] = useState<{
    selectedFiles: File[];
    uploadProgress: FileUploadProgressItem[];
    uploaderKey: number;
  }>({ selectedFiles: [], uploadProgress: [], uploaderKey: 0 });
  const [isUploading, setIsUploading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ReportFileApi | null>(null);

  const [deleting, setDeleting] = useState<ReportFileApi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedFiles = uploadModalState.selectedFiles;
  const uploadProgress = uploadModalState.uploadProgress;
  const uploaderKey = uploadModalState.uploaderKey;

  const canSubmitUpload = (): boolean => {
    if (!processId || isUploading) return false;
    return selectedFiles.length > 0;
  };

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
    setDetailRecord(row);
    setDetailLoading(true);
    try {
      const full = await reportFileService.show(row.informe_archivo_id);
      setDetailRecord(full);
    } catch {
      showToast({
        type: "error",
        title: "Error al cargar detalle",
        message: "No se pudo actualizar la información completa del archivo.",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!processId) return;
    if (selectedFiles.length === 0) {
      showToast({
        type: "warning",
        title: "Validación",
        message: "Seleccione al menos un archivo.",
      });
      return;
    }

    setIsUploading(true);
    setUploadModalState((prev) => ({
      ...prev,
      uploadProgress: selectedFiles.map((file) => ({
        file,
        status: "pending",
        progress: 0,
      })),
    }));

    try {
      setUploadModalState((prev) => ({
        ...prev,
        uploadProgress: prev.uploadProgress.map((item) => ({
          ...item,
          status: "uploading",
          progress: 50,
        })),
      }));

      await reportFileService.uploadFiles(processId, selectedFiles, activeTab);

      setUploadModalState((prev) => ({
        ...prev,
        uploadProgress: prev.uploadProgress.map((item) => ({
          ...item,
          status: "success",
          progress: 100,
        })),
      }));

      showToast({
        type: "success",
        title: "Carga exitosa",
        message: "Los archivos se han subido correctamente.",
      });
      setShowUploadModal(false);
      setUploadModalState((prev) => ({
        ...prev,
        selectedFiles: [],
        uploaderKey: prev.uploaderKey + 1,
      }));
      await loadFiles();
    } catch {
      setUploadModalState((prev) => ({
        ...prev,
        uploadProgress: prev.uploadProgress.map((item) => ({
          ...item,
          status: "error",
          progress: 0,
          error: "No se pudo completar la subida",
        })),
      }));

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
          <div className="flex flex-col">
            <div className="flex flex-row items-baseline gap-1.5">
              <p
                className={cn(
                  "font-bold leading-normal text-negro-una-2 shrink-0",
                  TYPOGRAPHY.table.cell,
                )}
                title={r.tipo}
              >
                {truncateText(r.tipo, firstColumn.maxLength)}
              </p>
              <p
                className={cn(
                  "font-bold leading-normal text-negro-una-2",
                  TYPOGRAPHY.table.cell,
                )}
                title={r.nombre_original}
              >
                {truncateText(r.nombre_original, firstColumn.maxLength)}
              </p>
            </div>
            <p className={cn("text-gris-una mt-1.5 -mb-0.5", TYPOGRAPHY.table.helper)}>
              {r.fecha_subida ? formatDate(r.fecha_subida) : "—"}
            </p>
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
              action="power"
              isActive={r.is_publico}
              tooltip={r.is_publico ? "Hacer privado" : "Hacer público"}
              onClick={async () => {
                try {
                  const updated = r.is_publico
                    ? await reportFileService.revokePublic(r.informe_archivo_id)
                    : await reportFileService.makePublic(r.informe_archivo_id);

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
                    message: r.is_publico
                      ? "El archivo ahora es privado."
                      : "El archivo ahora es público.",
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

            <TableActionButton
              action="custom"
              customIcon={SystemIcons.actions.copyLink({
                className: TABLE_ACTION_BUTTON.icon,
              })}
              customVariant="tableIndigo"
              tooltip={
                r.is_publico && r.url_publica
                  ? "Copiar enlace público"
                  : "Disponible cuando el archivo sea público"
              }
              disabled={!r.is_publico || !r.url_publica}
              onClick={async () => {
                if (!r.url_publica) return;
                try {
                  await navigator.clipboard.writeText(r.url_publica);
                  showToast({
                    type: "success",
                    title: "Copiado",
                    message: "Enlace público copiado al portapapeles.",
                  });
                } catch {
                  showToast({
                    type: "error",
                    title: "Error",
                    message: "No se pudo copiar el enlace público.",
                  });
                }
              }}
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

  const filteredFiles = useMemo(
    () =>
      files.filter((file) => {
        if (file.tipo !== activeTab) return false;

        const term = normalizeSearchText(searchQuery.trim());
        if (!term) return true;

        const visibilidad = file.is_publico ? "publico" : "privado";
        const fechaFormateada = file.fecha_subida ? formatDate(file.fecha_subida) : "";
        const fechaISO = file.fecha_subida ? file.fecha_subida.slice(0, 10) : "";

        return [file.nombre_original, visibilidad, fechaFormateada, fechaISO]
          .map((value) => normalizeSearchText(value ?? ""))
          .some((value) => value.includes(term));
      }),
    [activeTab, files, searchQuery],
  );

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
        headerExtra={
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {processId && (
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por nombre, visibilidad..."
              />
            )}
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl shadow-md shadow-rojo-una/10 bg-rojo-una hover:bg-rojo-una-2 text-blanco-una"
              disabled={!processId}
              onClick={() => {
                setUploadModalState((prev) => ({
                  ...prev,
                  selectedFiles: [],
                  uploadProgress: [],
                  uploaderKey: prev.uploaderKey + 1,
                }));
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
          data={filteredFiles as ReportFileRow[]}
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
        variant="upload"
        size="lg"
        footerMeta="Formatos permitidos: PDF, Word y Excel."
        footerButtons={
          <>
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              disabled={isUploading}
            >
              Cerrar
            </Button>
            {(selectedFiles.length > 0 || isUploading) && (
              <Button
                variant="primary"
                disabled={!canSubmitUpload()}
                isLoading={isUploading}
                onClick={() => void handleUpload()}
                className="rounded-xl shadow-md shadow-rojo-una/10"
              >
                Subir
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-6">
          {!processId && (
            <p className={cn("text-rojo-una", TYPOGRAPHY.modal.body)}>
              No se encontró un proceso activo. No es posible subir archivos.
            </p>
          )}

          {processId && (
            <>
          <div className="space-y-2">
            <p
              className={cn(
                "font-bold text-negro-una mb-2 flex items-center gap-2",
                TYPOGRAPHY.form.label,
              )}
            >
              Informes a subir
            </p>
            <FileUploader
              key={`report-file-uploader-${uploaderKey}`}
              onFilesSelected={(files) =>
                setUploadModalState((prev) => ({ ...prev, selectedFiles: files }))
              }
              maxFiles={5}
              disabled={isUploading}
            />
          </div>

          {uploadProgress.length > 0 && <FileUploadProgress files={uploadProgress} />}
            </>
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
        subtitle={detailRecord?.tipo ?? "Archivo de informe"}
        variant="info"
        size="lg"
        heroIcon={
          <SystemIcons.modal.document
            className={`${ICON_SIZES.md} text-blanco-una`}
          />
        }
        showCancel={false}
        showConfirm={false}
      >
        {!detailRecord && detailLoading ? (
          <div className="relative py-12 min-h-40">
            <LoadingSpinner variant="loader" />
            <p
              className={cn(
                "absolute bottom-6 left-1/2 -translate-x-1/2 text-gris-una whitespace-nowrap",
                TYPOGRAPHY.modal.body,
              )}
            >
              Cargando información del archivo...
            </p>
          </div>
        ) : detailRecord ? (
          <div className="grid grid-cols-5 gap-x-4 gap-y-3">
            <div className="col-start-1 col-end-4 flex flex-col gap-0.5">
              <span
                className={cn(
                  TYPOGRAPHY.modal.body,
                  "text-negro-una-2 font-semibold break-all",
                )}
              >
                {detailRecord.nombre_original}
              </span>
              {detailRecord.tipo_mime?.trim() ? (
                <span className={cn(TYPOGRAPHY.modal.body, "text-gris-una-2")}>
                  {detailRecord.tipo_mime}
                </span>
              ) : null}
            </div>

            <div className="col-start-4 col-end-6 flex flex-col items-start gap-0.5">
              <span
                className={cn(
                  "uppercase tracking-wider font-semibold text-gris-una-2",
                  TYPOGRAPHY.modal.subtitle,
                )}
              >
                Fecha de subida
              </span>
              <span className={cn(TYPOGRAPHY.modal.subtitle, "text-gris-una-2")}>
                {detailRecord.fecha_subida
                  ? `${formatDate(detailRecord.fecha_subida)} · ${new Date(detailRecord.fecha_subida).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "—"}
              </span>
            </div>

            <ModalSeparator />

            <div className="col-span-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p
                  className={cn(
                    "uppercase tracking-wider font-semibold text-gris-una-2",
                    TYPOGRAPHY.modal.subtitle,
                  )}
                >
                  Tamaño
                </p>
                <p className={cn(TYPOGRAPHY.modal.body, "text-negro-una-2") }>
                  {detailRecord.tamanio && detailRecord.tamanio > 0
                    ? `${(detailRecord.tamanio / 1024 / 1024).toFixed(2)} MB`
                    : "—"}
                </p>
              </div>

              <div className="space-y-1">
                <p
                  className={cn(
                    "uppercase tracking-wider font-semibold text-gris-una-2",
                    TYPOGRAPHY.modal.subtitle,
                  )}
                >
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

          </div>
        ) : null}
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar Archivo"
        itemName={deleting?.nombre_original ?? ""}
        confirmLabel="Sí, eliminar"
        variant="danger"
        isLoading={isDeleting}
        footerMeta="Esta acción no se puede deshacer."
      />
    </ScreenContainer>
  );
};

export default AccreditationReportAdminPage;
