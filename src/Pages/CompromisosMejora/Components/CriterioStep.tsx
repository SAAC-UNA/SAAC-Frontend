/**
 * CriterioStep - Primer paso del wizard
 * Selección del criterio al que se vincula el compromiso
 */

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';

interface Criterio {
  id: number;
  codigo: string;
  nombre: string;
  proceso: {
    nombre: string;
  };
}

interface CriterioStepProps {
  selectedCriterio: number | null;
  onSelect: (criterioId: number) => void;
  error?: string;
}

export const CriterioStep: React.FC<CriterioStepProps> = ({
  selectedCriterio,
  onSelect,
  error
}) => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCriterios();
  }, []);

  const loadCriterios = async () => {
    try {
      setLoading(true);
      // TODO: Llamar al servicio para obtener criterios
      // const data = await criterioService.getAll();
      
      // Datos de ejemplo
      const mockData: Criterio[] = [
        {
          id: 1,
          codigo: 'C1',
          nombre: 'Pertinencia e impacto social',
          proceso: { nombre: 'Gestión de Carrera' }
        },
        {
          id: 2,
          codigo: 'C2',
          nombre: 'Recursos humanos y materiales',
          proceso: { nombre: 'Gestión de Carrera' }
        },
        {
          id: 3,
          codigo: 'C3',
          nombre: 'Proceso de enseñanza y aprendizaje',
          proceso: { nombre: 'Docencia' }
        }
      ];
      
      setCriterios(mockData);
    } catch (error) {
      console.error('Error al cargar criterios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCriterios = criterios.filter(c =>
    c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.proceso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Seleccione el Criterio
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Seleccione el criterio específico al que se vincula este compromiso de mejora
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código, nombre o proceso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent"
        />
      </div>

      {/* Criterios List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCriterios.map((criterio) => (
          <button
            key={criterio.id}
            onClick={() => onSelect(criterio.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedCriterio === criterio.id
                ? 'border-rojo-una bg-rojo-una/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{criterio.codigo}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {criterio.proceso.nombre}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{criterio.nombre}</p>
              </div>
              {selectedCriterio === criterio.id && (
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

      {filteredCriterios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron criterios que coincidan con la búsqueda
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};
