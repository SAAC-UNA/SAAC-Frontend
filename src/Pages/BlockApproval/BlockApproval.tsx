import React, { useState, useEffect } from 'react';
import { ScreenContainer, PageHeader } from '@/Components/Ui/Index';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { axiosInstance } from '@/Config/axios';
import { ApprovalModal } from './Components/ApprovalModal';
import { EvidenceFilesModal } from './Components/EvidenceFilesModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { Pagination } from '@/Components/Ui/Table/Pagination';
import { FilterButton, type FilterOption } from '@/Components/Ui/Buttons/FilterButton';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TYPOGRAPHY } from '@/Constants/Typography';

type ApprovalStatus = 'pendiente' | 'aprobado' | 'rechazado';

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  archivo_adjuntado?: boolean;
}

interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
  estado_aprobacion?: ApprovalStatus;
}

interface Proceso {
  proceso_id: number;
  tipo_proceso: string;
  accreditation_cycle: {
    ciclo_acreditacion_id: number;
    nombre: string;
    career_campus: {
      career: {
        nombre: string;
      };
      campus: {
        nombre: string;
      };
    };
  };
}

const BlockApproval: React.FC = () => {
  const moduleInfo = getModuleInfo('block_approval');
  const [isLoading, setIsLoading] = useState(true);
  const [criteria, setCriteria] = useState<Criterio[]>([]);
  const [evidences, setEvidences] = useState<Evidencia[]>([]);
  const [processes, setProcesses] = useState<Proceso[]>([]);
  const [selectedProcesoId, setSelectedProcesoId] = useState<number | null>(null);
  
  // Estado para el modal de aprobación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [selectedCriterion, setSelectedCriterion] = useState<Criterio | null>(null);
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Estado para evidencias expandidas
  const [expandedCriteria, setExpandedCriteria] = useState<Set<number>>(new Set());
  
  // Estado para modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    action: 'aprobar' | 'rechazar';
  }>({ isOpen: false, action: 'aprobar' });

  // Estado para filtro de aprobación
  const [approvalFilter, setApprovalFilter] = useState<ApprovalStatus | 'todos'>('pendiente');

  // Estado para modal de archivos
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [selectedEvidencia, setSelectedEvidencia] = useState<Evidencia | null>(null);

  // Opciones para el filtro de aprobación
  const filtroOptions: FilterOption<ApprovalStatus | 'todos'>[] = [
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aprobado', label: 'Aprobados' },
    { value: 'rechazado', label: 'Rechazados' }
  ];


  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProcesoId]); // Recargar cuando cambie el proceso seleccionado

  const fetchData = async () => {
    try {
      // Load criteria, evidences, processes and approvals in parallel
      const [criteriaResponse, evidencesResponse, processesResponse, approvalsResponse] = await Promise.all([
        axiosInstance.get('/estructura/criterios'),
        axiosInstance.get('/estructura/evidencias'),
        axiosInstance.get('/estructura/procesos'),
        axiosInstance.get('/aprobaciones-criterios')
      ]);
      
      const criteriaArray = criteriaResponse.data.data || criteriaResponse.data;
      const evidencesArray = evidencesResponse.data.data || evidencesResponse.data;
      const processesArray = processesResponse.data.data || processesResponse.data;
      const approvalsArray = approvalsResponse.data.data || approvalsResponse.data;
      
      // Create approvals map by criterio_id + proceso_id
      const approvalsMap = new Map<string, ApprovalStatus>();
      approvalsArray.forEach((aprobacion: any) => {
        const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
        approvalsMap.set(key, aprobacion.estado as ApprovalStatus);
      });
      
      // Assign approval status according to selected process
      const criteriaWithStatus = criteriaArray.map((c: any) => {
        const key = selectedProcesoId ? `${c.id}-${selectedProcesoId}` : '';
        const approvalStatus = approvalsMap.get(key) || 'pendiente';
        
        return {
          ...c,
          estado_aprobacion: approvalStatus as ApprovalStatus
        };
      });
      
          setCriteria(criteriaWithStatus);
          setEvidences(evidencesArray);
      setProcesses(processesArray);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEvidencesByCriterion = (criterionId: number) => {
    return evidences.filter(ev => ev.criterio_id === criterionId);
  };
  
  const toggleEvidences = (criterionId: number) => {
    setExpandedCriteria(prev => {
      const newSet = new Set<number>();
      // Si el criterio ya está expandido, ciérralo. Si no, ábrelo y cierra los demás
      if (!prev.has(criterionId)) {
        newSet.add(criterionId);
      }
      return newSet;
    });
  };

  const handleViewFiles = (evidencia: Evidencia) => {
    setSelectedEvidencia(evidencia);
    setFilesModalOpen(true);
  };

  // Filter criteria by approval status
  const filteredCriteria = criteria.filter(criterio => {
    if (approvalFilter === 'todos') return true;
    return criterio.estado_aprobacion === approvalFilter;
  });

  // Calculate paginated data
  const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);
  const paginatedCriteria = filteredCriteria.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filtered criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCriteria.length]);

  const handleAprobar = (criterio: Criterio) => {
    setSelectedCriterion(criterio);
    setModalAction('aprobar');
    setIsModalOpen(true);
  };

  const handleRechazar = (criterio: Criterio) => {
    setSelectedCriterion(criterio);
    setModalAction('rechazar');
    setIsModalOpen(true);
  };

  const handleConfirmAction = async (comentario: string) => {
    if (!selectedCriterion || !selectedProcesoId) return;

    try {
      const endpoint = modalAction === 'aprobar' 
        ? `/criterios/${selectedCriterion.id}/aprobar`
        : `/criterios/${selectedCriterion.id}/rechazar`;

      const response = await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
        comentario: comentario || null
      });

      console.log('Respuesta del backend:', response.data);

      // Cerrar modal de confirmación
      setIsModalOpen(false);
      setSelectedCriterion(null);
      
      // Mostrar modal de éxito
      setSuccessModalState({
        isOpen: true,
        action: modalAction
      });
      
      // Recargar datos para actualizar el estado
      await fetchData();
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Respuesta del error:', error.response?.data);
      
      // Mostrar el mensaje de error del backend
      const errorMessage = error.response?.data?.message || 'Error al procesar la solicitud';
      alert(errorMessage);
      
      // Cerrar modal de confirmación
      setIsModalOpen(false);
      setSelectedCriterion(null);
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
      />
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" color="gray" className="mx-auto mb-4" />
            <p className="text-gris-una">Cargando información...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Selector de proceso y filtro */}
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <CustomSelect
                label="Seleccionar Proceso"
                value={selectedProcesoId?.toString() || ''}
                placeholder="Seleccione un proceso"
                size="sm"
                onChange={(value) => setSelectedProcesoId(value ? Number(value) : null)}
                options={processes
                  .filter(proceso => 
                    proceso.accreditation_cycle?.career_campus?.career?.nombre && 
                    proceso.accreditation_cycle?.career_campus?.campus?.nombre
                  )
                  .map((proceso) => ({
                    value: proceso.proceso_id.toString(),
                    label: `${proceso.accreditation_cycle.career_campus.career.nombre} - ${proceso.accreditation_cycle.career_campus.campus.nombre} (${proceso.tipo_proceso})`
                  }))}
                maxVisibleItems={5}
              />
            </div>
            
            <FilterButton
              tooltipText="Filtrar por estado"
              options={filtroOptions}
              value={approvalFilter}
              onChange={setApprovalFilter}
            />
          </div>

          {/* Tabla de criterios */}
          {!selectedProcesoId ? (
            <div className="bg-white rounded-lg border border-gray-200 py-16">
              <div className="text-center">
                <SystemIcons.modal.document size="lg" className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-medium text-negro-una mb-1">No hay datos disponibles</p>
                <p className="text-sm text-gris-una">Seleccione un proceso para continuar</p>
              </div>
            </div>
          ) : (
            <>
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="py-4 border-b border-gray-100 text-left pl-8 pr-4">
                        <p className={`block font-sans antialiased font-normal leading-none text-gris-una opacity-70 ${TYPOGRAPHY.table.header}`}>
                          Criterio
                        </p>
                      </th>
                      <th className="px-4 py-4 border-b border-gray-100 text-center">
                        <p className={`block font-sans antialiased font-normal leading-none text-gris-una opacity-70 ${TYPOGRAPHY.table.header}`}>
                          Descripción
                        </p>
                      </th>
                      <th className="px-4 py-4 border-b border-gray-100 text-center">
                        <p className={`block font-sans antialiased font-normal leading-none text-gris-una opacity-70 ${TYPOGRAPHY.table.header}`}>
                          Evidencias
                        </p>
                      </th>
                      <th className="pl-4 pr-8 py-4 border-b border-gray-100 text-center">
                        <p className={`block font-sans antialiased font-normal leading-none text-gris-una opacity-70 ${TYPOGRAPHY.table.header}`}>
                          Acciones
                        </p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCriteria.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center">
                          <p className="text-sm text-gris-una">No hay criterios disponibles para el filtro seleccionado</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedCriteria.map((criterio) => {
                        const criterionEvidences = getEvidencesByCriterion(criterio.id);
                        const totalEvidencias = criterionEvidences.length;
                        const isExpanded = expandedCriteria.has(criterio.id);
                        
                        return (
                          <React.Fragment key={criterio.id}>
                            <tr className={isExpanded ? '' : 'border-b border-gray-100'}>
                              <td className="pl-8 pr-4 py-4">
                                <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
                                  {criterio.nomenclatura}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>
                                  {criterio.descripcion}
                                </p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {totalEvidencias > 0 ? (
                                  <button
                                    onClick={() => toggleEvidences(criterio.id)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                                  >
                                    <span>{totalEvidencias} evidencia{totalEvidencias !== 1 ? 's' : ''}</span>
                                    <svg 
                                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                ) : (
                                  <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>-</p>
                                )}
                              </td>
                              <td className="pl-4 pr-8 py-4">
                                {approvalFilter === 'pendiente' ? (
                                  <div className="flex gap-1.5 justify-center items-center">
                                    <ButtonWithTooltip
                                      variant="primary"
                                      size="sm"
                                      tooltip="Aprobar criterio"
                                      onClick={() => handleAprobar(criterio)}
                                      className="relative h-8 w-8 max-h-[32px] max-w-[32px] rounded-lg"
                                    >
                                      <SystemIcons.interface.checkCircle className="h-4 w-4" />
                                    </ButtonWithTooltip>
                                    <ButtonWithTooltip
                                      variant="secondary"
                                      size="sm"
                                      tooltip="Rechazar criterio"
                                      onClick={() => handleRechazar(criterio)}
                                      className="relative h-8 w-8 max-h-[32px] max-w-[32px] rounded-lg"
                                    >
                                      <SystemIcons.interface.xCircle className="h-4 w-4" />
                                    </ButtonWithTooltip>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>
                                      {approvalFilter === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                                    </p>
                                  </div>
                                )}
                              </td>
                            </tr>
                            
                            {/* Fila expandida con evidencias */}
                            {isExpanded && totalEvidencias > 0 && (
                              <tr className="border-b border-gray-100">
                                <td colSpan={4} className="px-8 py-3 bg-gray-50">
                                  <div className="space-y-2">
                                    <h4 className={`font-medium text-gray-700 mb-2 ${TYPOGRAPHY.table.cell}`}>
                                      Evidencias del Criterio:
                                    </h4>
                                    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
                                      {criterionEvidences.map((evidencia: Evidencia) => (
                                        <div
                                          key={evidencia.id}
                                          className="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-gray-700 truncate ${TYPOGRAPHY.table.cell}`}>
                                              <span className="font-medium text-gray-900">{evidencia.nomenclatura}</span>
                                              <span className="text-gray-500"> - {evidencia.descripcion}</span>
                                            </p>
                                          </div>
                                          <ButtonWithTooltip
                                            variant="tableView"
                                            size="sm"
                                            tooltip="Ver archivos asociados"
                                            tooltipPosition="left"
                                            onClick={() => handleViewFiles(evidencia)}
                                            className="ml-3 relative h-9 w-9 max-h-[36px] max-w-[36px]"
                                          >
                                            <SystemIcons.actions.view className="h-5 w-5" />
                                          </ButtonWithTooltip>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
              </table>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center p-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Modal de confirmación */}
      {selectedCriterion && (
        <ApprovalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCriterion(null);
          }}
          onConfirm={handleConfirmAction}
          action={modalAction}
          criterio={selectedCriterion}
          evidencias={getEvidencesByCriterion(selectedCriterion.id)}
        />
      )}
      
      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        onClose={() => setSuccessModalState({ isOpen: false, action: 'aprobar' })}
        title={successModalState.action === 'aprobar' ? 'Criterio Aprobado' : 'Criterio Rechazado'}
        message={`El criterio ha sido ${successModalState.action === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente.`}
      />
      
      {/* Modal de archivos asociados */}
      <EvidenceFilesModal
        isOpen={filesModalOpen}
        onClose={() => {
          setFilesModalOpen(false);
          setSelectedEvidencia(null);
        }}
        evidencia={selectedEvidencia}
      />
    </ScreenContainer>
  );
};

export default BlockApproval;
