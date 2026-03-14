import React, { useEffect, useState } from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Button } from '@/Components/Ui/Buttons/Button';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import type { EvidenceAssignment, AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
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
  /** Callback al actualizar el estado */
  onStatusUpdate?: (updatedAssignment: EvidenceAssignment) => void;
  /** Callback al solicitar subir archivos */
  onUploadFiles?: (assignment: EvidenceAssignment) => void;
}

/**
 * Modal de detalle de asignación de evidencia
 * 
 * Muestra información completa de la asignación incluyendo:
 * - Datos de la evidencia y proceso
 * - Estado actual y fecha límite
 * - Comentarios y observaciones
 * - Acciones disponibles según el estado
 */
export const EvidenceAssignmentDetail: React.FC<EvidenceAssignmentDetailProps> = ({
  assignmentId,
  onClose,
  onStatusUpdate,
  onUploadFiles
}) => {
  const [assignment, setAssignment] = useState<EvidenceAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileModel[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadAssignmentDetail();
  }, [assignmentId]);

  const loadAssignmentDetail = async () => {
    try {
      setLoading(true);
      const data = await evidenceAssignmentService.getById(assignmentId);
      setAssignment(data);
      // Cargar archivos de la evidencia
      if (data.evidencia_id) {
        loadFiles(data.evidencia_id);
      }
    } catch (error) {
      console.error('Error al cargar detalle de asignación:', error);
      showToast({ type: 'error', title: 'Error', message: 'Error al cargar los detalles de la asignación' });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async (evidenciaId: number) => {
    try {
      setLoadingFiles(true);
      const files = await fileService.listFiles({ evidencia_id: evidenciaId });
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
      // No mostrar error, simplemente no mostrar archivos
    } finally {
      setLoadingFiles(false);
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

  const handleStatusChange = async (newStatus: AssignmentStatus) => {
    if (!assignment) return;

    try {
      setUpdatingStatus(true);
      const updated = await evidenceAssignmentService.updateStatus(assignment.evidencia_asignacion_id, {
        estado: newStatus
      });
      
      setAssignment(updated);
      onStatusUpdate?.(updated);
      
      // Mostrar modal de éxito si se marca como completado
      if (newStatus === 'completado') {
        setShowSuccessModal(true);
      } else {
        showToast({ type: 'success', title: 'Éxito', message: `Estado actualizado a: ${newStatus}` });
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showToast({ type: 'error', title: 'Error', message: 'Error al actualizar el estado' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUploadClick = () => {
    if (assignment) {
      onUploadFiles?.(assignment);
    }
  };

  // Render loading
  if (loading) {
    return (
      <DetailsModal
        isOpen={true}
        onClose={onClose}
        title="Cargando..."
        cancelLabel="Cerrar"
        size="xl"
      >
        <div className="relative py-12 min-h-[400px]">
          <LoadingSpinner variant="loader" />
        </div>
      </DetailsModal>
    );
  }

  if (!assignment) return null;

  const daysUntilDeadline = getDaysUntilDeadline(assignment.fecha_limite);
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;
  const isNearDue = assignment.fecha_limite && isNearDeadline(assignment.fecha_limite);

  const modalTitle = 'Detalles de la evidencia';

  const itemName = assignment.evidencia
    ? `${assignment.evidencia.nomenclatura} - ${assignment.evidencia.descripcion}`
    : '';

  const renderStatusAndDeadline = () => (
    <div className="bg-white border border-gray-200 rounded-corner p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Estado:</span>
          <AssignmentStatusBadge estado={assignment.estado} />
        </div>
        {assignment.fecha_limite && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">Fecha Límite:</span>
            <span className={`text-sm font-medium ${
              isOverdue ? 'text-red-600' : isNearDue ? 'text-orange-600' : 'text-gray-700'
            }`}>
              {SystemIcons.interface.calendar({ size: 'xs', className: 'inline mr-1' })}
              {formatDeadline(assignment.fecha_limite)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderDeadlineWarning = () => {
    if (!assignment.fecha_limite || (!isOverdue && !isNearDue)) return null;

    return (
      <div className={`flex items-start gap-3 p-4 rounded-corner mb-6 ${
        isOverdue ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
      }`}>
        {isOverdue 
          ? SystemIcons.interface.alert({ size: 'md', className: 'flex-shrink-0 text-red-600' })
          : SystemIcons.interface.clock({ size: 'md', className: 'flex-shrink-0 text-orange-600' })
        }
        <div className="flex-1">
          <p className={`font-semibold ${isOverdue ? 'text-red-900' : 'text-orange-900'}`}>
            {isOverdue ? '¡Fecha límite vencida!' : 'Fecha límite próxima'}
          </p>
          <p className={`text-sm ${isOverdue ? 'text-red-700' : 'text-orange-700'}`}>
            {isOverdue
              ? `Venció hace ${Math.abs(daysUntilDeadline!)} días`
              : `Vence en ${daysUntilDeadline} días`
            }
          </p>
        </div>
      </div>
    );
  };



  const renderComments = () => {
    if (!assignment.comentario) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <SystemIcons.modal.document className="w-5 h-5 text-gray-600" />
          <h3 className="font-sm text-gray-800">Comentarios</h3>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-corner p-4 max-h-60 overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.comentario}</p>
        </div>
      </div>
    );
  };

  const renderCriterionInfo = () => {
    if (!assignment.evidencia?.criterion) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <SystemIcons.users.roles className="w-5 h-5 text-gray-600" />
          <h3 className="font-sm text-gray-800">Criterio</h3>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-corner p-4 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-semibold text-gray-800">Nomenclatura:</span>
              <p className="text-sm text-gray-700">{assignment.evidencia.criterion.nomenclatura}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">Descripción:</span>
              <p className="text-sm text-gray-700">{assignment.evidencia.criterion.descripcion}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatAssignmentDate = (fechaAsignacion: string): string => {
    const assignmentDate = new Date(fechaAsignacion);
    const now = new Date();
    const diffTime = now.getTime() - assignmentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Asignado hoy';
    } else if (diffDays === 1) {
      return 'Asignado ayer';
    } else if (diffDays <= 7) {
      return `Asignado hace ${diffDays} días`;
    } else {
      return new Intl.DateTimeFormat('es-CR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(assignmentDate);
    }
  };

  const renderDates = () => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <SystemIcons.interface.calendar className="w-5 h-5 text-gray-600" />
        <h3 className="font-sm text-gray-800">Fechas Importantes</h3>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-corner p-4 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          <div>
            <span className="text-sm font-semibold text-gray-800">Fecha de Asignación:</span>
            <p className="text-sm text-gray-700">{formatAssignmentDate(assignment.fecha_asignacion)}</p>
          </div>
          {assignment.fecha_limite && (
            <div>
              <span className="text-sm font-semibold text-gray-800">Fecha Límite:</span>
              <p className={`text-sm font-medium ${
                isOverdue ? 'text-red-600' : isNearDue ? 'text-orange-600' : 'text-gray-700'
              }`}>
                {formatDeadline(assignment.fecha_limite)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUploadedFiles = () => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <SystemIcons.modal.document className="w-5 h-5 text-gray-600" />
        <h3 className="font-sm text-gray-800">Archivos Subidos</h3>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-corner p-4">
        {loadingFiles ? (
          <div className="relative min-h-[100px]">
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
          <p className="text-sm text-gray-500 text-center py-4">
            No hay archivos subidos aún
          </p>
        )}
      </div>
    </div>
  );

  const renderActions = () => (
    <div className="mb-6 border-t border-gray-200 pt-4">
      <h3 className="font-sm text-gray-800 mb-3">Acciones Disponibles</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        {assignment.estado !== 'en_progreso' && assignment.estado !== 'completado' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusChange('en_progreso')}
            disabled={updatingStatus}
          >
            {SystemIcons.interface.refresh({ size: 'sm' })}
            Marcar en Progreso
          </Button>
        )}
        {assignment.estado !== 'completado' && (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleStatusChange('completado')}
            disabled={updatingStatus}
          >
            {SystemIcons.interface.checkCircle({ size: 'sm' })}
            Marcar Completado
          </Button>
        )}
        {assignment.estado !== 'completado' && (
          <Button
            variant="primary"
            onClick={handleUploadClick}
          >
            {SystemIcons.interface.upload({ size: 'sm' })}
            Subir Archivos
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <DetailsModal
      isOpen={true}
      onClose={onClose}
      title={modalTitle}
      itemName={itemName}
      itemType="evidencia"
      cancelLabel="Cerrar"
      size="xl"
    >
      {renderStatusAndDeadline()}
      {renderDeadlineWarning()}
      {renderCriterionInfo()}
      {renderComments()}
      {renderDates()}
      {renderUploadedFiles()}
      {renderActions()}
      
      {/* Modal de éxito al completar */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Evidencia Completada!"
        message="La evidencia ha sido marcada como completada exitosamente."
        onClose={() => setShowSuccessModal(false)}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </DetailsModal>
  );
};
