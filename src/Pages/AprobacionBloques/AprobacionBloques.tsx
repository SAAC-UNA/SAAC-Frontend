/**
 * AprobacionBloques - Página de aprobación por bloques de evidencia (HU010)
 * 
 * Permite al encargado de acreditación aprobar o rechazar criterios completos
 * (bloques de evidencias) validando que todas las evidencias estén adjuntadas.
 */

import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button, LoadingSpinner } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { config } from '@/Config/app.config';
import { useToast } from '@/Context/ToastContext';
import { ApprovalModal } from './Components/ApprovalModal';

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  archivo_adjuntado: boolean;
}

interface CriterioBloque {
  id: number;
  nomenclatura: string;
  descripcion: string;
  total_evidencias: number;
  evidencias_completadas: number;
  evidencias_faltantes: number;
  estado_aprobacion: 'pendiente' | 'aprobado' | 'rechazado' | null;
  evidencias: Evidencia[];
  puede_aprobar: boolean;
}

interface Proceso {
  proceso_id: number;
  carrera_nombre: string;
  campus_nombre: string;
}

export const AprobacionBloques: React.FC = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [selectedProcesoId, setSelectedProcesoId] = useState<number | null>(null);
  const [criterios, setCriterios] = useState<CriterioBloque[]>([]);
  const [expandedCriterios, setExpandedCriterios] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [selectedCriterio, setSelectedCriterio] = useState<CriterioBloque | null>(null);

  // Cargar procesos al montar
  useEffect(() => {
    fetchProcesos();
  }, []);

  // Cargar criterios cuando se selecciona un proceso
  useEffect(() => {
    if (selectedProcesoId !== null) {
      fetchCriterios(selectedProcesoId);
    }
  }, [selectedProcesoId]);

  const fetchProcesos = async () => {
    try {
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/estructura/procesos`);
      if (!response.ok) throw new Error('Error al cargar procesos');
      
      const data = await response.json();
      setProcesos(data);
      
      if (data.length > 0) {
        setSelectedProcesoId(data[0].proceso_id);
      } else {
        setError('No hay procesos disponibles');
      }
    } catch (error) {
      console.error('Error cargando procesos:', error);
      setError('Error al cargar los procesos. Verifique que el servidor esté funcionando.');
      showToast({ type: 'error', title: 'Error al cargar los procesos' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCriterios = async (_procesoId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Obtener todos los criterios
      const criteriosResponse = await fetch(`${config.API_BASE_URL}/estructura/criterios`);
      if (!criteriosResponse.ok) throw new Error('Error al cargar criterios');
      
      const criteriosData = await criteriosResponse.json();
      const criteriosArray = criteriosData.data || criteriosData;

      // Obtener evidencias
      const evidenciasResponse = await fetch(`${config.API_BASE_URL}/estructura/evidencias`);
      if (!evidenciasResponse.ok) throw new Error('Error al cargar evidencias');
      
      const evidenciasData = await evidenciasResponse.json();
      const evidenciasArray = evidenciasData.data || evidenciasData;

      // Agrupar evidencias por criterio y calcular estadísticas
      const criteriosConEstadisticas: CriterioBloque[] = criteriosArray.map((criterio: any) => {
        const evidenciasCriterio = evidenciasArray.filter(
          (ev: any) => ev.criterio_id === criterio.id
        );

        const evidenciasCompletadas = evidenciasCriterio.filter(
          (ev: any) => ev.archivo_adjuntado
        ).length;

        const totalEvidencias = evidenciasCriterio.length;
        const evidenciasFaltantes = totalEvidencias - evidenciasCompletadas;

        return {
          id: criterio.id,
          nomenclatura: criterio.nomenclatura,
          descripcion: criterio.descripcion,
          total_evidencias: totalEvidencias,
          evidencias_completadas: evidenciasCompletadas,
          evidencias_faltantes: evidenciasFaltantes,
          estado_aprobacion: null, // TODO: Obtener del backend
          evidencias: evidenciasCriterio.map((ev: any) => ({
            id: ev.id,
            nomenclatura: ev.nomenclatura,
            descripcion: ev.descripcion,
            archivo_adjuntado: ev.archivo_adjuntado || false
          })),
          puede_aprobar: evidenciasFaltantes === 0
        };
      });

      setCriterios(criteriosConEstadisticas);
    } catch (error) {
      console.error('Error cargando criterios:', error);
      setError('Error al cargar los criterios');
      showToast({ type: 'error', title: 'Error al cargar los criterios' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCriterio = (criterioId: number) => {
    const newExpanded = new Set(expandedCriterios);
    if (newExpanded.has(criterioId)) {
      newExpanded.delete(criterioId);
    } else {
      newExpanded.add(criterioId);
    }
    setExpandedCriterios(newExpanded);
  };

  const handleOpenModal = (criterio: CriterioBloque, action: 'aprobar' | 'rechazar') => {
    setSelectedCriterio(criterio);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleConfirmAction = async (comentario: string) => {
    if (!selectedCriterio || !selectedProcesoId) return;

    try {
      const endpoint = modalAction === 'aprobar' 
        ? `${config.API_BASE_URL}/criterios/${selectedCriterio.id}/aprobar`
        : `${config.API_BASE_URL}/criterios/${selectedCriterio.id}/rechazar`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          proceso_id: selectedProcesoId,
          comentario: comentario || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${modalAction} el criterio`);
      }

      showToast({ type: 'success', title: `Criterio ${modalAction === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente` });

      // Recargar criterios
      await fetchCriterios(selectedProcesoId);
      setModalOpen(false);
    } catch (error) {
      showToast({ type: 'error', title: error instanceof Error ? error.message : `Error al ${modalAction} el criterio` });
    }
  };

  const getEstadoBadge = (estado: string | null) => {
    if (!estado) return null;

    const badges = {
      'aprobado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
      'rechazado': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
      'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' }
    };

    const badge = badges[estado as keyof typeof badges];
    if (!badge) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getCompletenessColor = (criterio: CriterioBloque) => {
    if (criterio.evidencias_faltantes === 0) return 'text-green-600';
    if (criterio.evidencias_completadas > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <ScreenContainer
      title="Aprobación de Bloques"
      description="Aprobar o rechazar criterios completos validando que todas las evidencias estén adjuntadas"
    >
      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <SystemIcons.interface.alert className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Proceso */}
      {!error && procesos.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Proceso
          </label>
          <select
            value={selectedProcesoId || ''}
            onChange={(e) => setSelectedProcesoId(Number(e.target.value))}
            className="block w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rojo-una focus:border-rojo-una"
          >
            {procesos.map((proceso) => (
              <option key={proceso.proceso_id} value={proceso.proceso_id}>
                {proceso.carrera_nombre} - {proceso.campus_nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !error && selectedProcesoId ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-12 px-6 py-3"></th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criterio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evidencias
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {criterios.map((criterio) => (
                <React.Fragment key={criterio.id}>
                  {/* Fila Principal del Criterio */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleCriterio(criterio.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedCriterios.has(criterio.id)
                          ? <SystemIcons.interface.chevronDown className="w-5 h-5" />
                          : <SystemIcons.interface.chevronRight className="w-5 h-5" />
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{criterio.nomenclatura}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{criterio.descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getCompletenessColor(criterio)}`}>
                        {criterio.evidencias_completadas} / {criterio.total_evidencias}
                      </div>
                      <div className="text-xs text-gray-500">
                        {criterio.evidencias_faltantes > 0 
                          ? `${criterio.evidencias_faltantes} faltante${criterio.evidencias_faltantes > 1 ? 's' : ''}`
                          : 'Completo'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(criterio.estado_aprobacion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleOpenModal(criterio, 'aprobar')}
                        disabled={!criterio.puede_aprobar || criterio.estado_aprobacion === 'aprobado'}
                      >
                        <SystemIcons.interface.check className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => handleOpenModal(criterio, 'rechazar')}
                        disabled={criterio.estado_aprobacion === 'rechazado'}
                      >
                        <SystemIcons.actions.cancel className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </td>
                  </tr>

                  {/* Fila Expandida con Evidencias */}
                  {expandedCriterios.has(criterio.id) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Evidencias del Criterio:
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {criterio.evidencias.map((evidencia) => (
                              <div
                                key={evidencia.id}
                                className="flex items-center justify-between px-4 py-2 bg-white rounded border border-gray-200"
                              >
                                <div className="flex items-center space-x-3">
                                  {evidencia.archivo_adjuntado
                                    ? <SystemIcons.interface.checkCircle className={`w-5 h-5 text-green-500`} />
                                    : <SystemIcons.interface.xCircle className={`w-5 h-5 text-gray-300`} />
                                  }
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {evidencia.nomenclatura}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {evidencia.descripcion}
                                    </div>
                                  </div>
                                </div>
                                <span className={`text-xs font-medium ${
                                  evidencia.archivo_adjuntado ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {evidencia.archivo_adjuntado ? 'Adjuntada' : 'Pendiente'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {criterios.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <SystemIcons.interface.informationCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay criterios</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron criterios para el proceso seleccionado.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Modal de Confirmación */}
      {modalOpen && selectedCriterio && (
        <ApprovalModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmAction}
          action={modalAction}
          criterio={selectedCriterio}
          evidencias={selectedCriterio.evidencias}
        />
      )}
    </ScreenContainer>
  );
};

export default AprobacionBloques;
