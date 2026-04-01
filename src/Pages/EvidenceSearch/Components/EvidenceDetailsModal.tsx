/**
 * EvidenceDetailsModal - Modal para mostrar los detalles completos de una evidencia
 *
 * Muestra información detallada de la evidencia incluyendo:
 * - Información básica (criterio, descripción, evidencias asociadas)
 * - Recursos disponibles (archivos y enlaces) agrupados por responsable
 * - Roles con acceso
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { DataTable, type DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { FileList } from '@/Components/Ui/Upload/FileList';
import { fileService } from '@/Services/FileService';
import { evidenceSearchService, mapBackendToFrontend } from '@/Services/EvidenceSearchService';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import type { FileModel } from '@/Types/FileTypes';
import type { AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
import { type EvidenceSearchResult } from '@/Types/EvidenceSearchTypes';
import { useAuth } from '@/Context/AuthContext';
import { AdminFileUploadModal } from './AdminFileUploadModal';
import { FeedbackModal } from './FeedbackModal';
import { type FeedbackEstado } from '@/Services/FeedbackService';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { ASSIGNMENT_STATUS_BADGE, EVIDENCE_STATUS_BADGE, BADGE_COLORS } from '@/Constants/StatusBadges';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { cn } from '@/Utils/ClassNames';
import { formatDate } from '@/Utils/DateUtils';

interface EvidenceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** ID del criterio a mostrar. El modal carga internamente todas sus evidencias. */
  criterioId: number | null;
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

const EvidenciaResponsablesPanelAdmin: React.FC<EvidenciaResponsablesPanelAdminProps> = ({
  groups,
  loading,
  onDelete,
  onUpload,
}) => {
  const firstColumn = useFirstColumnConfig();

  const responsablesColumns: DataTableColumn<FilesByUser>[] = [
    {
      key: 'nombre',
      header: 'Responsable',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.body}`}>
          {item.nombre as string}
        </span>
      ),
    },
    {
      key: 'fecha_asignacion',
      header: 'Fecha Asignación',
      align: 'center',
      render: (_, item) => (
        <span className={`text-gris-una-2 ${TYPOGRAPHY.modal.body}`}>
          {formatDate(item.fecha_asignacion as string | null)}
        </span>
      ),
    },
    {
      key: 'fecha_limite',
      header: 'Fecha Límite',
      align: 'center',
      render: (_, item) => (
        <span className={`text-gris-una-2 ${TYPOGRAPHY.modal.body}`}>
          {formatDate(item.fecha_limite as string | null)}
        </span>
      ),
    },
    {
      key: 'estado_asignacion',
      header: 'Estado',
      align: 'center',
      render: (_, item) => {
        const estado = item.estado_asignacion as AssignmentStatus | null;
        if (!estado) return <span className={`text-gris-una-2 ${TYPOGRAPHY.modal.body}`}>—</span>;
        return (
          <div className="flex items-center justify-center">
            <StatusBadge
              label={ASSIGNMENT_STATUS_BADGE[estado].label}
              colorClasses={ASSIGNMENT_STATUS_BADGE[estado].colorClasses}
            />
          </div>
        );
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center">
          <TableActionButton
            action="uploadArrow"
            tooltip="Subir archivo"
            onClick={() => onUpload(item)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable<FilesByUser>
      title=""
      searchable={false}
      loading={loading}
      data={groups}
      columns={responsablesColumns}
      getRowKey={(item) => String(item.usuario_id)}
      emptyMessage="Sin responsables asignados"
      unstyled
      expandableRow={(group) => (
        <FileList
          files={group.archivos as FileModel[]}
          loading={false}
          onDelete={onDelete}
          showActions={true}
          emptyMessage="Sin archivos"
        />
      )}
    />
  );
};

// Componentes locales de layout

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
      {label}
    </span>
  </div>
);

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);

export const EvidenceDetailsModal: React.FC<EvidenceDetailsModalProps> = ({
  isOpen,
  onClose,
  criterioId,
}) => {
  const { isSuperUser, isAdmin, user } = useAuth();
  const isPrivileged = isSuperUser() || isAdmin();
  const canRetroalimentar = user?.roles?.some(r =>
    ['Encargado de Acreditación', 'Administrador', 'Superusuario'].includes(r.name)
  ) ?? false;
  const firstColumn = useFirstColumnConfig();

  const [evidencias, setEvidencias] = useState<EvidenceSearchResult[]>([]);
  const [filesByEvidencia, setFilesByEvidencia] = useState<Map<number, FilesByUser[]>>(new Map());
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [adminUpload, setAdminUpload] = useState<{ isOpen: boolean; evidenciaId: number; procesoId: number }>({
    isOpen: false, evidenciaId: 0, procesoId: 0,
  });
  const [retroState, setRetroState] = useState<{ isOpen: boolean; evidence: EvidenceSearchResult | null }>({
    isOpen: false, evidence: null,
  });

  const criterio = evidencias[0] ?? null;

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
    ...(canRetroalimentar ? [{
      key: 'acciones_retro',
      header: 'Retroalimentación',
      align: 'center' as const,
      render: (_: unknown, item: EvidenceSearchResult) => (
        <div className="flex items-center justify-center">
          <TableActionButton
            action="comment"
            tooltip={item.estado === 'Pendiente' ? 'Sin recursos para retroalimentar' : 'Retroalimentar evidencia'}
            disabled={item.estado === 'Pendiente'}
            onClick={() => setRetroState({ isOpen: true, evidence: item })}
          />
        </div>
      ),
    }] : []),
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
    const [files, assignments] = await Promise.all([
      fileService.listFiles({ evidencia_id: evidenciaId }),
      evidenceAssignmentService.getAssignmentsByEvidence(evidenciaId).catch(() => []),
    ]);
    const assignmentMap = new Map(
      assignments.map(a => [a.usuario_id, {
        fecha_asignacion: a.fecha_asignacion,
        fecha_limite: a.fecha_limite ?? null,
        estado: a.estado,
      }])
    );
    const groupMap = new Map<number, FilesByUser>();
    files.forEach((f: FileModel) => {
      if (!groupMap.has(f.usuario_id)) {
        const asig = assignmentMap.get(f.usuario_id);
        groupMap.set(f.usuario_id, {
          usuario_id: f.usuario_id,
          nombre: f.usuario?.nombre_completo || `Usuario ${f.usuario_id}`,
          email: f.usuario?.email || '',
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
    setFilesByEvidencia(prev => {
      const next = new Map(prev);
      next.set(evidenciaId, Array.from(groupMap.values()));
      return next;
    });
  };

  const handleDeleteFile = async (fileId: number) => {
    await fileService.deleteFile(fileId);
    for (const [evId, groups] of filesByEvidencia.entries()) {
      const found = groups.some(g => g.archivos.some(f => f.archivo_id === fileId));
      if (found) {
        await reloadFilesForEvidencia(evId);
        break;
      }
    }
  };

  const handleOpenUpload = (evidenciaId: number, group: FilesByUser) => {
    const procesoId = group.archivos.find(f => f.proceso_id)?.proceso_id ?? 0;
    setAdminUpload({ isOpen: true, evidenciaId, procesoId });
  };

  const handleFeedbackSuccess = (evidenciaId: number, nuevoEstado: FeedbackEstado) => {
    setEvidencias(prev =>
      prev.map(e => e.evidencia_id === evidenciaId ? { ...e, estado: nuevoEstado } : e)
    );
  };

  const loadAll = async () => {
    if (!criterioId) return;
    setLoadingFiles(true);
    try {
      const response = await evidenceSearchService.search(
        { criterio: String(criterioId) },
        1,
        100,
      );
      const mapped = response.data.map(mapBackendToFrontend);
      setEvidencias(mapped);

      if (mapped.length > 0 && isPrivileged) {
        const [filesResults, assignmentsResults] = await Promise.all([
          Promise.all(mapped.map(ev => fileService.listFiles({ evidencia_id: ev.evidencia_id }))),
          Promise.all(mapped.map(ev => evidenceAssignmentService.getAssignmentsByEvidence(ev.evidencia_id).catch(() => []))),
        ]);
        const map = new Map<number, FilesByUser[]>();
        mapped.forEach((ev, idx) => {
          const files = filesResults[idx];
          const assignments = assignmentsResults[idx];
          const assignmentMap = new Map(
            assignments.map(a => [a.usuario_id, {
              fecha_asignacion: a.fecha_asignacion,
              fecha_limite: a.fecha_limite ?? null,
              estado: a.estado,
            }])
          );
          const groupMap = new Map<number, FilesByUser>();
          files.forEach((f: FileModel) => {
            if (!groupMap.has(f.usuario_id)) {
              const asig = assignmentMap.get(f.usuario_id);
              groupMap.set(f.usuario_id, {
                usuario_id: f.usuario_id,
                nombre: f.usuario?.nombre_completo || `Usuario ${f.usuario_id}`,
                email: f.usuario?.email || '',
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
          map.set(ev.evidencia_id, Array.from(groupMap.values()));
        });
        setFilesByEvidencia(map);
      }
    } catch (error) {
      console.error('Error al cargar datos del criterio:', error);
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
      title="Detalles del Criterio"
      subtitle={criterio?.criterio_nomenclatura}
      variant="info"
      size="xl"
      maxHeight="xl"
      heroIcon={<SystemIcons.modal.document className={`${ICON_SIZES.md} text-blanco-una`} />}
      showCancel={false}
      showConfirm={false}
    >
      {loadingFiles && evidencias.length === 0 ? (
        <div className={cn('flex items-center justify-center py-12 text-gris-una', TYPOGRAPHY.modal.body)}>
          Cargando información del criterio…
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* INFORMACIÓN DEL CRITERIO */}
          {criterio && (
            <div>
              <SectionLabel label="Información del criterio" />
              <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoCell label="Nomenclatura">
                  <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>
                    {criterio.criterio_nomenclatura}
                  </span>
                </InfoCell>
                <InfoCell label="Evidencias asociadas">
                  <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                    {evidencias.length}
                  </span>
                </InfoCell>
                <InfoCell label="Descripción" className="col-span-2">
                  <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                    {criterio.criterio_descripcion}
                  </span>
                </InfoCell>
              </div>
            </div>
          )}

          {/* ROLES CON ACCESO */}
          {criterio && criterio.roles_acceso && criterio.roles_acceso.length > 0 && (
            <div>
              <SectionLabel label="Roles con acceso" />
              <div className="border border-gray-200 rounded-corner p-4">
                <div className="flex flex-wrap gap-2">
                  {criterio.roles_acceso.map((rol) => (
                    <span
                      key={rol}
                      className={cn(
                        'inline-flex px-2.5 py-1 font-semibold rounded-full',
                        'bg-info-light text-info',
                        TYPOGRAPHY.badge,
                      )}
                    >
                      {rol}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GESTIÓN DE RECURSOS (solo Superusuario / Administrador) */}
          {isPrivileged && (
            <div>
              <SectionLabel label="Gestión de recursos" />
              <div className="px-1 py-2">
                <DataTable
                  title=""
                  searchable={false}
                  loading={loadingFiles}
                  data={evidencias as any}
                  columns={evidenceColumns as any}
                  getRowKey={(item: any) => String(item.evidencia_id)}
                  emptyMessage="No hay evidencias para este criterio"
                  unstyled
                  expandableRow={(ev: any) => (
                    <EvidenciaResponsablesPanelAdmin
                      evidenciaId={ev.evidencia_id}
                      groups={filesByEvidencia.get(ev.evidencia_id) ?? []}
                      loading={false}
                      onDelete={handleDeleteFile}
                      onUpload={(group) => handleOpenUpload(ev.evidencia_id, group)}
                    />
                  )}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </Modal>

    {isPrivileged && (
      <AdminFileUploadModal
        isOpen={adminUpload.isOpen}
        onClose={() => setAdminUpload(prev => ({ ...prev, isOpen: false }))}
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
