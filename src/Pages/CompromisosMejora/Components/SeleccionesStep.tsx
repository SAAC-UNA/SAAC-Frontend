/**
 * SeleccionesStep - Segundo paso del wizard
 * Selección de criterios y sus evidencias asociadas
 */

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { config } from '@/Config/app.config';

interface Seleccion {
  entidad_tipo: 'ESTANDAR' | 'DIMENSION' | 'COMPONENTE' | 'CRITERIO' | 'EVIDENCIA';
  entidad_id: number;
}

interface Criterio {
  criterio_id: number;
  codigo: string;
  nombre: string;
}

interface Evidencia {
  evidencia_id: number;
  criterio_id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
}

interface SeleccionesStepProps {
  selecciones: Seleccion[];
  procesoId: number | null;
  cicloId: number | null;
  onSelect: (selecciones: Seleccion[]) => void;
  error?: string;
}

export const SeleccionesStep: React.FC<SeleccionesStepProps> = ({
  selecciones,
  procesoId,
  cicloId,
  onSelect,
  error
}) => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCriterioIds, setExpandedCriterioIds] = useState<number[]>([]);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<number[]>(
    selecciones.filter(s => s.entidad_tipo === 'EVIDENCIA').map(s => s.entidad_id)
  );

  useEffect(() => {
    if (procesoId || cicloId) {
      loadData();
    }
  }, [procesoId, cicloId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar todos los criterios y evidencias disponibles
      const criteriosResponse = await fetch(`${config.API_BASE_URL}/estructura/criterios`);
      if (criteriosResponse.ok) {
        const criteriosData = await criteriosResponse.json();
        const criteriosArray = Array.isArray(criteriosData) ? criteriosData : (criteriosData.data || []);
        const mappedCriterios = criteriosArray.map((c: any) => ({
          criterio_id: c.criterio_id || c.id,
          codigo: c.nomenclature || c.codigo || `CRIT-${c.criterio_id || c.id}`,
          nombre: c.description || c.descripcion || c.name || c.nombre || c.nomenclature || c.codigo || 'Sin descripción'
        }));
        setCriterios(mappedCriterios);
      }

      const evidenciasResponse = await fetch(`${config.API_BASE_URL}/estructura/evidencias`);
      if (evidenciasResponse.ok) {
        const evidenciasData = await evidenciasResponse.json();
        const evidenciasArray = Array.isArray(evidenciasData) ? evidenciasData : (evidenciasData.data || []);
        const mappedEvidencias = evidenciasArray.map((e: any) => ({
          evidencia_id: e.evidencia_id || e.id,
          criterio_id: e.criterio_id || e.criterion_id || 0,
          codigo: e.nomenclature || e.codigo || `EV-${e.evidencia_id || e.id}`,
          nombre: e.description || e.descripcion || e.name || e.nombre || e.nomenclature || e.codigo || 'Sin descripción',
          descripcion: e.description || e.descripcion || e.name || e.nombre || ''
        }));
        setEvidencias(mappedEvidencias);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setCriterios([]);
      setEvidencias([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleToggleExpand = (criterioId: number) => {
    if (expandedCriterioIds.includes(criterioId)) {
      setExpandedCriterioIds(expandedCriterioIds.filter(id => id !== criterioId));
    } else {
      setExpandedCriterioIds([...expandedCriterioIds, criterioId]);
    }
  };

  const handleEvidenceToggle = (evidenciaId: number) => {
    const newIds = selectedEvidenceIds.includes(evidenciaId)
      ? selectedEvidenceIds.filter(id => id !== evidenciaId)
      : [...selectedEvidenceIds, evidenciaId];
    
    setSelectedEvidenceIds(newIds);
    
    // Obtener todos los criterios únicos de las evidencias seleccionadas
    const selectedEvidences = evidencias.filter(e => newIds.includes(e.evidencia_id));
    const uniqueCriterioIds = [...new Set(selectedEvidences.map(e => e.criterio_id))];
    
    // Actualizar selecciones: criterios + evidencias
    const newSelections: Seleccion[] = [
      ...uniqueCriterioIds.map(id => ({
        entidad_tipo: 'CRITERIO' as const,
        entidad_id: id
      })),
      ...newIds.map(id => ({
        entidad_tipo: 'EVIDENCIA' as const,
        entidad_id: id
      }))
    ];
    onSelect(newSelections);
  };

  const handleSelectAllEvidences = (criterioId: number) => {
    const criterioEvidences = evidencias.filter(e => e.criterio_id === criterioId);
    const allEvidenceIds = criterioEvidences.map(e => e.evidencia_id);
    const allSelected = allEvidenceIds.every(id => selectedEvidenceIds.includes(id));
    
    const newIds = allSelected
      ? selectedEvidenceIds.filter(id => !allEvidenceIds.includes(id))
      : [...new Set([...selectedEvidenceIds, ...allEvidenceIds])];
    
    setSelectedEvidenceIds(newIds);
    
    // Actualizar selecciones
    const selectedEvidences = evidencias.filter(e => newIds.includes(e.evidencia_id));
    const uniqueCriterioIds = [...new Set(selectedEvidences.map(e => e.criterio_id))];
    
    const newSelections: Seleccion[] = [
      ...uniqueCriterioIds.map(id => ({
        entidad_tipo: 'CRITERIO' as const,
        entidad_id: id
      })),
      ...newIds.map(id => ({
        entidad_tipo: 'EVIDENCIA' as const,
        entidad_id: id
      }))
    ];
    onSelect(newSelections);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-0.5">
          Criterios y Evidencias
        </h3>
        <p className="text-xs text-gray-600 mb-1">
          Seleccione un criterio para ver y elegir sus evidencias asociadas
        </p>
      </div>

      {/* Lista de criterios con hover para evidencias */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto">
        {criterios.map((criterio) => {
          const criterioEvidences = evidencias.filter(e => e.criterio_id === criterio.criterio_id);
          const isExpanded = expandedCriterioIds.includes(criterio.criterio_id);
          const selectedCount = criterioEvidences.filter(e => selectedEvidenceIds.includes(e.evidencia_id)).length;
          
          return (
            <div key={criterio.criterio_id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Criterio Button */}
              <button
                type="button"
                onClick={() => handleToggleExpand(criterio.criterio_id)}
                className="w-full text-left px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-gray-900 text-sm">{criterio.codigo}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{criterio.nombre}</p>
                    {selectedCount > 0 && (
                      <span className="text-xs text-blue-600 font-medium mt-0.5 inline-block">
                        {selectedCount} evidencia{selectedCount !== 1 ? 's' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {criterioEvidences.length} ev.
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

              {/* Panel de Evidencias (se expande) */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-3">
                  {criterioEvidences.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-700">
                          Seleccione las evidencias:
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSelectAllEvidences(criterio.criterio_id)}
                          className="text-xs text-rojo-una hover:text-red-900 font-medium"
                        >
                          {criterioEvidences.every(e => selectedEvidenceIds.includes(e.evidencia_id))
                            ? 'Deseleccionar todas'
                            : 'Seleccionar todas'}
                        </button>
                      </div>
                      {criterioEvidences.map((evidencia) => {
                        const isSelected = selectedEvidenceIds.includes(evidencia.evidencia_id);
                        
                        return (
                          <label
                            key={evidencia.evidencia_id}
                            className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleEvidenceToggle(evidencia.evidencia_id)}
                              className="mt-0.5 w-4 h-4 text-rojo-una border-gray-300 rounded focus:ring-rojo-una"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-xs">{evidencia.codigo}</p>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{evidencia.nombre}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-3">
                      No hay evidencias disponibles para este criterio
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {criterios.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          No hay criterios disponibles
        </div>
      )}

      {/* Contador de selecciones */}
      {selectedEvidenceIds.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{selectedEvidenceIds.length}</span>
          evidencia(s) seleccionada(s)
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};

export default SeleccionesStep;
