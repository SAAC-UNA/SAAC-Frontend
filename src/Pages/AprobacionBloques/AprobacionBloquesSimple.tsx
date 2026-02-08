import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button, LoadingSpinner } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { axiosInstance } from '@/Config/axios';
import { ApprovalModal } from './Components/ApprovalModal';
import { SuccessModal } from '@/Components/Ui/SuccessModal';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import { Pagination } from '@/Components/Ui/Pagination';

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
}

interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
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
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [selectedCriterio, setSelectedCriterio] = useState<Criterio | null>(null);
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  // Estado para evidencias expandidas
  const [expandedCriterios, setExpandedCriterios] = useState<Set<number>>(new Set());
  
  // Estado para modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    action: 'aprobar' | 'rechazar';
  }>({ isOpen: false, action: 'aprobar' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Cargando datos...');
      
      // Cargar criterios, evidencias y procesos en paralelo
      const [criteriosResponse, evidenciasResponse, procesosResponse] = await Promise.all([
        axiosInstance.get('/estructura/criterios'),
        axiosInstance.get('/estructura/evidencias'),
        axiosInstance.get('/estructura/procesos')
      ]);
      
      const criteriosArray = criteriosResponse.data.data || criteriosResponse.data;
      const evidenciasArray = evidenciasResponse.data.data || evidenciasResponse.data;
      const procesosArray = procesosResponse.data.data || procesosResponse.data;
      
      console.log('Procesos cargados:', procesosArray);
      console.log('Criterios cargados:', criteriosArray.length);
      console.log('Evidencias cargadas:', evidenciasArray.length);
      
      setCriterios(criteriosArray);
      setEvidencias(evidenciasArray);
      setProcesos(procesosArray);
      console.log('Datos cargados exitosamente');
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

  // Calcular datos paginados
  const totalPages = Math.ceil(criterios.length / itemsPerPage);
  const paginatedCriterios = criterios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetear página cuando cambian los criterios
  useEffect(() => {
    setCurrentPage(1);
  }, [criterios.length]);

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

      await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
        comentario: comentario || null
      });

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
          {/* Selector de proceso */}
          <div className="mb-6">
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
                          No hay criterios disponibles
                        </td>
                      </tr>
                    ) : (
                      paginatedCriterios.map((criterio) => {
                        const evidenciasCriterio = getEvidenciasPorCriterio(criterio.id);
                        const totalEvidencias = evidenciasCriterio.length;
                        
                        return (
                          <tr key={criterio.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {criterio.nomenclatura}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {criterio.descripcion}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <button
                                  onClick={() => toggleEvidencias(criterio.id)}
                                  className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <span>{totalEvidencias} evidencia{totalEvidencias !== 1 ? 's' : ''}</span>
                                  {totalEvidencias > 0 && (
                                    <svg className={`w-4 h-4 transition-transform ${expandedCriterios.has(criterio.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  )}
                                </button>
                                {expandedCriterios.has(criterio.id) && totalEvidencias > 0 && (
                                  <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
                                    <div className="max-h-48 overflow-y-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nomenclatura</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {evidenciasCriterio.map((ev) => (
                                            <tr key={ev.id}>
                                              <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">{ev.nomenclatura}</td>
                                              <td className="px-3 py-2 text-xs text-gray-600">{ev.descripcion}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAprobar(criterio)}
                                >
                                  <span className="text-azul-una">
                                    {SystemIcons.actions.save({ className: 'w-3.5 h-3.5 mr-1' })}
                                  </span>
                                  Aprobar
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleRechazar(criterio)}
                                >
                                  <span className="text-rojo-una-2">
                                    {SystemIcons.actions.cancel({ className: 'w-3.5 h-3.5 mr-1' })}
                                  </span>
                                  Rechazar
                                </Button>
                              </div>
                            </td>
                        </tr>
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
    </ScreenContainer>
  );
};

export default AprobacionBloquesSimple;
