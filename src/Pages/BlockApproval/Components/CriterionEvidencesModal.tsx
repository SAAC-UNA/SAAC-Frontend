import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
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

interface EvidenceDisplayRow {
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
    if (!byUser.has(assignment.usuario_id)) {
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
    if (!byUser.has(assignment.usuario_id)) {
      byUser.set(assignment.usuario_id, assignment);
    }
  });
  return Array.from(byUser.values());
};

const EvidenceDocumentsDropdown: React.FC<{
  evidenciaId: number;
  isFlexible: boolean;
  procesoId: number | null;
  responsable: ResponsibleInfo;
}> = ({ evidenciaId, isFlexible, procesoId, responsable }) => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ResourceItem[] | null>(null);

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

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && resources === null) {
      void loadResources();
    }
  };

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
    <div className="mt-2">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 text-gris-una hover:text-negro-una transition-colors"
      >
        {open ? (
          <SystemIcons.interface.chevronUp className="size-4" />
        ) : (
          <SystemIcons.interface.chevronDown className="size-4" />
        )}
        <span className={TYPOGRAPHY.table.helper}>
          {open ? 'Ocultar documentos del responsable' : 'Ver documentos del responsable'}
          {resources ? ` (${resources.length})` : ''}
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded-md border border-gris-light/80 bg-gris-light/20 px-2 py-2 space-y-1.5">
          {loading ? (
            <div className="relative min-h-[72px]">
              <LoadingSpinner variant="loader" />
            </div>
          ) : resources && resources.length > 0 ? (
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
                  approval_status: fallbackDecision?.approval_status ?? 'pendiente',
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
                user: {
                  nombre: assignment.usuario_nombre ?? null,
                },
              }));

            let uniqueAssignments: Array<{
              usuario_id: number;
              estado: string;
              fecha_limite: string | null;
              elemento_asignacion_id?: number;
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
                rows.push({
                  rowKey: `${evidencia.evidencia_id}-${assignment.usuario_id}`,
                  evidencia: {
                    ...evidencia,
                    approval_status: decision?.approval_status ?? 'pendiente',
                    comentario_rechazo:
                      decision?.comentario_rechazo ?? null,
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
              ? assignments.filter((assignment) => assignment.proceso_id === procesoId)
              : assignments;
            const uniqueAssignments = dedupeTraditionalAssignments(processAssignments);

            if (uniqueAssignments.length > 0) {
              uniqueAssignments.forEach((assignment) => {
                const decision = evidencia.approvals_by_user?.[String(assignment.usuario_id)];
                rows.push({
                  rowKey: `${evidencia.evidencia_id}-${assignment.usuario_id}`,
                  evidencia: {
                    ...evidencia,
                    approval_status: decision?.approval_status ?? 'pendiente',
                    comentario_rechazo:
                      decision?.comentario_rechazo ?? null,
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

          rows.push({
            rowKey: `${evidencia.evidencia_id}-${evidencia.asignacion?.usuario_id ?? 'sin-responsable'}`,
            evidencia: {
              ...evidencia,
              approval_status: fallbackDecision?.approval_status ?? 'pendiente',
              comentario_rechazo:
                fallbackDecision?.comentario_rechazo ?? null,
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
  const blockIsIncompleto = criterio.estado_aprobacion === 'incompleto';
  const showLoading = loading || loadingRows;

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
      {showLoading ? (
        <div className="relative min-h-[140px]">
          <LoadingSpinner variant="loader" />
        </div>
      ) : displayRows.length === 0 ? (
        <div className="py-8 text-center">
          <p className={`${TYPOGRAPHY.modal.body} text-gris-una`}>
            {isFlexible
              ? 'No hay fuentes asociadas para revisar en este bloque.'
              : 'No hay evidencias asociadas para revisar en este bloque.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 py-1">
          {displayRows.map((row) => {
            const evidencia = row.evidencia;
            const statusConfig = EVIDENCE_STATUS_BADGE[evidencia.approval_status];
            const isLocked =
              evidencia.approval_status === 'aprobado' && blockIsIncompleto;
            const canApprove =
              !blockIsApproved && !isLocked && evidencia.approval_status !== 'aprobado';
            const canReject =
              !blockIsApproved && !isLocked && evidencia.approval_status !== 'rechazado';
            const responsableLabel = row.responsable.nombre ?? 'Sin responsable identificado';

            return (
              <div
                key={row.rowKey}
                className="rounded-lg border border-gris-light px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={statusConfig.label}
                        colorClasses={statusConfig.colorClasses}
                      />
                      <p className={`truncate text-gris-una ${TYPOGRAPHY.table.helper}`}>
                        <span className="font-semibold text-negro-una">
                          {evidencia.nomenclatura}
                        </span>
                        <span> - {evidencia.descripcion}</span>
                      </p>
                    </div>

                    <p className={`mt-1 text-gris-una ${TYPOGRAPHY.table.helper}`}>
                      Responsable: {responsableLabel}
                    </p>

                    {evidencia.comentario_rechazo && (
                      <p className={`mt-1 text-error-dark ${TYPOGRAPHY.table.helper}`}>
                        Motivo: {evidencia.comentario_rechazo}
                      </p>
                    )}

                    <EvidenceDocumentsDropdown
                      evidenciaId={evidencia.evidencia_id}
                      isFlexible={isFlexible}
                      procesoId={procesoId}
                      responsable={row.responsable}
                    />
                  </div>

                  <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                    <ButtonWithTooltip
                      variant="tablePower"
                      size="sm"
                      tooltip={
                        isLocked
                          ? `${isFlexible ? 'Fuente' : 'Evidencia'} aprobada (bloqueada)`
                          : canApprove
                            ? `Aprobar ${isFlexible ? 'fuente' : 'evidencia'}`
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
                        isLocked
                          ? `${isFlexible ? 'Fuente' : 'Evidencia'} aprobada (bloqueada)`
                          : canReject
                            ? `Rechazar ${isFlexible ? 'fuente' : 'evidencia'}`
                            : 'Ya rechazada'
                      }
                      tooltipPosition="left"
                      disabled={!canReject}
                      onClick={() => onRechazarEvidencia(criterio, evidencia)}
                      className={TABLE_ACTION_BUTTON.button}
                    >
                      <SystemIcons.interface.xCircle className="size-4" />
                    </ButtonWithTooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
