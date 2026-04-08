/**
 * EvidenceFilesModal - Modal para mostrar archivos asociados a una evidencia
 * HU010 - Aprobación por Bloques
 */

import React, { useEffect, useState } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { FileRowContent, FileDownloadAction } from '@/Components/Ui/Upload/FileList';
import { fileService } from '@/Services/FileService';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import type { FileModel } from '@/Types/FileTypes';
import type { AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
import { ASSIGNMENT_STATUS_BADGE } from '@/Constants/StatusBadges';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { cn } from '@/Utils/ClassNames';
import { formatDate } from '@/Utils/DateUtils';

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
}

interface FilesByUser {
  usuario_id: number;
  nombre: string;
  email: string;
  archivos: FileModel[];
  fecha_asignacion: string | null;
  fecha_limite: string | null;
  estado_asignacion: AssignmentStatus | null;
}

interface EvidenceFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidencia: Evidencia | null;
  approvalStatus?: string;
  blockIsApproved?: boolean;
  onAprobar?: (comentario?: string) => void;
  onRechazar?: (comentario?: string) => void;
}

export const EvidenceFilesModal: React.FC<EvidenceFilesModalProps> = ({
  isOpen,
  onClose,
  evidencia
}) => {
  const [state, setState] = useState<{ loading: boolean; groups: FilesByUser[] }>({
    loading: false,
    groups: [],
  });

  useEffect(() => {
    if (!isOpen || !evidencia) return;

    setState({ loading: true, groups: [] });

    Promise.all([
      fileService.listFiles({ evidencia_id: evidencia.id }),
      evidenceAssignmentService.getAssignmentsByEvidence(evidencia.id).catch(() => []),
    ])
      .then(([files, assignments]) => {
        const assignmentMap = new Map(
          assignments.map((a) => [
            a.usuario_id,
            {
              fecha_asignacion: a.fecha_asignacion,
              fecha_limite: a.fecha_limite ?? null,
              estado: a.estado,
              nombre: a.usuario?.nombre,
              email: a.usuario?.email,
            },
          ]),
        );

        const groupMap = new Map<number, FilesByUser>();

        files.forEach((file) => {
          if (!groupMap.has(file.usuario_id)) {
            const asig = assignmentMap.get(file.usuario_id);
            groupMap.set(file.usuario_id, {
              usuario_id: file.usuario_id,
              nombre:
                file.usuario?.nombre_completo ??
                asig?.nombre ??
                `Usuario ${file.usuario_id}`,
              email: file.usuario?.email ?? asig?.email ?? '',
              archivos: [],
              fecha_asignacion: asig?.fecha_asignacion ?? null,
              fecha_limite: asig?.fecha_limite ?? null,
              estado_asignacion: asig?.estado ?? null,
            });
          }
          groupMap.get(file.usuario_id)?.archivos.push(file);
        });

        assignments.forEach((assignment) => {
          if (!groupMap.has(assignment.usuario_id)) {
            groupMap.set(assignment.usuario_id, {
              usuario_id: assignment.usuario_id,
              nombre: assignment.usuario?.nombre ?? `Usuario ${assignment.usuario_id}`,
              email: assignment.usuario?.email ?? '',
              archivos: [],
              fecha_asignacion: assignment.fecha_asignacion,
              fecha_limite: assignment.fecha_limite ?? null,
              estado_asignacion: assignment.estado,
            });
          }
        });

        setState({ loading: false, groups: Array.from(groupMap.values()) });
      })
      .catch(() => setState({ loading: false, groups: [] }));
  }, [isOpen, evidencia]);

  if (!evidencia) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archivos de la evidencia"
      size="md"
      variant="info"
      heroIcon={<SystemIcons.modal.document className={cn(ICON_SIZES.md, 'text-blanco-una')} />}
    >
      <div className="flex flex-col gap-4">
        {/* Información de la evidencia */}
        <div className="flex items-center gap-2">
          <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
            {evidencia.nomenclatura}
          </span>
          <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>—</span>
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {evidencia.descripcion}
          </span>
        </div>

        {state.loading ? (
          <div className="relative min-h-[120px]">
            <LoadingSpinner variant="loader" />
          </div>
        ) : state.groups.length === 0 ? (
          <div className="py-6 flex flex-col items-center gap-2">
            <SystemIcons.modal.document className={cn(ICON_SIZES.lg, 'text-gris-light')} />
            <p className={cn(TYPOGRAPHY.modal.body, 'font-medium text-negro-una')}>
              No hay archivos asociados
            </p>
            <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
              Esta evidencia aun no tiene archivos adjuntos.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.groups.map((group) => (
              <div key={group.usuario_id} className="rounded-lg border border-gris-light p-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
                    {group.nombre}
                  </span>
                  {group.estado_asignacion && (
                    <StatusBadge
                      label={ASSIGNMENT_STATUS_BADGE[group.estado_asignacion].label}
                      colorClasses={ASSIGNMENT_STATUS_BADGE[group.estado_asignacion].colorClasses}
                    />
                  )}
                  <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>
                    Asignado: {formatDate(group.fecha_asignacion)}
                  </span>
                  <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>
                    Limite: {formatDate(group.fecha_limite)}
                  </span>
                </div>

                {group.archivos.length === 0 ? (
                  <p className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>
                    Sin recursos cargados
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {group.archivos.map((file) => (
                      <div
                        key={file.archivo_id}
                        className="flex items-center justify-between rounded-md border border-gris-light/60 px-2 py-1.5"
                      >
                        <FileRowContent file={file} />
                        <FileDownloadAction file={file} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
