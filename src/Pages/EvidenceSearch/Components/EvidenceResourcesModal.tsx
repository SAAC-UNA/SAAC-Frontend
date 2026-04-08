/**
 * EvidenceResourcesModal - Modal de recursos del criterio
 * Muestra las evidencias del criterio, sus responsables y archivos asociados.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { DataTable, type DataTableColumn, ExpandableChildRow, type ExpandableChildItem } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { FileRowContent, FileDownloadAction } from '@/Components/Ui/Upload/FileList';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { fileService } from '@/Services/FileService';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { axiosInstance } from '@/Config/axios';
import type { FileModel } from '@/Types/FileTypes';
import type { AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
import type { EvidenceSearchResult } from '@/Types/EvidenceSearchTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ASSIGNMENT_STATUS_BADGE, EVIDENCE_STATUS_BADGE, BADGE_COLORS } from '@/Constants/StatusBadges';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { formatDate } from '@/Utils/DateUtils';

interface FilesByUser extends Record<string, unknown> {
  usuario_id: number;
  nombre: string;
  email: string;
  archivos: FileModel[];
  fecha_asignacion: string | null;
  fecha_limite: string | null;
  estado_asignacion: AssignmentStatus | null;
}

interface FlexibleElementFile {
  archivo_id: number;
  tipo: 'archivo' | 'enlace';
  nombre_original?: string | null;
  url?: string | null;
  tipo_mime?: string | null;
  fecha_subida?: string | null;
  autor?: {
    id?: number;
    nombre?: string;
    email?: string;
  } | null;
}

interface FlexibleFilesByUser extends Record<string, unknown> {
  key: string;
  usuario_id: number | null;
  nombre: string;
  email: string;
  archivos: FlexibleElementFile[];
  fecha_asignacion: string | null;
  fecha_limite: string | null;
  estado_asignacion: string | null;
}

export interface EvidenceResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidencias: EvidenceSearchResult[];
  criterioNomenclatura?: string;
  isFlexible?: boolean;
}

const normalizeName = (name?: string | null): string =>
  (name ?? '').trim().toLowerCase();

const getFlexibleAssignmentBadge = (status: string | null) => {
  if (!status) return null;

  const normalized = status.trim().toLowerCase();

  if (normalized in ASSIGNMENT_STATUS_BADGE) {
    return ASSIGNMENT_STATUS_BADGE[normalized as AssignmentStatus];
  }

  if (normalized === 'en proceso' || normalized === 'en_progreso') {
    return EVIDENCE_STATUS_BADGE['En Proceso'];
  }

  if (normalized === 'pendiente') return EVIDENCE_STATUS_BADGE.Pendiente;
  if (normalized === 'completado') return EVIDENCE_STATUS_BADGE.Completado;
  if (normalized === 'observada') return EVIDENCE_STATUS_BADGE.Observada;
  if (normalized === 'validada') return EVIDENCE_STATUS_BADGE.Validada;
  if (normalized === 'vencido') return EVIDENCE_STATUS_BADGE.Vencido;

  return {
    label: status,
    colorClasses: BADGE_COLORS.gris.colorClasses,
  };
};

/** Carga lazy de responsables y archivos para una evidencia concreta */
const EvidenciaResponsablesPanel: React.FC<{ evidenciaId: number }> = ({ evidenciaId }) => {
  const [groups, setGroups] = useState<FilesByUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fileService.listFiles({ evidencia_id: evidenciaId }),
      evidenceAssignmentService.getAssignmentsByEvidence(evidenciaId).catch(() => []),
    ])
      .then(([files, assignments]) => {
        const assignmentMap = new Map(
          assignments.map(a => [a.usuario_id, {
            fecha_asignacion: a.fecha_asignacion,
            fecha_limite: a.fecha_limite ?? null,
            estado: a.estado,
          }])
        );
        const groupMap = new Map<number, FilesByUser>();
        files.forEach((f) => {
          if (!groupMap.has(f.usuario_id)) {
            const asig = assignmentMap.get(f.usuario_id);
            groupMap.set(f.usuario_id, {
              usuario_id: f.usuario_id,
              nombre: f.usuario?.nombre_completo ?? `Usuario ${f.usuario_id}`,
              email: f.usuario?.email ?? '',
              archivos: [],
              fecha_asignacion: asig?.fecha_asignacion ?? null,
              fecha_limite: asig?.fecha_limite ?? null,
              estado_asignacion: asig?.estado ?? null,
            });
          }
          groupMap.get(f.usuario_id)!.archivos.push(f);
        });
        assignments.forEach(a => {
          if (!groupMap.has(a.usuario_id)) {
            groupMap.set(a.usuario_id, {
              usuario_id: a.usuario_id,
              nombre: a.usuario?.nombre ?? `Usuario ${a.usuario_id}`,
              email: a.usuario?.email ?? '',
              archivos: [],
              fecha_asignacion: a.fecha_asignacion,
              fecha_limite: a.fecha_limite ?? null,
              estado_asignacion: a.estado,
            });
          }
        });
        setGroups(Array.from(groupMap.values()));
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [evidenciaId]);

  if (loading) return <div className="relative min-h-[60px]"><LoadingSpinner variant="loader" /></div>;
  if (groups.length === 0) return <p className={`text-gris-una px-3 py-1.5 ${TYPOGRAPHY.table.helper}`}>Sin responsables asignados</p>;

  return (
    <div className="space-y-1">
      {groups.map(group => {
        const estado = group.estado_asignacion;
        const fileItems: ExpandableChildItem[] = group.archivos.map(file => ({
          key: String(file.archivo_id),
          content: <FileRowContent file={file} />,
          action: <FileDownloadAction file={file} />,
        }));
        return (
          <ExpandableChildRow
            key={String(group.usuario_id)}
            item={{
              key: String(group.usuario_id),
              emptyChildrenMessage: 'Sin archivos',
              children: fileItems,
              content: (
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className={`font-semibold text-negro-una-2 flex-1 min-w-0 truncate ${TYPOGRAPHY.table.helper}`}>{group.nombre}</span>
                  <span className={`text-gris-una flex-shrink-0 ${TYPOGRAPHY.table.helper}`}>{formatDate(group.fecha_asignacion)}</span>
                  <span className={`text-gris-una flex-shrink-0 ${TYPOGRAPHY.table.helper}`}>{formatDate(group.fecha_limite)}</span>
                  {estado && (
                    <StatusBadge
                      label={ASSIGNMENT_STATUS_BADGE[estado].label}
                      colorClasses={ASSIGNMENT_STATUS_BADGE[estado].colorClasses}
                    />
                  )}
                </div>
              ),
            }}
          />
        );
      })}
    </div>
  );
};

/** Carga responsables y recursos para una pauta flexible (elemento+proceso). */
const ElementoResponsablesPanel: React.FC<{
  elementoId: number;
  procesoId: number;
  evidencias: EvidenceSearchResult[];
}> = ({ elementoId, procesoId, evidencias }) => {
  const [groups, setGroups] = useState<FlexibleFilesByUser[]>([]);
  const [loading, setLoading] = useState(true);

  const openLink = useCallback((url?: string | null) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const downloadElementFile = useCallback(async (file: FlexibleElementFile) => {
    if (file.tipo !== 'archivo') return;
    try {
      const response = await axiosInstance.get(
        `/elementos-archivos/${file.archivo_id}/download`,
        { responseType: 'blob' },
      );
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.nombre_original || `archivo-${file.archivo_id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      // El modal es de consulta; un fallo puntual de descarga no bloquea la vista.
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const [assignments, rawFiles] = await Promise.all([
          evidenceAssignmentService
            .getElementAssignmentsByElement(elementoId, procesoId)
            .catch(() => []),
          evidenceAssignmentService
            .getElementFiles(elementoId, procesoId)
            .catch(() => []),
        ]);

        const processAssignments = assignments.filter(
          (a) => a.proceso_id === procesoId,
        );
        const files = rawFiles as unknown as FlexibleElementFile[];

        const groupsByUserId = new Map<number, FlexibleFilesByUser>();
        processAssignments.forEach((assignment) => {
          const userId = assignment.usuario_id;
          const fechaAsignacion =
            typeof assignment.fecha_asignacion === 'string'
              ? assignment.fecha_asignacion
              : null;
          if (!groupsByUserId.has(userId)) {
            groupsByUserId.set(userId, {
              key: `user-${userId}`,
              usuario_id: userId,
              nombre: assignment.user?.nombre || `Usuario ${userId}`,
              email: '',
              archivos: [],
              fecha_asignacion: fechaAsignacion,
              fecha_limite: assignment.fecha_limite,
              estado_asignacion: assignment.estado,
            });
          }
        });

        // Fallback: asegurar responsables visibles desde los resultados del explorador.
        evidencias.forEach((evidencia) => {
          evidencia.responsables.forEach((responsable) => {
            if (!groupsByUserId.has(responsable.usuario_id)) {
              groupsByUserId.set(responsable.usuario_id, {
                key: `user-${responsable.usuario_id}`,
                usuario_id: responsable.usuario_id,
                nombre: responsable.nombre,
                email: responsable.email,
                archivos: [],
                fecha_asignacion: null,
                fecha_limite: null,
                estado_asignacion: null,
              });
            }
          });
        });

        const groupsByName = new Map<string, FlexibleFilesByUser>();
        groupsByUserId.forEach((group) => {
          groupsByName.set(normalizeName(group.nombre), group);
        });

        const fallbackGroupsByName = new Map<string, FlexibleFilesByUser>();

        files.forEach((file) => {
          const authorId = file.autor?.id;
          const authorName = normalizeName(file.autor?.nombre);

          let targetGroup: FlexibleFilesByUser | undefined;
          if (typeof authorId === 'number') {
            targetGroup = groupsByUserId.get(authorId);
          }
          if (!targetGroup && authorName) {
            targetGroup = groupsByName.get(authorName);
          }

          if (!targetGroup) {
            const fallbackName = file.autor?.nombre?.trim() || 'Sin responsable identificado';
            if (!fallbackGroupsByName.has(fallbackName)) {
              fallbackGroupsByName.set(fallbackName, {
                key: `fallback-${fallbackName}`,
                usuario_id: file.autor?.id ?? null,
                nombre: fallbackName,
                email: file.autor?.email ?? '',
                archivos: [],
                fecha_asignacion: null,
                fecha_limite: null,
                estado_asignacion: null,
              });
            }
            targetGroup = fallbackGroupsByName.get(fallbackName);
          }

          targetGroup?.archivos.push(file);
        });

        const mergedGroups = [
          ...Array.from(groupsByUserId.values()),
          ...Array.from(fallbackGroupsByName.values()),
        ]
          .filter((group) => group.archivos.length > 0 || group.estado_asignacion)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        if (active) {
          setGroups(mergedGroups);
        }
      } catch {
        if (active) {
          setGroups([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [elementoId, procesoId, evidencias]);

  if (loading) {
    return (
      <div className="relative min-h-[80px]">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <p className={`text-gris-una px-3 py-1.5 ${TYPOGRAPHY.table.helper}`}>
        Sin responsables o recursos para esta pauta
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const statusBadge = getFlexibleAssignmentBadge(group.estado_asignacion);
        const fileItems: ExpandableChildItem[] = group.archivos.map((file) => {
          const isLink = file.tipo === 'enlace';
          const primaryText =
            (isLink ? file.url : file.nombre_original) ||
            (isLink ? 'Enlace sin URL' : `Archivo ${file.archivo_id}`);

          return {
            key: String(file.archivo_id),
            content: (
              <div className="flex items-center gap-2 min-w-0">
                {isLink ? (
                  <SystemIcons.interface.link className="size-4 text-info shrink-0" />
                ) : (
                  <SystemIcons.modal.document className="size-4 text-info shrink-0" />
                )}
                <div className="min-w-0">
                  <p
                    className={`truncate text-negro-una-2 ${TYPOGRAPHY.table.helper}`}
                    title={primaryText}
                  >
                    {primaryText}
                  </p>
                  <p className={`text-gris-una ${TYPOGRAPHY.table.helper}`}>
                    {formatDate(file.fecha_subida ?? null)}
                  </p>
                </div>
              </div>
            ),
            action: (
              <div className="flex items-center gap-1">
                {isLink && file.url && (
                  <TableActionButton
                    action="view"
                    tooltip="Abrir enlace"
                    onClick={() => openLink(file.url)}
                  />
                )}
                {!isLink && (
                  <TableActionButton
                    action="custom"
                    customIcon={<SystemIcons.actions.export className="size-4" />}
                    customVariant="tableView"
                    tooltip="Descargar archivo"
                    onClick={() => downloadElementFile(file)}
                  />
                )}
              </div>
            ),
          };
        });

        return (
          <ExpandableChildRow
            key={group.key}
            item={{
              key: group.key,
              emptyChildrenMessage: 'Sin recursos',
              children: fileItems,
              content: (
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span
                    className={`font-semibold text-negro-una-2 flex-1 min-w-0 truncate ${TYPOGRAPHY.table.helper}`}
                    title={group.nombre}
                  >
                    {group.nombre}
                  </span>
                  <span className={`text-gris-una flex-shrink-0 ${TYPOGRAPHY.table.helper}`}>
                    {formatDate(group.fecha_asignacion)}
                  </span>
                  <span className={`text-gris-una flex-shrink-0 ${TYPOGRAPHY.table.helper}`}>
                    {formatDate(group.fecha_limite)}
                  </span>
                  {statusBadge && (
                    <StatusBadge
                      label={statusBadge.label}
                      colorClasses={statusBadge.colorClasses}
                    />
                  )}
                </div>
              ),
            }}
          />
        );
      })}
    </div>
  );
};

export const EvidenceResourcesModal: React.FC<EvidenceResourcesModalProps> = ({
  isOpen,
  onClose,
  evidencias,
  criterioNomenclatura,
  isFlexible = false,
}) => {
  const firstColumn = useFirstColumnConfig();

  const flexibleElementId = evidencias[0]?.criterio_id ?? null;
  const flexibleProcessId = evidencias[0]?.proceso_id ?? null;

  const flexibleResourcesSummary = useMemo(() => {
    return evidencias.reduce(
      (acc, item) => ({
        archivos: Math.max(acc.archivos, item.archivos_count),
        enlaces: Math.max(acc.enlaces, item.enlaces_count),
      }),
      { archivos: 0, enlaces: 0 },
    );
  }, [evidencias]);

  const evidenceColumns: DataTableColumn<EvidenceSearchResult>[] = [
    {
      key: 'evidencia',
      header: 'Evidencia',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <div className="flex flex-col pl-2">
          <span className={`font-bold text-negro-una-2 ${TYPOGRAPHY.modal.body}`}>
            {item.nomenclatura}
          </span>
          <span className={`text-gris-una-2 ${TYPOGRAPHY.modal.body}`}>
            {item.descripcion}
          </span>
        </div>
      ),
    },
    {
      key: 'recursos',
      header: 'Recursos',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2">
          {item.archivos_count > 0 && (
            <StatusBadge
              label={`${item.archivos_count} ${item.archivos_count === 1 ? 'archivo' : 'archivos'}`}
              colorClasses={BADGE_COLORS.info.colorClasses}
            />
          )}
          {item.enlaces_count > 0 && (
            <StatusBadge
              label={`${item.enlaces_count} ${item.enlaces_count === 1 ? 'enlace' : 'enlaces'}`}
              colorClasses={BADGE_COLORS.gris.colorClasses}
            />
          )}
          {item.archivos_count === 0 && item.enlaces_count === 0 && (
            <StatusBadge label="Sin recursos" colorClasses={BADGE_COLORS.slate.colorClasses} />
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center">
          <StatusBadge
            label={EVIDENCE_STATUS_BADGE[item.estado].label}
            colorClasses={EVIDENCE_STATUS_BADGE[item.estado].colorClasses}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFlexible ? 'Recursos de la pauta' : 'Recursos del criterio'}
      subtitle={criterioNomenclatura}
      variant="neutral"
      heroIcon={<SystemIcons.actions.list className={`${ICON_SIZES.md} text-blanco-una`} />}
      size="xl"
      maxHeight="full"
      closable
      showCancel={false}
      showConfirm={false}
    >
      {isFlexible ? (
        <div className="px-2 py-2 space-y-3">
          <div className="flex items-center justify-center gap-2">
            {flexibleResourcesSummary.archivos > 0 && (
              <StatusBadge
                label={`${flexibleResourcesSummary.archivos} ${flexibleResourcesSummary.archivos === 1 ? 'archivo' : 'archivos'}`}
                colorClasses={BADGE_COLORS.info.colorClasses}
              />
            )}
            {flexibleResourcesSummary.enlaces > 0 && (
              <StatusBadge
                label={`${flexibleResourcesSummary.enlaces} ${flexibleResourcesSummary.enlaces === 1 ? 'enlace' : 'enlaces'}`}
                colorClasses={BADGE_COLORS.gris.colorClasses}
              />
            )}
            {flexibleResourcesSummary.archivos === 0 &&
              flexibleResourcesSummary.enlaces === 0 && (
                <StatusBadge
                  label="Sin recursos"
                  colorClasses={BADGE_COLORS.slate.colorClasses}
                />
              )}
          </div>

          {flexibleElementId && flexibleProcessId ? (
            <ElementoResponsablesPanel
              elementoId={flexibleElementId}
              procesoId={flexibleProcessId}
              evidencias={evidencias}
            />
          ) : (
            <p className={`text-gris-una px-3 py-1.5 ${TYPOGRAPHY.table.helper}`}>
              No se pudo determinar el elemento del proceso seleccionado.
            </p>
          )}
        </div>
      ) : (
        <div className="px-1 py-2">
          <DataTable
            title=""
            searchable={false}
            loading={false}
            data={evidencias as any}
            columns={evidenceColumns as any}
            getRowKey={(item: any) => String(item.evidencia_id)}
            emptyMessage="No hay evidencias para este criterio"
            unstyled
            expandableRow={(evidencia: any) => [{
              key: String(evidencia.evidencia_id),
              noBorder: true,
              content: <EvidenciaResponsablesPanel evidenciaId={evidencia.evidencia_id} />,
            }]}
          />
        </div>
      )}
    </Modal>
  );
};
