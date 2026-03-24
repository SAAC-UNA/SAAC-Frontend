import React, { useEffect, useState } from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { cn } from '@/Utils/ClassNames';
import { ICON_SIZES } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import type { EvidenceAssignment } from '@/Types/EvidenceAssignmentTypes';
import { formatDeadline, getDaysUntilDeadline, isNearDeadline } from '@/Types/EvidenceAssignmentTypes';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { fileService } from '@/Services/FileService';
import { useToast } from '@/Context/ToastContext';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { FileList } from '@/Components/Ui/Upload';
import type { FileModel } from '@/Types/FileTypes';

interface EvidenceAssignmentDetailProps {
  /** ID de la asignación a mostrar */
  assignmentId: number;
  /** Callback al cerrar el modal */
  onClose: () => void;
}

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-2.5 block', TYPOGRAPHY.table.header)}>
    {label}
  </span>
);

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string; inline?: boolean }> = ({
  label, children, className, inline = false,
}) => (
  <div className={cn(inline ? 'flex items-center gap-2.5 flex-wrap' : 'flex flex-col gap-1', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', inline && 'shrink-0', TYPOGRAPHY.table.header)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);

interface DeadlineWarningProps {
  isOverdue: boolean;
  isNearDue: boolean;
  daysUntilDeadline: number | null;
}

const DeadlineWarning: React.FC<DeadlineWarningProps> = ({ isOverdue, isNearDue, daysUntilDeadline }) => {
  if (!isOverdue && !isNearDue) return null;
  const Icon = isOverdue ? SystemIcons.interface.alert : SystemIcons.interface.clock;
  return (
    <div className={cn(
      'flex items-center gap-2.5 px-4 py-3 rounded-corner mb-5 border',
      isOverdue ? 'bg-error-light border-error-ring' : 'bg-warning/10 border-warning/30',
    )}>
      <Icon className={cn(ICON_SIZES.sm, 'flex-shrink-0', isOverdue ? 'text-error' : 'text-warning')} />
      <p className={cn(TYPOGRAPHY.modal.body, 'font-semibold', isOverdue ? 'text-error' : 'text-warning')}>
        {isOverdue
          ? `¡Fecha límite vencida hace ${Math.abs(daysUntilDeadline!)} días!`
          : `Vence en ${daysUntilDeadline} día${daysUntilDeadline === 1 ? '' : 's'}`
        }
      </p>
    </div>
  );
};


function formatAssignmentDate(fechaAsignacion: string): string {
  const assignmentDate = new Date(fechaAsignacion);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - assignmentDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays <= 7) return `Hace ${diffDays} días`;
  return new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }).format(assignmentDate);
}

export const EvidenceAssignmentDetail: React.FC<EvidenceAssignmentDetailProps> = ({
  assignmentId,
  onClose,
}) => {
  const [fetchState, setFetchState] = useState<{ assignment: EvidenceAssignment | null; loading: boolean }>({ assignment: null, loading: true });
  const assignment = fetchState.assignment;
  const loading = fetchState.loading;
  const [filesState, setFilesState] = useState<{ uploadedFiles: FileModel[]; loadingFiles: boolean }>({ uploadedFiles: [], loadingFiles: false });
  const uploadedFiles = filesState.uploadedFiles;
  const loadingFiles = filesState.loadingFiles;
  const { showToast } = useToast();

  useEffect(() => {
    loadAssignmentDetail();
  }, [assignmentId]);

  const loadAssignmentDetail = async () => {
    try {
      setFetchState(prev => ({ ...prev, loading: true }));
      const data = await evidenceAssignmentService.getById(assignmentId);
      setFetchState({ assignment: data, loading: false });
      // Cargar archivos de la evidencia
      if (data.evidencia_id) {
        loadFiles(data.evidencia_id);
      }
    } catch (error) {
      console.error('Error al cargar detalle de asignación:', error);
      showToast({ type: 'error', title: 'Error', message: 'Error al cargar los detalles de la asignación' });
      setFetchState(prev => ({ ...prev, loading: false }));
      onClose();
    }
  };

  const loadFiles = async (evidenciaId: number) => {
    try {
      setFilesState({ uploadedFiles: [], loadingFiles: true });
      const files = await fileService.listFiles({ evidencia_id: evidenciaId });
      setFilesState({ uploadedFiles: files, loadingFiles: false });
    } catch (error) {
      console.error('Error al cargar archivos:', error);
      setFilesState(prev => ({ ...prev, loadingFiles: false }));
      // No mostrar error, simplemente no mostrar archivos
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await fileService.deleteFile(fileId);
      showToast({ 
        type: 'success', 
        title: 'Archivo eliminado', 
        message: 'El archivo se eliminó correctamente' 
      });
      // Recargar archivos
      if (assignment?.evidencia_id) {
        loadFiles(assignment.evidencia_id);
      }
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        title: 'Error al eliminar', 
        message: error.message || 'No se pudo eliminar el archivo' 
      });
    }
  };

  // Render loading
  if (loading) {
    return (
      <DetailsModal
        isOpen={true}
        onClose={onClose}
        title="Detalles de la evidencia"
        size="lg"
        variant="neutral"
        heroIcon={<SystemIcons.work.myEvidences className={`${ICON_SIZES.md} text-blanco-una`} />}
      >
        <div className="relative py-12 min-h-[300px]">
          <LoadingSpinner variant="loader" />
        </div>
      </DetailsModal>
    );
  }

  if (!assignment) return null;

  const daysUntilDeadline = getDaysUntilDeadline(assignment.fecha_limite);
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;
  const isNearDue = assignment.fecha_limite && isNearDeadline(assignment.fecha_limite);

  const modalVariant = isOverdue ? 'danger' : isNearDue ? 'warning' : 'info';
  const modalHeroIcon = isOverdue
    ? <SystemIcons.interface.alert className={`${ICON_SIZES.md} text-blanco-una`} />
    : isNearDue
      ? <SystemIcons.interface.clock className={`${ICON_SIZES.md} text-blanco-una`} />
      : <SystemIcons.work.myEvidences className={`${ICON_SIZES.md} text-blanco-una`} />;

  const itemName = assignment.evidencia
    ? `${assignment.evidencia.nomenclatura} - ${assignment.evidencia.descripcion}`
    : '';

  const deadlineDateText = assignment.fecha_limite
    ? formatDeadline(assignment.fecha_limite)
    : '—';

  const deadlineColorClass = isOverdue ? 'text-error font-semibold' : isNearDue ? 'text-warning font-semibold' : 'text-gris-una-2';

  return (
    <DetailsModal
      isOpen={true}
      onClose={onClose}
      title="Detalles de la evidencia"
      subtitle={itemName}
      size="lg"
      maxHeight="lg"
      variant={modalVariant}
      heroIcon={modalHeroIcon}
    >
      <div className="flex flex-col gap-5">

        {/* Alerta de urgencia */}
        <DeadlineWarning isOverdue={isOverdue} isNearDue={!!isNearDue} daysUntilDeadline={daysUntilDeadline} />

        {/* Estado y fechas — grid 3 columnas */}
        <div>
          <SectionLabel label="Estado y fechas" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-3 gap-x-6">
            <InfoCell label="Estado" inline>
              <AssignmentStatusBadge estado={assignment.estado} />
            </InfoCell>
            <InfoCell label="Fecha de asignación">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                {formatAssignmentDate(assignment.fecha_asignacion)}
              </span>
            </InfoCell>
            <InfoCell label="Fecha límite">
              <span className={cn(TYPOGRAPHY.table.cell, deadlineColorClass)}>
                {deadlineDateText}
              </span>
            </InfoCell>
          </div>
        </div>

        {/* Criterio */}
        {assignment.evidencia?.criterion && (
          <div>
            <SectionLabel label="Criterio" />
            <div className="border border-gray-200 rounded-corner p-4 flex flex-col gap-4">
              <InfoCell label="Nomenclatura">
                <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 font-semibold')}>
                  {assignment.evidencia.criterion.nomenclatura}
                </span>
              </InfoCell>
              <InfoCell label="Descripción">
                <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                  {assignment.evidencia.criterion.descripcion}
                </span>
              </InfoCell>
            </div>
          </div>
        )}

        {/* Comentarios */}
        {assignment.comentario && (
          <div>
            <SectionLabel label="Comentarios" />
            <div className="border border-gray-200 rounded-corner p-4 max-h-48 overflow-y-auto">
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap')}>
                {assignment.comentario}
              </p>
            </div>
          </div>
        )}

        {/* Retroalimentación recibida */}
        <div>
          <SectionLabel label="Retroalimentación recibida" />
          {assignment.evidencia?.comentarios && assignment.evidencia.comentarios.length > 0 ? (
            <div className="flex flex-col gap-3">
              {assignment.evidencia.comentarios.map((comentario) => (
                <div key={comentario.id} className="border border-gray-200 rounded-corner p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(TYPOGRAPHY.table.header, 'font-semibold text-gris-una-1')}>
                      {comentario.autor ?? 'Encargado'}
                    </span>
                    <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                      {new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(comentario.fecha))}
                    </span>
                  </div>
                  <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap')}>
                    {comentario.texto}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-corner p-4 flex items-center gap-3">
              <SystemIcons.actions.comment className={cn(ICON_SIZES.sm, 'text-gris-una-2 flex-shrink-0')} />
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                No hay retroalimentación aún
              </p>
            </div>
          )}
        </div>

        {/* Archivos subidos */}
        <div>
          <SectionLabel label="Archivos subidos" />
          <div className="border border-gray-200 rounded-corner p-4">
            {loadingFiles ? (
              <div className="relative min-h-[80px]">
                <LoadingSpinner />
              </div>
            ) : uploadedFiles.length > 0 ? (
              <FileList
                files={uploadedFiles}
                loading={loadingFiles}
                onDelete={handleDeleteFile}
                showActions={true}
              />
            ) : (
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 text-center py-3')}>
                No hay archivos subidos aún
              </p>
            )}
          </div>
        </div>

      </div>

    </DetailsModal>
  );
};
