import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button, LoadingSpinner } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { axiosInstance } from '@/Config/axios';
import { ApprovalModal } from './Components/ApprovalModal';
import { EvidenceFilesModal } from './Components/EvidenceFilesModal';
import { SuccessModal } from '@/Components/Ui/SuccessModal';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import { Pagination } from '@/Components/Ui/Pagination';
import { FilterButton, type FilterOption } from '@/Components/Ui/FilterButton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Tooltip';

type EstadoAprobacion = 'pendiente' | 'aprobado' | 'rechazado';

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
  estado_aprobacion?: EstadoAprobacion;
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

const AprobacionBloquesSimple: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [selectedProcesoId, setSelectedProcesoId] = useState<number | null>(null);
  
  // Estado para el modal de aprobación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [selectedCriterio, setSelectedCriterio] = useState<Criterio | null>(null);
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Estado para evidencias expandidas
  const [expandedCriterios, setExpandedCriterios] = useState<Set<number>>(new Set());
  
  // Estado para modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    action: 'aprobar' | 'rechazar';
  }>({ isOpen: false, action: 'aprobar' });

  // Estado para filtro de aprobación
  const [filtroAprobacion, setFiltroAprobacion] = useState<EstadoAprobacion | 'todos'>('pendiente');

  // Estado para modal de archivos
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [selectedEvidencia, setSelectedEvidencia] = useState<Evidencia | null>(null);

  // Opciones para el filtro de aprobación
  const filtroOptions: FilterOption<EstadoAprobacion | 'todos'>[] = [
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
      // Cargar criterios, evidencias, procesos y aprobaciones en paralelo
      const [criteriosResponse, evidenciasResponse, procesosResponse, aprobacionesResponse] = await Promise.all([
        axiosInstance.get('/estructura/criterios'),
        axiosInstance.get('/estructura/evidencias'),
        axiosInstance.get('/estructura/procesos'),
        axiosInstance.get('/aprobaciones-criterios')
      ]);
      
      const criteriosArray = criteriosResponse.data.data || criteriosResponse.data;
      const evidenciasArray = evidenciasResponse.data.data || evidenciasResponse.data;
      const procesosArray = procesosResponse.data.data || procesosResponse.data;
      const aprobacionesArray = aprobacionesResponse.data.data || aprobacionesResponse.data;
      
      // Crear mapa de aprobaciones por criterio_id + proceso_id
      const aprobacionesMap = new Map<string, EstadoAprobacion>();
      aprobacionesArray.forEach((aprobacion: any) => {
        const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
        aprobacionesMap.set(key, aprobacion.estado as EstadoAprobacion);
      });
      
      // Asignar estado de aprobación según el proceso seleccionado
      const criteriosConEstado = criteriosArray.map((c: any) => {
        const key = selectedProcesoId ? `${c.id}-${selectedProcesoId}` : '';
        const estadoAprobacion = aprobacionesMap.get(key) || 'pendiente';
        
        return {
          ...c,
          estado_aprobacion: estadoAprobacion as EstadoAprobacion
        };
      });
      
          setCriterios(criteriosConEstado);
          setEvidencias(evidenciasArray);
      setProcesos(procesosArray);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEvidenciasPorCriterio = (criterioId: number) => {
    return evidencias.filter(ev => ev.criterio_id === criterioId);
  };
  
  const toggleEvidencias = (criterioId: number) => {
    setExpandedCriterios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(criterioId)) {
        newSet.delete(criterioId);
      } else {
        newSet.add(criterioId);
      }
      return newSet;
    });
  };

  const handleViewFiles = (evidencia: Evidencia) => {
    setSelectedEvidencia(evidencia);
    setFilesModalOpen(true);
  };

  // Filtrar criterios según estado de aprobación
  const criteriosFiltrados = criterios.filter(criterio => {
    if (filtroAprobacion === 'todos') return true;
    return criterio.estado_aprobacion === filtroAprobacion;
  });

  // Calcular datos paginados
  const totalPages = Math.ceil(criteriosFiltrados.length / itemsPerPage);
  const paginatedCriterios = criteriosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetear página cuando cambian los criterios filtrados
  useEffect(() => {
    setCurrentPage(1);
  }, [criteriosFiltrados.length]);

  const handleAprobar = (criterio: Criterio) => {
    setSelectedCriterio(criterio);
    setModalAction('aprobar');
    setIsModalOpen(true);
  };

  const handleRechazar = (criterio: Criterio) => {
    setSelectedCriterio(criterio);
    setModalAction('rechazar');
    setIsModalOpen(true);
  };

  const handleConfirmAction = async (comentario: string) => {
    if (!selectedCriterio || !selectedProcesoId) return;

    try {
      const endpoint = modalAction === 'aprobar' 
        ? `/criterios/${selectedCriterio.id}/aprobar`
        : `/criterios/${selectedCriterio.id}/rechazar`;

      const response = await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
        comentario: comentario || null
      });

      console.log('Respuesta del backend:', response.data);

      // Cerrar modal de confirmación
      setIsModalOpen(false);
      setSelectedCriterio(null);
      
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
      setSelectedCriterio(null);
    }
  };

  return (
    <ScreenContainer
      title="Aprobación de Bloques"
      description="Seleccione un proceso para ver y aprobar los criterios correspondientes validando que todas las evidencias estén adjuntadas"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
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
                options={procesos
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
              tooltipText="Filtrar por estado de aprobación"
              options={filtroOptions}
              value={filtroAprobacion}
              onChange={setFiltroAprobacion}
            />
          </div>

          {/* Tabla de criterios */}
          {selectedProcesoId && (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Criterio
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Descripción
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Evidencias
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCriterios.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                          No hay criterios disponibles para el filtro seleccionado
                        </td>
                      </tr>
                    ) : (
                      paginatedCriterios.map((criterio) => {
                        const evidenciasCriterio = getEvidenciasPorCriterio(criterio.id);
                        const totalEvidencias = evidenciasCriterio.length;
                        const isExpanded = expandedCriterios.has(criterio.id);
                        
                        return (
                          <React.Fragment key={criterio.id}>
                            <tr>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {criterio.nomenclatura}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {criterio.descripcion}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {totalEvidencias > 0 ? (
                                  <button
                                    onClick={() => toggleEvidencias(criterio.id)}
                                    className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
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
                                  <span className="text-sm text-gray-400">Sin evidencias</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {filtroAprobacion === 'pendiente' ? (
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleAprobar(criterio)}
                                      className="w-24"
                                    >
                                      Aprobar
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleRechazar(criterio)}
                                      className="w-24"
                                    >
                                      Rechazar
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    {filtroAprobacion === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                                  </span>
                                )}
                              </td>
                            </tr>
                            
                            {/* Fila expandida con evidencias */}
                            {isExpanded && totalEvidencias > 0 && (
                              <tr>
                                <td colSpan={4} className="px-4 py-4 bg-gray-50">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                      Evidencias del Criterio:
                                    </h4>
                                    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
                                      {evidenciasCriterio.map((evidencia) => (
                                        <div
                                          key={evidencia.id}
                                          className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-700 truncate">
                                              <span className="font-medium text-gray-900">{evidencia.nomenclatura}</span>
                                              <span className="text-gray-500"> - {evidencia.descripcion}</span>
                                            </div>
                                          </div>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                onClick={() => handleViewFiles(evidencia)}
                                                className="ml-3 p-1.5 text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100"
                                              >
                                                <SystemIcons.actions.view className="w-5 h-5" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="left">
                                              Ver archivos asociados
                                            </TooltipContent>
                                          </Tooltip>
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
              </div>

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
      {selectedCriterio && (
        <ApprovalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCriterio(null);
          }}
          onConfirm={handleConfirmAction}
          action={modalAction}
          criterio={selectedCriterio}
          evidencias={getEvidenciasPorCriterio(selectedCriterio.id)}
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

export default AprobacionBloquesSimple;
