/**
 * EvidenciasStep - Quinto paso del wizard
 * Selección de evidencias asignadas (opcional)
 */

import React, { useEffect, useState } from 'react';

interface EvidenciaAsignada {
  id: number;
  evidencia: {
    id: number;
    nombre: string;
    codigo: string;
    tipo: string;
  };
  usuario_asignado: {
    id: number;
    nombre: string;
  };
  fecha_asignacion: string;
  fecha_limite: string;
  estado: string;
}

interface EvidenciasStepProps {
  evidenciasAsignadas: number[];
  onChangeEvidenciasAsignadas: (ids: number[]) => void;
  procesoId?: number;
}

export const EvidenciasStep: React.FC<EvidenciasStepProps> = ({
  evidenciasAsignadas,
  onChangeEvidenciasAsignadas,
  procesoId
}) => {
  const [evidenciasList, setEvidenciasList] = useState<EvidenciaAsignada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvidenciasAsignadas();
  }, [procesoId]);

  const fetchEvidenciasAsignadas = async () => {
    try {
      setLoading(true);
      const url = procesoId 
        ? `/api/evidencias-asignaciones?proceso_id=${procesoId}`
        : '/api/evidencias-asignaciones';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar evidencias asignadas');
      const data = await response.json();
      setEvidenciasList(data.data || data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvidencia = (id: number) => {
    if (evidenciasAsignadas.includes(id)) {
      onChangeEvidenciasAsignadas(evidenciasAsignadas.filter(e => e !== id));
    } else {
      onChangeEvidenciasAsignadas([...evidenciasAsignadas, id]);
    }
  };

  const filteredEvidencias = evidenciasList.filter(ea =>
    ea.evidencia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ea.evidencia.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ea.usuario_asignado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'Pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      'En Progreso': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Progreso' },
      'Completado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
      'Vencido': { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' }
    };
    const badge = badges[estado] || badges['Pendiente'];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rojo-una mb-4"></div>
          <p className="text-gray-600">Cargando evidencias asignadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Evidencias Asignadas
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Seleccione las evidencias asignadas que se relacionan con este compromiso de mejora (opcional)
        </p>
      </div>

      {/* Search */}
      <div>
        <label htmlFor="search" className="sr-only">Buscar evidencias asignadas</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent"
            placeholder="Buscar por nombre, código o usuario asignado..."
          />
        </div>
      </div>

      {/* Selected count */}
      {evidenciasAsignadas.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            📎 {evidenciasAsignadas.length} evidencia{evidenciasAsignadas.length !== 1 ? 's' : ''} seleccionada{evidenciasAsignadas.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Evidencias list */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredEvidencias.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron evidencias asignadas' : 'No hay evidencias asignadas disponibles'}
            </p>
          </div>
        ) : (
          filteredEvidencias.map((ea) => (
            <div
              key={ea.id}
              onClick={() => toggleEvidencia(ea.id)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                      evidenciasAsignadas.includes(ea.id)
                        ? 'bg-rojo-una border-rojo-una'
                        : 'border-gray-300'
                    }`}
                  >
                    {evidenciasAsignadas.includes(ea.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {ea.evidencia.nombre}
                    </p>
                    {getEstadoBadge(ea.estado)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {ea.evidencia.codigo}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {ea.evidencia.tipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {ea.usuario_asignado.nombre}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Límite: {new Date(ea.fecha_limite).toLocaleDateString('es-CR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Evidencias asignadas opcionales
            </h4>
            <p className="text-sm text-gray-600">
              Puede continuar sin seleccionar evidencias asignadas. Estas pueden vincularse posteriormente si es necesario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenciasStep;
