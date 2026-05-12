import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import type {
  DataTableColumn,
  ExpandableChildItem,
} from '@/Components/Ui/Table/DataTable';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { fileService } from '@/Services/FileService';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { axiosInstance } from '@/Config/axios';
import { useToast } from '@/Context/ToastContext';
import { formatDate } from '@/Utils/DateUtils';
import type { EvidenceAssignment } from '@/Types/EvidenceAssignmentTypes';
import type { FlexibleAssignmentItem } from '@/Types/EvidenceAssignment';
import type {
  Criterio,
  EvidenceApprovalItem,
  EvidenceApprovalStatus,
} from './BlockApprovalTable';

const EVIDENCE_STATUS_BADGE: Record<
  EvidenceApprovalStatus,
  { label: string; colorClasses: string }
> = {
  pendiente: { label: 'Pendiente', colorClasses: 'text-warning-dark bg-warning-ring' },
  aprobado: { label: 'Aprobado', colorClasses: 'text-verde-dark bg-verde-ring' },
  rechazado: { label: 'Rechazado', colorClasses: 'text-error-dark bg-error-ring' },
};

const normalizeEvidenceStatus = (value: unknown): EvidenceApprovalStatus => {
  if (typeof value !== 'string') return 'pendiente';

  const normalized = value.trim().toLowerCase();
  if (normalized === 'aprobado') return 'aprobado';
  if (normalized === 'rechazado') return 'rechazado';
  if (normalized === 'pendiente') return 'pendiente';

  return 'pendiente';
};

const parseTimestamp = (value: unknown): number => {
  if (typeof value !== 'string') return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const normalizeAssignmentStatus = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const isCompletedAssignmentStatus = (value: unknown): boolean =>
  normalizeAssignmentStatus(value).startsWith('completad');

const hasCurrentDecision = (
  decisionUpdatedAt: unknown,
  assignmentUpdatedAt: unknown,
): boolean => {
  const assignmentTs = parseTimestamp(assignmentUpdatedAt);
  if (assignmentTs <= 0) return true;

  const decisionTs = parseTimestamp(decisionUpdatedAt);
  if (decisionTs <= 0) return false;

  return decisionTs >= assignmentTs;
};

interface CriterionEvidencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterio: Criterio | null;
  evidencias: EvidenceApprovalItem[];
  loading: boolean;
  isFlexible: boolean;
  procesoId: number | null;
  onAprobarEvidencia: (criterio: Criterio, evidencia: EvidenceApprovalItem) => void;
  onRechazarEvidencia: (criterio: Criterio, evidencia: EvidenceApprovalItem) => void;
}

interface ResponsibleInfo {
  usuario_id: number | null;
  nombre: string | null;
}

interface ResourceItem {
  archivo_id: number;
  tipo: 'archivo' | 'enlace';
  nombre_original: string;
  fecha_subida: string | null;
  url?: string | null;
  source: 'traditional' | 'flexible';
  usuario_id?: number | null;
  autor_nombre?: string | null;
}

interface EvidenceDisplayRow extends Record<string, unknown> {
  rowKey: string;
  evidencia: EvidenceApprovalItem;
  responsable: ResponsibleInfo;
}

const buildResourceName = (file: Partial<ResourceItem> & { archivo_id: number }): string => {
  if (typeof file.nombre_original === 'string' && file.nombre_original.trim().length > 0) {
    return file.nombre_original;
  }
  return `Documento ${file.archivo_id}`;
};

const normalizeText = (value?: string | null): string =>
  (value ?? '').trim().toLowerCase();

const dedupeTraditionalAssignments = (
  assignments: EvidenceAssignment[],
): EvidenceAssignment[] => {
  const byUser = new Map<number, EvidenceAssignment>();
  assignments.forEach((assignment) => {
    const previous = byUser.get(assignment.usuario_id);
    const currentUpdatedAt = parseTimestamp(
      assignment.updated_at ?? assignment.fecha_asignacion,
    );
    const previousUpdatedAt = parseTimestamp(
      previous?.updated_at ?? previous?.fecha_asignacion,
    );

    if (!previous || currentUpdatedAt >= previousUpdatedAt) {
      byUser.set(assignment.usuario_id, assignment);
    }
  });
  return Array.from(byUser.values());
};

const dedupeFlexibleAssignments = (
  assignments: FlexibleAssignmentItem[],
): FlexibleAssignmentItem[] => {
  const byUser = new Map<number, FlexibleAssignmentItem>();
  assignments.forEach((assignment) => {
    const previous = byUser.get(assignment.usuario_id);
    const currentUpdatedAt = parseTimestamp(
      assignment.updated_at ?? assignment.fecha_asignacion,
    );
    const previousUpdatedAt = parseTimestamp(
      previous?.updated_at ?? previous?.fecha_asignacion,
    );

    if (!previous || currentUpdatedAt >= previousUpdatedAt) {
      byUser.set(assignment.usuario_id, assignment);
    }
  });
  return Array.from(byUser.values());
};

const EvidenceDocumentsChildrenPanel: React.FC<{
  evidenciaId: number;
  isFlexible: boolean;
  procesoId: number | null;
  responsable: ResponsibleInfo;
}> = ({ evidenciaId, isFlexible, procesoId, responsable }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      if (isFlexible) {
        if (!procesoId) {
          setResources([]);
          return;
        }

        const files = await evidenceAssignmentService.getElementFiles(evidenciaId, procesoId);
        let mapped: ResourceItem[] = files.map((file: any) => ({
          archivo_id: file.archivo_id,
          tipo: file.tipo === 'enlace' ? 'enlace' : 'archivo',
          nombre_original: buildResourceName(file),
          fecha_subida: typeof file.fecha_subida === 'string' ? file.fecha_subida : null,
          url: file.url ?? null,
          source: 'flexible',
          usuario_id:
            typeof file.usuario_id === 'number'
              ? file.usuario_id
              : (typeof file.autor?.id === 'number' ? file.autor.id : null),
          autor_nombre: typeof file.autor?.nombre === 'string' ? file.autor.nombre : null,
        }));

        if (responsable.usuario_id !== null) {
          mapped = mapped.filter((file) => {
            if (file.usuario_id === responsable.usuario_id) {
              return true;
            }
            return (
              normalizeText(file.autor_nombre) === normalizeText(responsable.nombre)
            );
          });
        } else if (responsable.nombre) {
          mapped = mapped.filter(
            (file) => normalizeText(file.autor_nombre) === normalizeText(responsable.nombre),
          );
        }

        setResources(mapped);
      } else {
        const files = await fileService.listFiles({ evidencia_id: evidenciaId });
        let mapped: ResourceItem[] = files.map((file) => ({
          archivo_id: file.archivo_id,
          tipo: file.tipo,
          nombre_original: buildResourceName(file),
          fecha_subida: file.fecha_subida ?? null,
          url: file.url ?? null,
          source: 'traditional',
          usuario_id: file.usuario_id,
          autor_nombre: file.usuario?.nombre_completo ?? null,
        }));

        if (responsable.usuario_id !== null) {
          mapped = mapped.filter((file) => file.usuario_id === responsable.usuario_id);
        }

        setResources(mapped);
      }
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [evidenciaId, isFlexible, procesoId, responsable]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const handleOpenLink = (url?: string | null) => {
    if (!url) {
      showToast({
        type: 'warning',
        title: 'Enlace no disponible',
        message: 'No se encontro URL para este recurso.',
      });
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (resource: ResourceItem) => {
    if (resource.tipo !== 'archivo') return;

    const endpoint =
      resource.source === 'flexible'
        ? `/elementos-archivos/${resource.archivo_id}/download`
        : `/archivos/${resource.archivo_id}/download`;

    try {
      const response = await axiosInstance.get(endpoint, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = resource.nombre_original;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      showToast({
        type: 'error',
        title: 'Error al descargar',
        message: 'No se pudo descargar el recurso seleccionado.',
      });
    }
  };

  return (
    <div className="rounded-md border border-gris-light/80 bg-gris-light/20 px-2 py-2 space-y-1.5">
      {loading ? (
        <div className="relative min-h-18">
          <LoadingSpinner variant="loader" />
        </div>
      ) : resources.length > 0 ? (
        resources.map((resource) => (
          <div
            key={resource.archivo_id}
            className="flex items-center justify-between gap-2 rounded-md border border-gris-light bg-white px-2 py-1.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              {resource.tipo === 'enlace' ? (
                <SystemIcons.interface.link className="size-4 text-info shrink-0" />
              ) : (
                <SystemIcons.modal.document className="size-4 text-info shrink-0" />
              )}
              <div className="min-w-0">
                <p
                  className={`truncate text-negro-una-2 ${TYPOGRAPHY.table.helper}`}
                  title={resource.nombre_original}
                >
                  {resource.nombre_original}
                </p>
                <p className={`text-gris-una ${TYPOGRAPHY.table.helper}`}>
                  {formatDate(resource.fecha_subida)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
              {resource.tipo === 'enlace' ? (
                <TableActionButton
                  action="view"
                  tooltip="Abrir enlace"
                  onClick={() => handleOpenLink(resource.url)}
                />
              ) : (
                <TableActionButton
                  action="custom"
                  customIcon={<SystemIcons.actions.download className="size-4" />}
                  customVariant="tablePower"
                  tooltip="Descargar archivo"
                  onClick={() => handleDownload(resource)}
                />
              )}
            </div>
          </div>
        ))
      ) : (
        <p className={`text-gris-una px-1 ${TYPOGRAPHY.table.helper}`}>
          Este responsable no tiene documentos adjuntos para esta evidencia.
        </p>
      )}
    </div>
  );
};

export const CriterionEvidencesModal: React.FC<CriterionEvidencesModalProps> = ({
  isOpen,
  onClose,
  criterio,
  evidencias,
  loading,
  isFlexible,
  procesoId,
  onAprobarEvidencia,
  onRechazarEvidencia,
}) => {
  const [displayRows, setDisplayRows] = useState<EvidenceDisplayRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);

  useEffect(() => {
    if (!isOpen || !criterio) {
      setDisplayRows([]);
      return;
    }

    let active = true;

    const buildRows = async () => {
      setLoadingRows(true);
      try {
        const rows: EvidenceDisplayRow[] = [];
        const criterionIsIncompleto = criterio.estado_aprobacion === 'incompleto';
        const uniqueEvidences = new Map<number, EvidenceApprovalItem>();
        evidencias.forEach((evidencia) => {
          if (!uniqueEvidences.has(evidencia.evidencia_id)) {
            uniqueEvidences.set(evidencia.evidencia_id, evidencia);
          }
        });

        for (const evidencia of uniqueEvidences.values()) {
          if (isFlexible) {
            if (!procesoId) {
              const fallbackDecision =
                typeof evidencia.asignacion?.usuario_id === 'number'
                  ? evidencia.approvals_by_user?.[String(evidencia.asignacion.usuario_id)]
                  : undefined;
              rows.push({
                rowKey: `${evidencia.evidencia_id}-sin-responsable`,
                evidencia: {
                  ...evidencia,
                  approval_status:
                    fallbackDecision?.approval_status ??
                    evidencia.approval_status ??
                    'pendiente',
                  comentario_rechazo:
                    fallbackDecision?.comentario_rechazo ?? null,
                },
                responsable: {
                  usuario_id: evidencia.asignacion?.usuario_id ?? null,
                  nombre: evidencia.asignacion?.usuario_nombre ?? null,
                },
              });
              continue;
            }

            const inlineAssignments = (evidencia.responsables_asignados ?? [])
              .filter((assignment) => assignment.proceso_id === undefined || assignment.proceso_id === procesoId)
              .map((assignment) => ({
                usuario_id: assignment.usuario_id,
                estado: assignment.estado,
                fecha_limite: assignment.fecha_limite,
                elemento_asignacion_id: assignment.asignacion_id,
                updated_at: assignment.updated_at,
                user: {
                  nombre: assignment.usuario_nombre ?? null,
                },
              }));

            let uniqueAssignments: Array<{
              usuario_id: number;
              estado: string;
              fecha_limite: string | null;
              elemento_asignacion_id?: number;
              updated_at?: string | null;
              user?: {
                nombre?: string | null;
              };
            }> = inlineAssignments;

            if (uniqueAssignments.length === 0) {
              const assignments = await evidenceAssignmentService
                .getElementAssignmentsByElement(evidencia.evidencia_id, procesoId)
                .catch(() => []);

              const processAssignments = assignments.filter(
                (assignment) => assignment.proceso_id === procesoId,
              );
              uniqueAssignments = dedupeFlexibleAssignments(processAssignments);
            }

            if (uniqueAssignments.length > 0) {
              uniqueAssignments.forEach((assignment) => {
                const decision = evidencia.approvals_by_user?.[String(assignment.usuario_id)];
                const currentDecision =
                  decision
                  && hasCurrentDecision(decision.updated_at, assignment.updated_at)
                    ? decision
                    : undefined;

                const currentStatus = normalizeEvidenceStatus(
                  currentDecision?.approval_status ?? evidencia.approval_status,
                );
                const shouldInclude =
                  isCompletedAssignmentStatus(assignment.estado)
                  || currentStatus === 'rechazado';

                if (!shouldInclude) return;

                rows.push({
                  rowKey: `${evidencia.evidencia_id}-${assignment.usuario_id}`,
                  evidencia: {
                    ...evidencia,
                    approval_status: currentDecision?.approval_status ?? currentStatus,
                    comentario_rechazo:
                      currentDecision?.comentario_rechazo
                      ?? (currentStatus === 'rechazado'
                        ? (evidencia.comentario_rechazo ?? null)
                        : null),
                    asignacion: {
                      estado: assignment.estado,
                      fecha_limite: assignment.fecha_limite,
                      usuario_id: assignment.usuario_id,
                      usuario_nombre:
                        assignment.user?.nombre ??
                        evidencia.asignacion?.usuario_nombre ??
                        null,
                    },
                    asignacion_id: assignment.elemento_asignacion_id ?? evidencia.asignacion_id,
                  },
                  responsable: {
                    usuario_id: assignment.usuario_id,
                    nombre: assignment.user?.nombre ?? null,
                  },
                });
              });
              continue;
            }
          } else {
            const assignments = await evidenceAssignmentService
              .getAssignmentsByEvidence(evidencia.evidencia_id)
              .catch(() => []);

            const processAssignments = procesoId
              ? assignments.filter(
                  (assignment) => assignment.proceso_id === procesoId,
                )
              : assignments;
            const uniqueAssignments = dedupeTraditionalAssignments(processAssignments);

            if (uniqueAssignments.length > 0) {
              uniqueAssignments.forEach((assignment) => {
                const decision = evidencia.approvals_by_user?.[String(assignment.usuario_id)];
                const currentDecision =
                  decision
                  && hasCurrentDecision(decision.updated_at, assignment.updated_at)
                    ? decision
                    : undefined;

                const currentStatus = normalizeEvidenceStatus(
                  currentDecision?.approval_status ?? evidencia.approval_status,
                );
                const shouldInclude =
                  isCompletedAssignmentStatus(assignment.estado)
                  || currentStatus === 'rechazado';

                if (!shouldInclude) return;

                rows.push({
                  rowKey: `${evidencia.evidencia_id}-${assignment.usuario_id}`,
                  evidencia: {
                    ...evidencia,
                    approval_status: currentDecision?.approval_status ?? currentStatus,
                    comentario_rechazo:
                      currentDecision?.comentario_rechazo
                      ?? (currentStatus === 'rechazado'
                        ? (evidencia.comentario_rechazo ?? null)
                        : null),
                    asignacion: {
                      estado: assignment.estado,
                      fecha_limite: assignment.fecha_limite,
                      usuario_id: assignment.usuario_id,
                      usuario_nombre:
                        assignment.usuario?.nombre ??
                        evidencia.asignacion?.usuario_nombre ??
                        null,
                    },
                    asignacion_id:
                      assignment.evidencia_asignacion_id ?? evidencia.asignacion_id,
                  },
                  responsable: {
                    usuario_id: assignment.usuario_id,
                    nombre:
                      assignment.usuario?.nombre ??
                      evidencia.asignacion?.usuario_nombre ??
                      null,
                  },
                });
              });
              continue;
            }
          }

          const fallbackDecision =
            typeof evidencia.asignacion?.usuario_id === 'number'
              ? evidencia.approvals_by_user?.[String(evidencia.asignacion.usuario_id)]
              : undefined;

          const currentFallbackDecision =
            fallbackDecision
            && hasCurrentDecision(fallbackDecision.updated_at, evidencia.asignacion?.updated_at)
              ? fallbackDecision
              : undefined;

          const fallbackStatus = normalizeEvidenceStatus(
            currentFallbackDecision?.approval_status ?? evidencia.approval_status,
          );

          const fallbackIsReviewable =
            !evidencia.asignacion
            || isCompletedAssignmentStatus(evidencia.asignacion.estado)
            || fallbackStatus === 'rechazado';

          if (!fallbackIsReviewable) {
            continue;
          }

          rows.push({
            rowKey: `${evidencia.evidencia_id}-${evidencia.asignacion?.usuario_id ?? 'sin-responsable'}`,
            evidencia: {
              ...evidencia,
              approval_status:
                currentFallbackDecision?.approval_status ??
                fallbackStatus,
              comentario_rechazo:
                currentFallbackDecision?.comentario_rechazo
                ?? (fallbackStatus === 'rechazado'
                  ? (evidencia.comentario_rechazo ?? null)
                  : null),
            },
            responsable: {
              usuario_id: evidencia.asignacion?.usuario_id ?? null,
              nombre: evidencia.asignacion?.usuario_nombre ?? null,
            },
          });
        }

        if (active) {
          setDisplayRows(rows);
        }
      } finally {
        if (active) {
          setLoadingRows(false);
        }
      }
    };

    void buildRows();

    return () => {
      active = false;
    };
  }, [isOpen, criterio, evidencias, isFlexible, procesoId]);

  if (!criterio) return null;

  const blockIsApproved = criterio.estado_aprobacion === 'aprobado';
  const blockIsRejected = criterio.estado_aprobacion === 'rechazado';
  const blockIsIncompleto = criterio.estado_aprobacion === 'incompleto';
  const showLoading = loading || loadingRows;
  const emptyMessage = isFlexible
    ? 'No hay fuentes asociadas para revisar en este bloque.'
    : 'No hay evidencias asociadas para revisar en este bloque.';

  const evidenceColumns: DataTableColumn<EvidenceDisplayRow>[] = [
      {
        key: 'evidencia',
        header: isFlexible ? 'Fuente' : 'Evidencia',
        align: 'left',
        render: (_, row) => {
          const evidencia = row.evidencia;
          const evidenceStatus = normalizeEvidenceStatus(evidencia.approval_status);

          return (
            <div className="min-w-0">
              <p
                className={`truncate text-gris-una ${TYPOGRAPHY.table.helper}`}
                title={`${evidencia.nomenclatura} - ${evidencia.descripcion}`}
              >
                <span className="font-semibold text-negro-una">
                  {evidencia.nomenclatura}
                </span>
                <span> - {evidencia.descripcion}</span>
              </p>

              {evidenceStatus === 'rechazado' && evidencia.comentario_rechazo && (
                <p
                  className={`mt-1 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-1 ${TYPOGRAPHY.table.helper}`}
                  title={evidencia.comentario_rechazo}
                >
                  <span className="font-semibold text-error-dark whitespace-nowrap">Motivo:</span>
                  <span className="text-gris-una-2 wrap-anywhere whitespace-pre-line line-clamp-3">
                    {evidencia.comentario_rechazo}
                  </span>
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: 'responsable',
        header: 'Responsable',
        align: 'left',
        render: (_, row) => (
          <p className={`text-gris-una ${TYPOGRAPHY.table.helper}`}>
            {row.responsable.nombre ?? 'Sin responsable identificado'}
          </p>
        ),
      },
      {
        key: 'estado',
        header: 'Estado',
        align: 'left',
        render: (_, row) => {
          const evidenceStatus = normalizeEvidenceStatus(row.evidencia.approval_status);
          const statusConfig = EVIDENCE_STATUS_BADGE[evidenceStatus];

          return (
            <StatusBadge
              label={statusConfig.label}
              colorClasses={statusConfig.colorClasses}
            />
          );
        },
      },
      {
        key: 'acciones',
        header: 'Acciones',
        align: 'center',
        render: (_, row) => {
          const evidencia = row.evidencia;
          const evidenceStatus = normalizeEvidenceStatus(evidencia.approval_status);
          const isLocked = evidenceStatus === 'aprobado' && blockIsIncompleto;
          const canApprove =
            !blockIsApproved && !blockIsRejected && !isLocked && evidenceStatus === 'pendiente';
          const canReject =
            !blockIsApproved && !blockIsRejected && !isLocked && evidenceStatus === 'pendiente';

          return (
            <div
              className="flex items-center justify-center gap-1"
              onClick={(event) => event.stopPropagation()}
            >
              <ButtonWithTooltip
                variant="tablePower"
                size="sm"
                tooltip={
                  blockIsRejected
                    ? 'Bloque rechazado: acciones bloqueadas'
                    : blockIsApproved
                      ? 'Bloque aprobado: acciones bloqueadas'
                    : isLocked
                    ? `${isFlexible ? 'Elemento' : 'Evidencia'} aprobada (bloqueada)`
                    : evidenceStatus === 'rechazado'
                      ? 'Ya rechazada'
                    : canApprove
                      ? `Aprobar ${isFlexible ? 'elemento' : 'evidencia'}`
                      : 'Ya aprobada'
                }
                tooltipPosition="left"
                disabled={!canApprove}
                onClick={() => onAprobarEvidencia(criterio, evidencia)}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.interface.checkCircle className="size-4" />
              </ButtonWithTooltip>

              <ButtonWithTooltip
                variant="tableDelete"
                size="sm"
                tooltip={
                  blockIsRejected
                    ? 'Bloque rechazado: acciones bloqueadas'
                    : evidenceStatus === 'aprobado'
                      ? `${isFlexible ? 'Elemento' : 'Evidencia'} ya aprobado`
                    : evidenceStatus === 'rechazado'
                      ? 'Ya rechazada'
                    : isLocked
                    ? `${isFlexible ? 'Elemento' : 'Evidencia'} aprobada (bloqueada)`
                    : canReject
                      ? `Rechazar ${isFlexible ? 'elemento' : 'evidencia'}`
                      : 'Acción no disponible'
                }
                tooltipPosition="left"
                disabled={!canReject}
                onClick={() => onRechazarEvidencia(criterio, evidencia)}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.interface.xCircle className="size-4" />
              </ButtonWithTooltip>
            </div>
          );
        },
      },
    ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFlexible ? 'Fuentes asociadas del bloque' : 'Evidencias asociadas del bloque'}
      subtitle={`${criterio.nomenclatura} - ${criterio.descripcion}`}
      variant="neutral"
      heroIcon={<SystemIcons.actions.list className="size-5 text-blanco-una" />}
      size="lg"
      maxHeight="full"
      closable
      showCancel={false}
      showConfirm={false}
    >
      <div className="px-1 py-2">
        <DataTable<EvidenceDisplayRow>
          title=""
          searchable={false}
          loading={showLoading}
          data={displayRows}
          columns={evidenceColumns}
          getRowKey={(item) => item.rowKey}
          emptyMessage={emptyMessage}
          unstyled
          expandableRow={(row): ExpandableChildItem[] => [
            {
              key: `docs-${row.rowKey}`,
              noBorder: true,
              content: (
                <EvidenceDocumentsChildrenPanel
                  evidenciaId={row.evidencia.evidencia_id}
                  isFlexible={isFlexible}
                  procesoId={procesoId}
                  responsable={row.responsable}
                />
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};
