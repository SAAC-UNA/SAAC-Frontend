import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button, LoadingSpinner } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { config } from '@/Config/app.config';
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
  }, []);

  const fetchData = async () => {
    try {
      // Cargar criterios, evidencias y procesos en paralelo
      const [criteriosResponse, evidenciasResponse, procesosResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/estructura/criterios`),
        fetch(`${config.API_BASE_URL}/estructura/evidencias`),
        fetch(`${config.API_BASE_URL}/estructura/procesos`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        })
      ]);
      
      if (!criteriosResponse.ok) throw new Error('Error al cargar criterios');
      if (!evidenciasResponse.ok) throw new Error('Error al cargar evidencias');
      if (!procesosResponse.ok) throw new Error('Error al cargar procesos');
      
      const criteriosData = await criteriosResponse.json();
      const evidenciasData = await evidenciasResponse.json();
      const procesosData = await procesosResponse.json();
      
      const criteriosArray = criteriosData.data || criteriosData;
      const evidenciasArray = evidenciasData.data || evidenciasData;
      const procesosArray = procesosData.data || procesosData;
      
      // Por ahora, asignar estado_aprobacion 'pendiente' y archivo_adjuntado false a todos
      // TODO: Obtener estos valores desde el backend cuando estén disponibles
      const criteriosConEstado = criteriosArray.map((c: any) => ({
        ...c,
        estado_aprobacion: (c.estado_aprobacion || 'pendiente') as EstadoAprobacion
      }));
      
      const evidenciasConArchivos = evidenciasArray.map((e: any) => ({
        ...e,
        // TODO: Este valor debe venir del backend. Por ahora simulamos algunos archivos adjuntados
        archivo_adjuntado: e.archivo_adjuntado !== undefined ? e.archivo_adjuntado : (Math.random() > 0.5)
      }));
      
      setCriterios(criteriosConEstado);
      setEvidencias(evidenciasConArchivos);
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
      // TODO: Reemplazar con llamadas reales al backend cuando estén disponibles
      // Por ahora simulamos la aprobación/rechazo
      console.log(`Simulando ${modalAction} del criterio ${selectedCriterio.id}`);
      console.log('Proceso ID:', selectedProcesoId);
      console.log('Comentario:', comentario);
      
      /* Descomentar cuando el backend esté listo:
      const endpoint = modalAction === 'aprobar' 
        ? `${config.API_BASE_URL}/criterios/${selectedCriterio.id}/aprobar`
        : `${config.API_BASE_URL}/criterios/${selectedCriterio.id}/rechazar`;

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          proceso_id: selectedProcesoId,
          comentario: comentario || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la solicitud');
      }
      */
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      // Cerrar modal de confirmación
      setIsModalOpen(false);
      setSelectedCriterio(null);
      
      // Mostrar modal de éxito
      setSuccessModalState({
        isOpen: true,
        action: modalAction
      });
      
      // Recargar datos para actualizar el estado
      // await fetchData(); // Descomentar cuando el backend actualice estados
    } catch (error) {
      console.error('Error:', error);
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
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
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
                                    <div className="space-y-2">
                                      {evidenciasCriterio.map((evidencia) => (
                                        <div
                                          key={evidencia.id}
                                          className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200"
                                        >
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                              {evidencia.nomenclatura}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                              {evidencia.descripcion}
                                            </div>
                                          </div>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                onClick={() => handleViewFiles(evidencia)}
                                                className="ml-4 p-2 text-gray-400 hover:text-rojo-una transition-colors rounded-md hover:bg-gray-100"
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
