/**
 * ReviewStep - Sexto y último paso del wizard
 * Revisión final antes de crear el compromiso
 */

import React, { useEffect, useState } from 'react';
import { config } from '@/Config/app.config';
import { LoadingSpinner } from '@/Components/Ui/Index';

interface Seleccion {
  entidad_tipo: 'ESTANDAR' | 'DIMENSION' | 'COMPONENTE' | 'CRITERIO' | 'EVIDENCIA';
  entidad_id: number;
  nombre?: string;
}

interface Proceso {
  proceso_id: number;
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

interface Criterio {
  criterio_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface Evidencia {
  evidencia_id: number;
  criterio_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface ReviewStepProps {
  procesoId?: number;
  cicloAcreditacionId?: number;
  procesoNombre?: string;
  selecciones: Seleccion[];
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  evidenciasAsignadas: number[];
  evidenciasNombres?: Array<{ id: number; nombre: string }>;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  procesoId,
  selecciones,
  descripcion,
  fechaInicio,
  fechaFin,
  evidenciasAsignadas,
  evidenciasNombres
}) => {
  const [proceso, setProceso] = useState<Proceso | null>(null);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [expandedCriterioIds, setExpandedCriterioIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [procesoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar proceso si hay procesoId
      if (procesoId) {
        const procesoResponse = await fetch(`${config.API_BASE_URL}/estructura/procesos`);
        if (procesoResponse.ok) {
          const procesosData = await procesoResponse.json();
          const foundProceso = procesosData.find((p: Proceso) => p.proceso_id === procesoId);
          setProceso(foundProceso || null);
        }
      }

      // Cargar criterios
      const criteriosResponse = await fetch(`${config.API_BASE_URL}/estructura/criterios`);
      if (criteriosResponse.ok) {
        const criteriosResult = await criteriosResponse.json();
        console.log('Criterios cargados (raw):', criteriosResult);
        const criteriosData = criteriosResult.data || criteriosResult;
        console.log('Primer criterio ejemplo:', criteriosData[0]);
        const mappedCriterios = criteriosData.map((c: any) => ({
          criterio_id: c.criterio_id || c.id,
          codigo: c.nomenclature || c.codigo || c.nomenclatura || '',
          nombre: c.description || c.nombre || c.descripcion || '',
          descripcion: c.descripcion || c.description || c.nombre || ''
        }));
        console.log('Criterios mapeados:', mappedCriterios);
        console.log('Primer criterio mapeado:', mappedCriterios[0]);
        setCriterios(mappedCriterios);
      }

      // Cargar evidencias
      const evidenciasResponse = await fetch(`${config.API_BASE_URL}/estructura/evidencias`);
      if (evidenciasResponse.ok) {
        const evidenciasResult = await evidenciasResponse.json();
        console.log('Evidencias cargadas (raw):', evidenciasResult);
        const evidenciasData = evidenciasResult.data || evidenciasResult;
        console.log('Primera evidencia ejemplo:', evidenciasData[0]);
        const mappedEvidencias = evidenciasData.map((e: any) => ({
          evidencia_id: e.evidencia_id || e.id,
          criterio_id: e.criterio_id || e.criterion_id,
          codigo: e.nomenclature || e.codigo || e.nomenclatura || '',
          nombre: e.description || e.nombre || e.descripcion || '',
          descripcion: e.descripcion || e.description || e.nombre || ''
        }));
        console.log('Evidencias mapeadas:', mappedEvidencias);
        console.log('Primera evidencia mapeada:', mappedEvidencias[0]);
        setEvidencias(mappedEvidencias);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-CR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuracion = () => {
    if (!fechaInicio || !fechaFin) return '';
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    if (months > 0) {
      return `${months} mes${months > 1 ? 'es' : ''} y ${days} día${days !== 1 ? 's' : ''}`;
    }
    return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revisar Compromiso de Mejora
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Verifique que toda la información sea correcta antes de crear el compromiso
        </p>
      </div>

      {/* Proceso/Ciclo */}
      <div className="bg-white border border-gray-200 rounded-corner p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Proceso de Acreditación
        </h4>
        <p className="text-sm text-gray-700">
          {proceso ? `${proceso.accreditation_cycle.career_campus.career.nombre} - ${proceso.accreditation_cycle.career_campus.campus.nombre} (${proceso.accreditation_cycle.nombre})` : 'Cargando...'}
        </p>
      </div>

      {/* Criterios y Evidencias */}
      {selecciones.filter(s => s.entidad_tipo === 'EVIDENCIA').length > 0 && (
        <div className="bg-white border border-gray-200 rounded-corner p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Criterios y Evidencias Seleccionados
          </h4>
          {loading ? (
            <p className="text-sm text-gray-500">Cargando criterios y evidencias...</p>
          ) : criterios.length === 0 || evidencias.length === 0 ? (
            <div>
              <p className="text-sm text-red-600">No se pudieron cargar los datos</p>
              <p className="text-xs text-gray-500 mt-1">
                Criterios: {criterios.length}, Evidencias: {evidencias.length}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(() => {
                // Obtener evidencias seleccionadas
                const evidenciasSeleccionadasIds = selecciones
                  .filter(s => s.entidad_tipo === 'EVIDENCIA')
                  .map(s => s.entidad_id);

                console.log('Evidencias seleccionadas IDs:', evidenciasSeleccionadasIds);
                console.log('Total criterios disponibles:', criterios.length);
                console.log('Total evidencias disponibles:', evidencias.length);

                // Agrupar evidencias por criterio
                const criteriosConEvidencias = new Map<number, Evidencia[]>();
                
                evidencias.forEach(evidencia => {
                  if (evidenciasSeleccionadasIds.includes(evidencia.evidencia_id)) {
                    if (!criteriosConEvidencias.has(evidencia.criterio_id)) {
                      criteriosConEvidencias.set(evidencia.criterio_id, []);
                    }
                    criteriosConEvidencias.get(evidencia.criterio_id)!.push(evidencia);
                  }
                });

                console.log('Criterios con evidencias:', Array.from(criteriosConEvidencias.keys()));

                if (criteriosConEvidencias.size === 0) {
                  return <p className="text-sm text-gray-500">No se encontraron criterios para las evidencias seleccionadas</p>;
                }

                // Renderizar cada criterio con sus evidencias
                return Array.from(criteriosConEvidencias.entries()).map(([criterioId, evidenciasDelCriterio]) => {
                  const criterio = criterios.find(c => c.criterio_id === criterioId);
                  if (!criterio) {
                    console.warn('Criterio no encontrado:', criterioId);
                    return null;
                  }

                  const isExpanded = expandedCriterioIds.includes(criterioId);

                  return (
                    <div key={criterioId} className="border border-gray-200 rounded-corner overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedCriterioIds(expandedCriterioIds.filter(id => id !== criterioId));
                          } else {
                            setExpandedCriterioIds([...expandedCriterioIds, criterioId]);
                          }
                        }}
                        className="w-full text-left px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{criterio.codigo}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{criterio.nombre}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {evidenciasDelCriterio.length} evidencia{evidenciasDelCriterio.length !== 1 ? 's' : ''}
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Evidencias seleccionadas:</p>
                          <div className="space-y-2">
                            {evidenciasDelCriterio.map((evidencia) => (
                              <div key={evidencia.evidencia_id} className="bg-white p-2 rounded border border-gray-200">
                                <p className="text-xs font-semibold text-gray-900">{evidencia.codigo}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{evidencia.nombre}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

      {/* Descripción */}
      <div className="bg-white border border-gray-200 rounded-corner p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Descripción del Compromiso
        </h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{descripcion || 'Sin descripción'}</p>
        {descripcion && (
          <p className="text-xs text-gray-500 mt-2">
            {descripcion.length} / 250 caracteres
          </p>
        )}
      </div>

      {/* Fechas */}
      <div className="bg-white border border-gray-200 rounded-corner p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Período del Compromiso
        </h4>
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-gray-600 uppercase">Fecha de inicio:</span>
            <p className="text-sm text-gray-900 mt-1">{formatDate(fechaInicio)}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-600 uppercase">Fecha de finalización:</span>
            <p className="text-sm text-gray-900 mt-1">{formatDate(fechaFin)}</p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-600 uppercase">Duración:</span>
            <p className="text-sm text-blue-700 font-medium mt-1">{getDuracion()}</p>
          </div>
        </div>
      </div>

      {/* Evidencias Asignadas */}
      {evidenciasAsignadas.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-corner p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Evidencias Asignadas
          </h4>
          <div className="space-y-1">
            {evidenciasNombres && evidenciasNombres.length > 0 ? (
              evidenciasNombres.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ev.nombre}
                </div>
              ))
            ) : (
              evidenciasAsignadas.map((id) => (
                <div key={id} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Evidencia ID: {id}
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {evidenciasAsignadas.length} evidencia{evidenciasAsignadas.length !== 1 ? 's' : ''} vinculada{evidenciasAsignadas.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}


    </div>
  );
};

export default ReviewStep;
