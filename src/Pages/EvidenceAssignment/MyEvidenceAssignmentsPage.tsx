/**
 * MyEvidenceAssignmentsPage - Página principal para ver evidencias asignadas
 * HU-029 - Mis Evidencias Asignadas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { LoadingSpinner } from '@/Components/Ui/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { useToast } from '@/Context/ToastContext';
import { useAuth } from '@/Context/AuthContext';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import type { EvidenceAssignment, AssignmentFilters } from '@/Types/EvidenceAssignmentTypes';
import { filterAndSortAssignments } from '@/Types/EvidenceAssignmentTypes';
import {
  EvidenceAssignmentFilters,
  EvidenceAssignmentDetail,
  EvidenceAssignmentsTable
} from './Components';

export const MyEvidenceAssignmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState<EvidenceAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AssignmentFilters>({
    estado: 'todos',
    search: '',
    sortBy: 'fecha_asignacion',
    sortDirection: 'desc'
  });
  
  const [selectedAssignment, setSelectedAssignment] = useState<EvidenceAssignment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar asignaciones al montar
  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    if (!user?.usuario_id) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo obtener la información del usuario'
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await evidenceAssignmentService.getMyAssignments(user.usuario_id);
      setAssignments(data);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al cargar asignaciones',
        message: error.message || 'No se pudieron obtener las evidencias asignadas'
      });
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
    <ScreenContainer
      title={moduleInfo.title}
      description={moduleInfo.description}
      variant="full-width"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filtros */}
        {!loading && assignments.length > 0 && (
          <EvidenceAssignmentFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={assignments.length}
            filteredCount={filteredAssignments.length}
          />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gris-una">Cargando asignaciones...</p>
            </div>
          </div>
        )}

        {/* Estado vacío - sin asignaciones */}
        {!loading && assignments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="mx-auto flex justify-center text-gris-una mb-4">
              {SystemIcons.modal.document({ size: '2xl' })}
            </div>
            <h3 className="text-lg font-semibold text-negro-una mb-2">
              No tienes evidencias asignadas
            </h3>
            <p className="text-sm text-gris-una max-w-md mx-auto">
              Actualmente no tienes evidencias asignadas. Cuando se te asigne una evidencia, 
              aparecerá aquí para que puedas gestionarla.
            </p>
          </div>
        )}

        {/* Estado vacío - filtros sin resultados */}
        {!loading && assignments.length > 0 && filteredAssignments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="mx-auto flex justify-center text-gris-una mb-4">
              {SystemIcons.interface.search({ size: '2xl' })}
            </div>
            <h3 className="text-lg font-semibold text-negro-una mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-sm text-gris-una max-w-md mx-auto mb-4">
              No hay asignaciones que coincidan con los filtros aplicados.
              Intenta ajustar los filtros de búsqueda.
            </p>
            <button
              onClick={() => setFilters({
                estado: 'todos',
                search: '',
                sortBy: 'fecha_asignacion',
                sortDirection: 'desc'
              })}
              className="text-sm text-azul-una hover:text-azul-una-dark font-medium"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}

        {/* Tabla de asignaciones */}
        {!loading && filteredAssignments.length > 0 && (
          <EvidenceAssignmentsTable
            assignments={paginatedAssignments}
            onViewDetails={handleViewDetails}
            onUploadFiles={handleUploadFiles}
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
    </ScreenContainer>
  );
};

export default MyEvidenceAssignmentsPage;
