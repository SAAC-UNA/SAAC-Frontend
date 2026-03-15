/**
 * MyEvidenceAssignmentsPage - Página principal para ver evidencias asignadas
 * HU-029 - Mis Evidencias Asignadas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
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
  
  const [pageState, setPageState] = useState<{ assignments: EvidenceAssignment[]; loading: boolean; error: string | null }>({ assignments: [], loading: true, error: null });
  const assignments = pageState.assignments;
  const loading = pageState.loading;
  const error = pageState.error;
  const [filters, setFilters] = useState<AssignmentFilters>({
    estado: 'todos',
    search: '',
    sortBy: 'fecha_asignacion',
    sortDirection: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  // HU-016: modales de detalle y extensión
  const [modalState, setModalState] = useState<{ selectedAssignment: EvidenceAssignment | null; showExtensionModal: boolean; selectedAssignmentForExtension: EvidenceAssignment | null }>({ selectedAssignment: null, showExtensionModal: false, selectedAssignmentForExtension: null });
  const selectedAssignment = modalState.selectedAssignment;
  const showExtensionModal = modalState.showExtensionModal;
  const selectedAssignmentForExtension = modalState.selectedAssignmentForExtension;

  // Cargar asignaciones al montar
  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    // Intentar obtener el ID del usuario (puede venir como usuario_id o id)
    const userId = user?.usuario_id || (user as any)?.id;
    
    if (!userId) {
      setPageState(prev => ({...prev, error: 'No se pudo obtener la información del usuario', loading: false}));
      return;
    }

    try {
      setPageState(prev => ({...prev, loading: true, error: null}));
      const data = await evidenceAssignmentService.getMyAssignments(userId);
      setPageState(prev => ({...prev, assignments: data}));
    } catch (error: any) {
      setPageState(prev => ({...prev, error: error.message || 'No se pudieron obtener las evidencias asignadas'}));
    } finally {
      setPageState(prev => ({...prev, loading: false}));
    }
  };

  const handleViewDetails = (assignment: EvidenceAssignment) => {
    setModalState(prev => ({...prev, selectedAssignment: assignment}));
  };

  const handleCloseDetail = () => {
    setModalState(prev => ({...prev, selectedAssignment: null}));
  };

  const handleStatusUpdate = (updatedAssignment: EvidenceAssignment) => {
    // Actualizar la asignación en la lista
    setPageState(prev => ({...prev, assignments: prev.assignments.map(a =>
        a.evidencia_asignacion_id === updatedAssignment.evidencia_asignacion_id
          ? updatedAssignment
          : a
      )}));
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
      procesoId: (assignment.proceso?.proceso_id ?? assignment.proceso_id).toString(),
      nombre: `${assignment.evidencia.nomenclatura} - ${assignment.evidencia.descripcion}`
    });
    
    navigate(`/evidencias/subir?${params.toString()}`);
  };

  // HU-016: Handler para solicitar ampliación
  const handleRequestExtension = (assignment: EvidenceAssignment) => {
    setModalState(prev => ({...prev, selectedAssignmentForExtension: assignment, showExtensionModal: true}));
  };

  const handleConfirmExtensionRequest = async (data: any) => {
    try {
      await extensionRequestService.createRequest(data);
      setModalState(prev => ({...prev, showExtensionModal: false, selectedAssignmentForExtension: null}));
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
        setModalState(prev => ({...prev, showExtensionModal: false, selectedAssignmentForExtension: null}));
        loadAssignments();
      } else {
        throw error; // Re-lanzar para que el modal maneje el estado de loading
      }
    }
  };

  const handleCloseExtensionModal = () => {
    setModalState(prev => ({...prev, showExtensionModal: false, selectedAssignmentForExtension: null}));
  };

  const handleFiltersChange = (newFilters: AssignmentFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const filteredAssignments = filterAndSortAssignments(assignments, filters);
  const moduleInfo = getModuleInfo('my_evidence_assignments');

  // Paginación
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          !error && assignments.length > 0 ? (
            <EvidenceAssignmentFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
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

