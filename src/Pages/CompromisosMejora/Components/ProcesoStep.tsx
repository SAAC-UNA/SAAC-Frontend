/**
 * ProcesoStep - Primer paso del wizard
 * Selección del proceso o ciclo de acreditación
 */

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';

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

interface ProcesoStepProps {
  procesoId: number | null;
  cicloId: number | null;
  onSelectProceso: (procesoId: number) => void;
  onSelectCiclo: (cicloId: number) => void;
  error?: string;
}

export const ProcesoStep: React.FC<ProcesoStepProps> = ({
  procesoId,
  cicloId,
  onSelectProceso,
  error
}) => {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcesos();
  }, []);

  const loadProcesos = async () => {
    try {
      setLoading(true);
      // TODO: Llamar al servicio
      const response = await fetch('/api/estructura/procesos');
      const data = await response.json();
      setProcesos(data);
    } catch (error) {
      console.error('Error al cargar procesos:', error);
    } finally {
      setLoading(false);
    }
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
          Seleccione el Proceso
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Seleccione el proceso de acreditación al que pertenece este compromiso de mejora
        </p>
      </div>

      {/* Procesos List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {procesos.map((proceso) => (
          <button
            key={proceso.proceso_id}
            onClick={() => onSelectProceso(proceso.proceso_id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              procesoId === proceso.proceso_id
                ? 'border-rojo-una bg-rojo-una/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {proceso.accreditation_cycle.career_campus.career.nombre}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {proceso.accreditation_cycle.career_campus.campus.nombre}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  Ciclo: {proceso.accreditation_cycle.nombre}
                </p>
              </div>
              {procesoId === proceso.proceso_id && (
                <div className="flex-shrink-0 ml-4">
                  <div className="w-6 h-6 bg-rojo-una rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {procesos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay procesos disponibles
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};

export default ProcesoStep;
