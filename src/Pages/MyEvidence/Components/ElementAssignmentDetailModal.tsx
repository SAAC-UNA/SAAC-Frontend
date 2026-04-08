import React, { useEffect, useState } from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { cn } from '@/Utils/ClassNames';
import { ICON_SIZES } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { EVIDENCE_STATUS_BADGE } from '@/Constants/StatusBadges';
import type { FlexibleAssignmentItem } from '@/Types/EvidenceAssignment';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { useToast } from '@/Context/ToastContext';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { FileList } from '@/Components/Ui/Upload';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Feedback/Tooltip';
import type { FileModel } from '@/Types/FileTypes';
import { formatDateShort } from '@/Utils/DateUtils';

interface ElementAssignmentDetailModalProps {
  assignmentId: number;
  onClose: () => void;
}

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);

const Separator: React.FC = () => (
  <div className="col-span-6 py-1">
    <hr className="border-gray-200" />
  </div>
);

function getDaysUntil(fechaLimite: string | null): number | null {
  if (!fechaLimite) return null;
  const now = new Date();
  const deadline = new Date(fechaLimite);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDeadlineText(fecha: string | null): string {
  if (!fecha) return '—';
  return formatDateShort(new Date(fecha));
}

export const ElementAssignmentDetailModal: React.FC<ElementAssignmentDetailModalProps> = ({
  assignmentId,
  onClose,
}) => {
  const { showToast } = useToast();
  const [fetchState, setFetchState] = useState<{ assignment: FlexibleAssignmentItem | null; loading: boolean }>({
    assignment: null,
    loading: true,
  });
  const [filesState, setFilesState] = useState<{ files: FileModel[]; loadingFiles: boolean }>({
    files: [],
    loadingFiles: false,
  });

  useEffect(() => {
    loadDetail();
  }, [assignmentId]);

  const loadDetail = async () => {
    try {
      setFetchState(prev => ({ ...prev, loading: true }));
      const data = await evidenceAssignmentService.getElementAssignmentById(assignmentId);
      setFetchState({ assignment: data, loading: false });
      loadFiles(data.elemento_id, data.proceso_id, data.usuario_id);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Error al cargar los detalles de la asignación' });
      setFetchState(prev => ({ ...prev, loading: false }));
      onClose();
    }
  };

  const loadFiles = async (elementoId: number, procesoId: number, usuarioId: number) => {
    try {
      setFilesState({ files: [], loadingFiles: true });
      const files = await evidenceAssignmentService.getElementFiles(elementoId, procesoId, usuarioId);
      setFilesState({ files, loadingFiles: false });
    } catch {
      setFilesState(prev => ({ ...prev, loadingFiles: false }));
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await evidenceAssignmentService.deleteElementFile(fileId);
      showToast({ type: 'success', title: 'Archivo eliminado', message: 'El archivo se eliminó correctamente' });
      if (fetchState.assignment) {
        loadFiles(
          fetchState.assignment.elemento_id,
          fetchState.assignment.proceso_id,
          fetchState.assignment.usuario_id,
        );
      }
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al eliminar', message: error.message || 'No se pudo eliminar el archivo' });
    }
  };

  if (fetchState.loading) {
    return (
      <DetailsModal
        isOpen={true}
        onClose={onClose}
        title="Detalles de la pauta"
        size="lg"
        variant="neutral"
        heroIcon={<SystemIcons.work.myEvidences className={`${ICON_SIZES.md} text-blanco-una`} />}
      >
        <div className="relative py-12 min-h-75">
          <LoadingSpinner variant="loader" />
        </div>
      </DetailsModal>
    );
  }

  const assignment = fetchState.assignment;
  if (!assignment) return null;

  const daysUntil = getDaysUntil(assignment.fecha_limite);
  const isOverdue = daysUntil !== null && daysUntil < 0;
  const isNearDue = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7;

  const modalVariant = isOverdue ? 'danger' : isNearDue ? 'warning' : 'info';
  const heroIcon = isOverdue
    ? <SystemIcons.interface.alert className={`${ICON_SIZES.md} text-blanco-una`} />
    : isNearDue
      ? <SystemIcons.interface.clock className={`${ICON_SIZES.md} text-blanco-una`} />
      : <SystemIcons.work.myEvidences className={`${ICON_SIZES.md} text-blanco-una`} />;

  const itemName = assignment.element?.nombre ?? '—';
  const deadlineColorClass = isOverdue
    ? 'text-error font-semibold'
    : isNearDue
      ? 'text-warning font-semibold'
      : 'text-gris-una-2';

  const badge = EVIDENCE_STATUS_BADGE[assignment.estado as keyof typeof EVIDENCE_STATUS_BADGE];
  const isReturnedPending =
    assignment.estado === 'Pendiente' && assignment.is_returned_for_changes === true;
  const badgeLabel = isReturnedPending
    ? 'Pendiente'
    : badge?.label ?? assignment.estado;
  const badgeColor = isReturnedPending
    ? 'bg-error-ring text-error'
    : badge?.colorClasses ?? 'bg-gris-light text-gris-una';

  return (
    <DetailsModal
      isOpen={true}
      onClose={onClose}
      title="Detalles de la pauta"
      subtitle={itemName}
      size="lg"
      maxHeight="lg"
      variant={modalVariant}
      heroIcon={heroIcon}
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-3">

        {/* Alerta de urgencia */}
        {(isOverdue || isNearDue) && (
          <div className="col-span-6">
            <div className={cn(
              'flex items-center gap-2.5 px-4 py-3 rounded-corner border',
              isOverdue ? 'bg-error-light border-error-ring' : 'bg-warning/10 border-warning/30',
            )}>
              {isOverdue
                ? <SystemIcons.interface.alert className={cn(ICON_SIZES.sm, 'shrink-0 text-error')} />
                : <SystemIcons.interface.clock className={cn(ICON_SIZES.sm, 'shrink-0 text-warning')} />
              }
              <p className={cn(TYPOGRAPHY.modal.body, 'font-semibold', isOverdue ? 'text-error' : 'text-warning')}>
                {isOverdue
                  ? `¡Fecha límite vencida hace ${Math.abs(daysUntil!)} días!`
                  : `Vence en ${daysUntil} día${daysUntil === 1 ? '' : 's'}`
                }
              </p>
            </div>
          </div>
        )}

        {/* Estado */}
        <InfoCell label="Estado" className="col-start-1 col-end-3 items-start">
          {isReturnedPending ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <StatusBadge
                    label={badgeLabel}
                    colorClasses={badgeColor}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Devuelta por rechazo</TooltipContent>
            </Tooltip>
          ) : (
            <StatusBadge
              label={badgeLabel}
              colorClasses={badgeColor}
            />
          )}
        </InfoCell>

        {/* Proceso */}
        <InfoCell label="Proceso" className="col-start-3 col-end-5">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {assignment.process?.nombre ?? `Proceso ${assignment.proceso_id}`}
          </span>
        </InfoCell>

        {/* Fecha límite */}
        <InfoCell label="Fecha límite" className="col-start-5 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, deadlineColorClass)}>
            {formatDeadlineText(assignment.fecha_limite)}
          </span>
        </InfoCell>

        <Separator />

        {/* Tipo y descripción del elemento */}
        {assignment.element && (
          <>
            <div className="col-span-6 flex flex-col gap-0.5">
              {assignment.element.nomenclatura && (
                <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una font-mono text-xs')}>
                  {assignment.element.nomenclatura}
                </span>
              )}
              <span className={cn(TYPOGRAPHY.modal.body, 'text-negro-una-2 font-semibold')}>
                {assignment.element.tipo}
              </span>
              {assignment.element.descripcion && (
                <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                  {assignment.element.descripcion}
                </span>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Comentario de asignación */}
        {assignment.comentario && (
          <>
            <div className="col-span-6 flex flex-col gap-1">
              <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
                Instrucciones del encargado
              </span>
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap')}>
                {assignment.comentario}
              </p>
            </div>
            <Separator />
          </>
        )}

        {/* Retroalimentación recibida */}
        <div className="col-span-6 flex flex-col gap-2">
          <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
            Retroalimentación recibida
          </span>
          {assignment.comments && assignment.comments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {assignment.comments.map(comentario => (
                <div key={comentario.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(TYPOGRAPHY.modal.subtitle, 'font-semibold text-gris-una-1')}>
                      {comentario.autor}
                    </span>
                    <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                      {formatDateShort(new Date(comentario.fecha))}
                    </span>
                  </div>
                  <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap')}>
                    {comentario.texto}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <SystemIcons.actions.comment className={cn(ICON_SIZES.sm, 'text-gris-una-2 shrink-0')} />
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                No hay retroalimentación aún
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Archivos subidos */}
        <div className="col-span-6 flex flex-col gap-2">
          <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
            Archivos subidos
          </span>
          {filesState.loadingFiles ? (
            <div className="relative min-h-20">
              <LoadingSpinner />
            </div>
          ) : filesState.files.length > 0 ? (
            <FileList
              files={filesState.files}
              loading={filesState.loadingFiles}
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
    </DetailsModal>
  );
};
