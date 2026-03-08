/**
 * MyEvidenceAssignmentsPage - Página principal para ver evidencias asignadas
 * HU-029 - Mis Evidencias Asignadas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { useToast } from '@/Context/ToastContext';
import { useAuth } from '@/Context/AuthContext';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
import type { EvidenceAssignment, AssignmentFilters } from '@/Types/EvidenceAssignmentTypes';
import { filterAndSortAssignments } from '@/Types/EvidenceAssignmentTypes';
import {
  EvidenceAssignmentFilters,
  EvidenceAssignmentDetail,
  EvidenceAssignmentsTable
} from './Components';
import { CreateExtensionRequestModal } from '@/Components/Ui/Modals/CreateExtensionRequestModal';

export const MyEvidenceAssignmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState<EvidenceAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AssignmentFilters>({
    estado: 'todos',
    search: '',
    sortBy: 'fecha_asignacion',
    sortDirection: 'desc'
  });
  
  const [selectedAssignment, setSelectedAssignment] = useState<EvidenceAssignment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // HU-016: Estado para modal de solicitud de ampliación
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedAssignmentForExtension, setSelectedAssignmentForExtension] = useState<EvidenceAssignment | null>(null);

  // Cargar asignaciones al montar
  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    // Intentar obtener el ID del usuario (puede venir como usuario_id o id)
    const userId = user?.usuario_id || (user as any)?.id;
    
    if (!userId) {
      setError('No se pudo obtener la información del usuario');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await evidenceAssignmentService.getMyAssignments(userId);
      setAssignments(data);
    } catch (error: any) {
      setError(error.message || 'No se pudieron obtener las evidencias asignadas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (assignment: EvidenceAssignment) => {
    setSelectedAssignment(assignment);
  };

  const handleCloseDetail = () => {
    setSelectedAssignment(null);
  };

  const handleStatusUpdate = (updatedAssignment: EvidenceAssignment) => {
    // Actualizar la asignación en la lista
    setAssignments(prev =>
      prev.map(a =>
        a.evidencia_asignacion_id === updatedAssignment.evidencia_asignacion_id
          ? updatedAssignment
          : a
      )
    );
  };

  const handleUploadFiles = (assignment: EvidenceAssignment) => {
    if (!assignment.evidencia) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo obtener la información de la evidencia'
      });
      return;
    }

    // Navegar a la página de subida con los parámetros necesarios
    const params = new URLSearchParams({
      evidenciaId: assignment.evidencia.evidencia_id.toString(),
      procesoId: assignment.proceso?.proceso_id?.toString() || '',
      nombre: `${assignment.evidencia.nomenclatura} - ${assignment.evidencia.descripcion}`
    });
    
    navigate(`/evidencias/subir?${params.toString()}`);
  };

  // HU-016: Handler para solicitar ampliación
  const handleRequestExtension = (assignment: EvidenceAssignment) => {
    setSelectedAssignmentForExtension(assignment);
    setShowExtensionModal(true);
  };

  const handleConfirmExtensionRequest = async (data: any) => {
    try {
      await extensionRequestService.createRequest(data);
      setShowExtensionModal(false);
      setSelectedAssignmentForExtension(null);
      showToast({
        type: 'success',
        title: 'Solicitud enviada',
        message: 'Su solicitud de ampliación ha sido enviada correctamente'
      });
      // Recargar asignaciones para actualizar estados
      loadAssignments();
    } catch (error: any) {
      // HU-016: Manejo específico para solicitud duplicada
      const isDuplicate = error.message?.includes('Ya existe una solicitud pendiente');
      
      showToast({
        type: 'error',
        title: isDuplicate ? 'Solicitud duplicada' : 'Error',
        message: isDuplicate 
          ? 'Ya tienes una solicitud de ampliación pendiente para esta evidencia'
          : (error.message || 'No se pudo enviar la solicitud')
      });
      
      // Si es duplicado, cerrar modal y recargar para actualizar el estado
      if (isDuplicate) {
        setShowExtensionModal(false);
        setSelectedAssignmentForExtension(null);
        loadAssignments();
      } else {
        throw error; // Re-lanzar para que el modal maneje el estado de loading
      }
    }
  };

  const handleCloseExtensionModal = () => {
    setShowExtensionModal(false);
    setSelectedAssignmentForExtension(null);
  };

  const filteredAssignments = filterAndSortAssignments(assignments, filters);
  const moduleInfo = getModuleInfo('my_evidence_assignments');

  // Paginación
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          !error && assignments.length > 0 ? (
            <EvidenceAssignmentFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={assignments.length}
              filteredCount={filteredAssignments.length}
            />
          ) : undefined
        }
      >
      </PageHeader>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error del backend */}
        {error && (
          <BackendErrorAlert
            error={error}
            onRetry={loadAssignments}
          />
        )}

        {/* Tabla de asignaciones */}
        {!error && (
          <EvidenceAssignmentsTable
            assignments={paginatedAssignments}
            loading={loading}
            onViewDetails={handleViewDetails}
            onUploadFiles={handleUploadFiles}
            onRequestExtension={handleRequestExtension}
            hasFilters={filters.estado !== 'todos' || filters.search !== ''}
            pagination={totalPages > 1 ? {
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            } : undefined}
          />
        )}
      </div>

      {/* Modal de detalle */}
      {selectedAssignment && (
        <EvidenceAssignmentDetail
          assignmentId={selectedAssignment.evidencia_asignacion_id}
          onClose={handleCloseDetail}
          onStatusUpdate={handleStatusUpdate}
          onUploadFiles={handleUploadFiles}
        />
      )}

      {/* HU-016: Modal para solicitar ampliación */}
      {showExtensionModal && selectedAssignmentForExtension && (
        <CreateExtensionRequestModal
          isOpen={showExtensionModal}
          onClose={handleCloseExtensionModal}
          onConfirm={handleConfirmExtensionRequest}
          evidenciaAsignacionId={selectedAssignmentForExtension.evidencia_asignacion_id}
          fechaLimiteActual={selectedAssignmentForExtension.fecha_limite || undefined}
        />
      )}
    </ScreenContainer>
  );
};

export default MyEvidenceAssignmentsPage;
