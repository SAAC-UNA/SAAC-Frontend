/**
 * EvidenceDetailsModal - Modal para mostrar los detalles completos de una evidencia
 *
 * Muestra información detallada de la evidencia incluyendo:
 * - Información básica (criterio, descripción, evidencias asociadas)
 * - Recursos disponibles (archivos y enlaces) agrupados por responsable
 * - Roles con acceso
 */

import React, { useState, useEffect } from "react";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import {
  DataTable,
  type DataTableColumn,
  ExpandableChildRow,
  type ExpandableChildItem,
} from "@/Components/Ui/Table/DataTable";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import {
  FileRowContent,
  FileDownloadAction,
  FileDeleteAction,
} from "@/Components/Ui/Upload/FileList";
import { LoadingSpinner } from "@/Components/Ui/Feedback/Loading";
import { fileService } from "@/Services/FileService";
import {
  evidenceSearchService,
  mapBackendToFrontend,
} from "@/Services/EvidenceSearchService";
import { evidenceAssignmentService } from "@/Services/EvidenceAssignmentService";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import type { FileModel } from "@/Types/FileTypes";
import type { AssignmentStatus } from "@/Types/EvidenceAssignmentTypes";
import { type EvidenceSearchResult } from "@/Types/EvidenceSearchTypes";
import { useAuth } from "@/Context/AuthContext";
import { AdminFileUploadModal } from "./AdminFileUploadModal";
import { FeedbackModal } from "./FeedbackModal";
import { type FeedbackEstado } from "@/Services/FeedbackService";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { ICON_SIZES } from "@/Constants/Components";
import {
  ASSIGNMENT_STATUS_BADGE,
  ELEMENT_ASSIGNMENT_STATUS_BADGE,
  EVIDENCE_STATUS_BADGE,
  BADGE_COLORS,
} from "@/Constants/StatusBadges";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/Components/Ui/Feedback/Tooltip";
import { cn } from "@/Utils/ClassNames";
import { formatDate } from "@/Utils/DateUtils";
import { TABLE_COLUMN_WIDTHS } from "@/Constants/Components";

interface EvidenceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** ID del criterio (tradicional) o elemento (flexible) a mostrar. */
  criterioId: number | null;
  isFlexible?: boolean;
  /** Requerido en modo flexible para cargar archivos por elemento+proceso. */
  procesoId?: number | null;
}

interface FilesByUser extends Record<string, unknown> {
  usuario_id: number;
  nombre: string;
  email: string;
  archivos: FileModel[];
  fecha_asignacion: string | null;
  fecha_limite: string | null;
  estado_asignacion: AssignmentStatus | null;
}

interface EvidenciaResponsablesPanelAdminProps {
  evidenciaId: number;
  groups: FilesByUser[];
  loading: boolean;
  onDelete: (fileId: number) => Promise<void>;
  onUpload: (group: FilesByUser) => void;
}

const EvidenciaResponsablesPanelAdmin: React.FC<
  EvidenciaResponsablesPanelAdminProps
> = ({ groups, loading, onDelete, onUpload }) => {
  if (loading)
    return (
      <div className="relative min-h-[60px]">
        <LoadingSpinner variant="loader" size="sm" />
      </div>
    );
  if (groups.length === 0)
    return (
      <p className={`text-gris-una px-3 py-1.5 ${TYPOGRAPHY.table.helper}`}>
        Sin responsables asignados
      </p>
    );

  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const estadoRaw = group.estado_asignacion as string | null;
        const badgeConfig = estadoRaw
          ? (ASSIGNMENT_STATUS_BADGE[estadoRaw as AssignmentStatus] ?? ELEMENT_ASSIGNMENT_STATUS_BADGE[estadoRaw])
          : null;
        const fileItems: ExpandableChildItem[] = group.archivos.map((file) => ({
          key: String(file.archivo_id),
          content: <FileRowContent file={file} />,
          action: (
            <div className="flex gap-1">
              <FileDownloadAction file={file} />
              {onDelete && <FileDeleteAction file={file} onDelete={onDelete} />}
            </div>
          ),
        }));
        return (
          <ExpandableChildRow
            key={String(group.usuario_id)}
            item={{
              key: String(group.usuario_id),
              emptyChildrenMessage: "Sin archivos",
              children: fileItems,
              action: (
                <TableActionButton
                  action="uploadArrow"
                  tooltip="Subir archivo"
                  onClick={() => onUpload(group)}
                />
              ),
              content: (
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span
                    className={`font-normal text-negro-una-2 flex-1 min-w-0 truncate ${TYPOGRAPHY.table.helper}`}
                  >
                    {group.nombre as string}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`text-gris-una shrink-0 w-20 cursor-default ${TYPOGRAPHY.table.helper}`}
                      >
                        {formatDate(group.fecha_asignacion as string | null)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Fecha de asignación
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`text-gris-una shrink-0 w-20 cursor-default ${TYPOGRAPHY.table.helper}`}
                      >
                        {formatDate(group.fecha_limite as string | null)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">Fecha límite</TooltipContent>
                  </Tooltip>
                  <div className="shrink-0 w-24 flex items-center">
                    {badgeConfig && (
                      <StatusBadge
                        label={badgeConfig.label}
                        colorClasses={badgeConfig.colorClasses}
                      />
                    )}
                  </div>
                </div>
              ),
            }}
          />
        );
      })}
    </div>
  );
};

// Componentes locales de layout

const Separator: React.FC = () => (
  <div className="col-span-5 py-1">
    <hr className="border-gris-light" />
  </div>
);

export const EvidenceDetailsModal: React.FC<EvidenceDetailsModalProps> = ({
  isOpen,
  onClose,
  criterioId,
  isFlexible = false,
  procesoId,
}) => {
  const { canAccess } = useAuth();
  const isPrivileged = canAccess({
    requireAnyPermissions: ["archivos.make_public"],
  });
  const canRetroalimentar = canAccess({
    requireAnyPermissions: ["evidencias.edit"],
  });

  const [evidencias, setEvidencias] = useState<EvidenceSearchResult[]>([]);
  const [filesByEvidencia, setFilesByEvidencia] = useState<
    Map<number, FilesByUser[]>
  >(new Map());
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [adminUpload, setAdminUpload] = useState<{
    isOpen: boolean;
    evidenciaId: number;
    procesoId: number;
  }>({
    isOpen: false,
    evidenciaId: 0,
    procesoId: 0,
  });
  const [retroState, setRetroState] = useState<{
    isOpen: boolean;
    evidence: EvidenceSearchResult | null;
  }>({
    isOpen: false,
    evidence: null,
  });

  const criterio = evidencias[0] ?? null;

  const evidenceColumns: DataTableColumn<EvidenceSearchResult>[] = [
    {
      key: "evidencia",
      header: "Evidencia",
      align: "left",
      render: (_, item) => (
        <div className="flex flex-col">
          <div className="flex flex-row items-baseline gap-1.5">
            <p
              className={`font-sans antialiased font-bold leading-normal text-negro-una-2 shrink-0 ${TYPOGRAPHY.modal.body}`}
              title={item.nomenclatura}
            >
              {item.nomenclatura}
            </p>
            <p
              className={`font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.modal.body}`}
              title={item.descripcion}
            >
              {item.descripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "recursos",
      header: "Recursos",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => {
        const total = item.archivos_count + item.enlaces_count;
        return (
          <div className="flex items-start">
            {total > 0 ? (
              <StatusBadge
                label={`${total} ${total === 1 ? "recurso" : "recursos"}`}
                colorClasses={BADGE_COLORS.info.colorClasses}
              />
            ) : (
              <StatusBadge
                label="Sin recursos"
                colorClasses={BADGE_COLORS.slate.colorClasses}
              />
            )}
          </div>
        );
      },
    },
    {
      key: "estado",
      header: "Estado",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => (
        <div className="flex items-start">
          <StatusBadge
            label={EVIDENCE_STATUS_BADGE[item.estado].label}
            colorClasses={EVIDENCE_STATUS_BADGE[item.estado].colorClasses}
          />
        </div>
      ),
    },
    ...(canRetroalimentar
      ? [
          {
            key: "acciones_retro",
            header: "Retroalimentación",
            align: "left" as const,
            width: TABLE_COLUMN_WIDTHS.actions,
            render: (_: unknown, item: EvidenceSearchResult) => (
              <div className="flex items-center justify-center">
                <TableActionButton
                  action="comment"
                  tooltip={
                    item.estado === "Pendiente"
                      ? "Sin recursos para retroalimentar"
                      : "Retroalimentar evidencia"
                  }
                  disabled={item.estado === "Pendiente"}
                  onClick={() =>
                    setRetroState({ isOpen: true, evidence: item })
                  }
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (isOpen && criterioId) {
      loadAll();
    } else {
      setEvidencias([]);
      setFilesByEvidencia(new Map());
    }
  }, [isOpen, criterioId]);

  const reloadFilesForEvidencia = async (evidenciaId: number) => {
    if (isFlexible && criterioId && procesoId) {
      const [allFiles, flexAssignments] = await Promise.all([
        evidenceAssignmentService.getElementFiles(criterioId, procesoId).catch(() => []),
        evidenceAssignmentService.getElementAssignmentsByElement(criterioId, procesoId).catch(() => []),
      ]);
      const flexAssignmentMap = new Map(flexAssignments.map((a) => [a.usuario_id, a]));
      const filesByUser = new Map<number, FileModel[]>();
      allFiles.forEach((f) => {
        if (!filesByUser.has(f.usuario_id)) filesByUser.set(f.usuario_id, []);
        filesByUser.get(f.usuario_id)!.push(f);
      });
      setFilesByEvidencia((prev) => {
        const next = new Map(prev);
        for (const [evId, groups] of next.entries()) {
          const userId = groups[0]?.usuario_id ?? 0;
          const fa = flexAssignmentMap.get(userId);
          next.set(evId, [{
            ...groups[0],
            archivos: filesByUser.get(userId) ?? [],
            fecha_asignacion: fa?.created_at ?? null,
            fecha_limite: fa?.fecha_limite ?? null,
            estado_asignacion: (fa?.estado ?? null) as AssignmentStatus | null,
          }]);
        }
        return next;
      });
      return;
    }
    const [files, assignments] = await Promise.all([
      fileService.listFiles({ evidencia_id: evidenciaId }),
      evidenceAssignmentService
        .getAssignmentsByEvidence(evidenciaId)
        .catch(() => []),
    ]);
    const assignmentMap = new Map(
      assignments.map((a) => [
        a.usuario_id,
        {
          fecha_asignacion: a.fecha_asignacion,
          fecha_limite: a.fecha_limite ?? null,
          estado: a.estado,
        },
      ]),
    );
    const groupMap = new Map<number, FilesByUser>();
    files.forEach((f: FileModel) => {
      if (!groupMap.has(f.usuario_id)) {
        const asig = assignmentMap.get(f.usuario_id);
        groupMap.set(f.usuario_id, {
          usuario_id: f.usuario_id,
          nombre: f.usuario?.nombre_completo || `Usuario ${f.usuario_id}`,
          email: f.usuario?.email || "",
          archivos: [],
          fecha_asignacion: asig?.fecha_asignacion ?? null,
          fecha_limite: asig?.fecha_limite ?? null,
          estado_asignacion: asig?.estado ?? null,
        });
      }
      groupMap.get(f.usuario_id)!.archivos.push(f);
    });
    assignments.forEach((a) => {
      if (!groupMap.has(a.usuario_id)) {
        groupMap.set(a.usuario_id, {
          usuario_id: a.usuario_id,
          nombre: a.usuario?.nombre ?? `Usuario ${a.usuario_id}`,
          email: a.usuario?.email ?? "",
          archivos: [],
          fecha_asignacion: a.fecha_asignacion,
          fecha_limite: a.fecha_limite ?? null,
          estado_asignacion: a.estado,
        });
      }
    });
    setFilesByEvidencia((prev) => {
      const next = new Map(prev);
      next.set(evidenciaId, Array.from(groupMap.values()));
      return next;
    });
  };

  const handleDeleteFile = async (fileId: number) => {
    if (isFlexible) {
      await evidenceAssignmentService.deleteElementFile(fileId);
      await reloadFilesForEvidencia(0);
      return;
    }
    await fileService.deleteFile(fileId);
    for (const [evId, groups] of filesByEvidencia.entries()) {
      const found = groups.some((g) =>
        g.archivos.some((f) => f.archivo_id === fileId),
      );
      if (found) {
        await reloadFilesForEvidencia(evId);
        break;
      }
    }
  };

  const handleOpenUpload = (evidenciaId: number, group: FilesByUser) => {
    const procesoId = group.archivos.find((f) => f.proceso_id)?.proceso_id ?? 0;
    setAdminUpload({ isOpen: true, evidenciaId, procesoId });
  };

  const handleFeedbackSuccess = (
    evidenciaId: number,
    nuevoEstado: FeedbackEstado,
  ) => {
    setEvidencias((prev) =>
      prev.map((e) =>
        e.evidencia_id === evidenciaId ? { ...e, estado: nuevoEstado } : e,
      ),
    );
  };

  const loadAll = async () => {
    if (!criterioId) return;
    setLoadingFiles(true);
    try {
      const searchParams = isFlexible && procesoId
        ? { elemento_id: criterioId, proceso_id: procesoId, is_flexible: true }
        : { criterio: String(criterioId) };
      const response = await evidenceSearchService.search(
        searchParams,
        1,
        100,
      );
      const mapped = response.data.map(mapBackendToFrontend);
      setEvidencias(mapped);

      if (mapped.length > 0 && isPrivileged) {
        if (isFlexible && procesoId) {
          // Modo flexible: todos los archivos del elemento, agrupados por usuario
          const [allFiles, flexAssignments] = await Promise.all([
            evidenceAssignmentService.getElementFiles(criterioId, procesoId).catch(() => []),
            evidenceAssignmentService.getElementAssignmentsByElement(criterioId, procesoId).catch(() => []),
          ]);
          const flexAssignmentMap = new Map(flexAssignments.map((a) => [a.usuario_id, a]));
          const filesByUser = new Map<number, FileModel[]>();
          allFiles.forEach((f) => {
            if (!filesByUser.has(f.usuario_id)) filesByUser.set(f.usuario_id, []);
            filesByUser.get(f.usuario_id)!.push(f);
          });
          const flexMap = new Map<number, FilesByUser[]>();
          mapped.forEach((ev) => {
            const userId = ev.responsables[0]?.usuario_id ?? 0;
            const fa = flexAssignmentMap.get(userId);
            flexMap.set(ev.evidencia_id, [{
              usuario_id: userId,
              nombre: ev.responsables[0]?.nombre ?? `Usuario ${userId}`,
              email: ev.responsables[0]?.email ?? "",
              archivos: filesByUser.get(userId) ?? [],
              fecha_asignacion: fa?.created_at ?? null,
              fecha_limite: fa?.fecha_limite ?? null,
              estado_asignacion: (fa?.estado ?? null) as AssignmentStatus | null,
            }]);
          });
          setFilesByEvidencia(flexMap);
        } else {
        const [filesResults, assignmentsResults] = await Promise.all([
          Promise.all(
            mapped.map((ev) =>
              fileService.listFiles({ evidencia_id: ev.evidencia_id }),
            ),
          ),
          Promise.all(
            mapped.map((ev) =>
              evidenceAssignmentService
                .getAssignmentsByEvidence(ev.evidencia_id)
                .catch(() => []),
            ),
          ),
        ]);
        const map = new Map<number, FilesByUser[]>();
        mapped.forEach((ev, idx) => {
          const files = filesResults[idx];
          const assignments = assignmentsResults[idx];
          const assignmentMap = new Map(
            assignments.map((a) => [
              a.usuario_id,
              {
                fecha_asignacion: a.fecha_asignacion,
                fecha_limite: a.fecha_limite ?? null,
                estado: a.estado,
              },
            ]),
          );
          const groupMap = new Map<number, FilesByUser>();
          files.forEach((f: FileModel) => {
            if (!groupMap.has(f.usuario_id)) {
              const asig = assignmentMap.get(f.usuario_id);
              groupMap.set(f.usuario_id, {
                usuario_id: f.usuario_id,
                nombre: f.usuario?.nombre_completo || `Usuario ${f.usuario_id}`,
                email: f.usuario?.email || "",
                archivos: [],
                fecha_asignacion: asig?.fecha_asignacion ?? null,
                fecha_limite: asig?.fecha_limite ?? null,
                estado_asignacion: asig?.estado ?? null,
              });
            }
            groupMap.get(f.usuario_id)!.archivos.push(f);
          });
          assignments.forEach((a) => {
            if (!groupMap.has(a.usuario_id)) {
              groupMap.set(a.usuario_id, {
                usuario_id: a.usuario_id,
                nombre: a.usuario?.nombre ?? `Usuario ${a.usuario_id}`,
                email: a.usuario?.email ?? "",
                archivos: [],
                fecha_asignacion: a.fecha_asignacion,
                fecha_limite: a.fecha_limite ?? null,
                estado_asignacion: a.estado,
              });
            }
          });
          map.set(ev.evidencia_id, Array.from(groupMap.values()));
        });
        setFilesByEvidencia(map);
        } // end traditional
      }
    } catch (error) {
      console.error("Error al cargar datos del criterio:", error);
      setEvidencias([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  if (!criterioId) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalles del Entregable"
        subtitle={criterio?.criterio_nomenclatura}
        variant="info"
        size="xl"
        maxHeight="auto"
        heroIcon={
          <SystemIcons.modal.document
            className={`${ICON_SIZES.md} text-blanco-una`}
          />
        }
        showCancel={false}
        showConfirm={false}
      >
        {loadingFiles && evidencias.length === 0 ? (
          <div
            className={cn(
              "flex items-center justify-center py-12 text-gris-una",
              TYPOGRAPHY.modal.body,
            )}
          >
            Cargando información del entregable…
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-x-4 gap-y-3">
            {/* div1 — Nomenclatura + Descripción */}
            {criterio && (
              <div className="col-start-1 col-end-4 flex flex-col gap-0.5">
                <span
                  className={cn(
                    TYPOGRAPHY.modal.body,
                    "text-negro-una-2 font-semibold",
                  )}
                >
                  {criterio.criterio_nomenclatura}
                </span>
                <span className={cn(TYPOGRAPHY.modal.body, "text-gris-una-2")}>
                  {criterio.criterio_descripcion}
                </span>
              </div>
            )}

            {/* div2 — Evidencias asociadas (pequeño, derecha) */}
            {criterio && (
              <div className="col-start-4 col-end-6 flex flex-col items-start gap-0.5">
                <span
                  className={cn(
                    "uppercase tracking-wider font-semibold text-gris-una-2",
                    TYPOGRAPHY.modal.subtitle,
                  )}
                >
                  {isFlexible ? "Asignaciones" : "Evidencias asociadas"}
                </span>
                <span
                  className={cn(TYPOGRAPHY.modal.subtitle, "text-gris-una-2")}
                >
                  {evidencias.length}
                </span>
              </div>
            )}

            {criterio && <Separator />}

            {/* div3 — Roles con acceso */}
            {criterio &&
              criterio.roles_acceso &&
              criterio.roles_acceso.length > 0 && (
                <div className="col-span-5 flex flex-wrap gap-2">
                  {criterio.roles_acceso.map((rol) => (
                    <span
                      key={rol}
                      className={cn(
                        "inline-flex px-2.5 py-1 font-semibold rounded-full",
                        "bg-info-light text-info",
                        TYPOGRAPHY.badge,
                      )}
                    >
                      {rol}
                    </span>
                  ))}
                </div>
              )}

            {criterio &&
              criterio.roles_acceso &&
              criterio.roles_acceso.length > 0 && <Separator />}

            {/* div4 — Gestión de recursos (solo Superusuario / Administrador) */}
            {isPrivileged && (
              <div className="col-span-5">
                <DataTable
                  title=""
                  searchable={false}
                  loading={loadingFiles}
                  data={evidencias as any}
                  columns={evidenceColumns as any}
                  getRowKey={(item: any) => String(item.evidencia_id)}
                  emptyMessage="No hay evidencias para este criterio"
                  unstyled
                  expandableRow={(ev: any) => [
                    {
                      key: String((ev as EvidenceSearchResult).evidencia_id),
                      noBorder: true,
                      content: (
                        <EvidenciaResponsablesPanelAdmin
                          evidenciaId={
                            (ev as EvidenceSearchResult).evidencia_id
                          }
                          groups={
                            filesByEvidencia.get(
                              (ev as EvidenceSearchResult).evidencia_id,
                            ) ?? []
                          }
                          loading={false}
                          onDelete={handleDeleteFile}
                          onUpload={(group) =>
                            handleOpenUpload(
                              (ev as EvidenceSearchResult).evidencia_id,
                              group,
                            )
                          }
                        />
                      ),
                    },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {isPrivileged && (
        <AdminFileUploadModal
          isOpen={adminUpload.isOpen}
          onClose={() => setAdminUpload((prev) => ({ ...prev, isOpen: false }))}
          evidenciaId={adminUpload.evidenciaId}
          procesoId={adminUpload.procesoId}
          onSuccess={() => reloadFilesForEvidencia(adminUpload.evidenciaId)}
        />
      )}

      {canRetroalimentar && (
        <FeedbackModal
          isOpen={retroState.isOpen}
          onClose={() => setRetroState({ isOpen: false, evidence: null })}
          evidence={retroState.evidence}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </>
  );
};
