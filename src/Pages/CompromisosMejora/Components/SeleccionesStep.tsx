/**
 * SeleccionesStep - Segundo paso del wizard
 * Selección de entidades (criterios, evidencias, etc.)
 */

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';

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
  nombre: string;
  descripcion: string;
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
  const [activeTab, setActiveTab] = useState<'CRITERIO' | 'EVIDENCIA'>('CRITERIO');

  useEffect(() => {
    if (procesoId || cicloId) {
      loadData();
    }
  }, [procesoId, cicloId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Llamar a los servicios reales
      const criteriosResponse = await fetch('/api/estructura/criterios');
      const criteriosData = await criteriosResponse.json();
      setCriterios(criteriosData.data || []);

      const evidenciasResponse = await fetch('/api/estructura/evidencias');
      const evidenciasData = await evidenciasResponse.json();
      setEvidencias(evidenciasData.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (tipo: 'CRITERIO' | 'EVIDENCIA', id: number) => {
    const seleccion: Seleccion = {
      entidad_tipo: tipo,
      entidad_id: id
    };

    const exists = selecciones.some(
      s => s.entidad_tipo === tipo && s.entidad_id === id
    );

    if (exists) {
      onSelect(selecciones.filter(s => !(s.entidad_tipo === tipo && s.entidad_id === id)));
    } else {
      onSelect([...selecciones, seleccion]);
    }
  };

  const isSelected = (tipo: 'CRITERIO' | 'EVIDENCIA', id: number) => {
    return selecciones.some(s => s.entidad_tipo === tipo && s.entidad_id === id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Seleccione Criterios o Evidencias
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Seleccione los criterios o evidencias relacionados con este compromiso
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('CRITERIO')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'CRITERIO'
                ? 'border-rojo-una text-rojo-una'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Criterios ({criterios.length})
          </button>
          <button
            onClick={() => setActiveTab('EVIDENCIA')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'EVIDENCIA'
                ? 'border-rojo-una text-rojo-una'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Evidencias ({evidencias.length})
          </button>
        </nav>
      </div>

      {/* Selected Count */}
      {selecciones.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{selecciones.length}</span>
          selección(es) realizada(s)
        </div>
      )}

      {/* Content */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activeTab === 'CRITERIO' && criterios.map((criterio) => (
          <button
            key={criterio.criterio_id}
            type="button"
            onClick={() => handleToggle('CRITERIO', criterio.criterio_id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              isSelected('CRITERIO', criterio.criterio_id)
                ? 'border-rojo-una bg-rojo-una/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected('CRITERIO', criterio.criterio_id)
                    ? 'bg-rojo-una border-rojo-una'
                    : 'border-gray-300'
                }`}>
                  {isSelected('CRITERIO', criterio.criterio_id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">{criterio.codigo}</p>
                <p className="text-sm text-gray-600">{criterio.nombre}</p>
              </div>
            </div>
          </button>
        ))}

        {activeTab === 'EVIDENCIA' && evidencias.map((evidencia) => (
          <button
            key={evidencia.evidencia_id}
            type="button"
            onClick={() => handleToggle('EVIDENCIA', evidencia.evidencia_id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              isSelected('EVIDENCIA', evidencia.evidencia_id)
                ? 'border-rojo-una bg-rojo-una/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected('EVIDENCIA', evidencia.evidencia_id)
                    ? 'bg-rojo-una border-rojo-una'
                    : 'border-gray-300'
                }`}>
                  {isSelected('EVIDENCIA', evidencia.evidencia_id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">{evidencia.nombre}</p>
                <p className="text-sm text-gray-600">{evidencia.descripcion}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};

export default SeleccionesStep;
