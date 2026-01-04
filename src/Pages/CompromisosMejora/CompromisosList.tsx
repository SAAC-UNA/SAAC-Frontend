/**
 * CompromisosList - Página de listado de compromisos de mejora
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button } from '@/Components/Ui/Index';

interface Compromiso {
  id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'Pendiente' | 'En Progreso' | 'Completado';
  proceso?: {
    id: number;
    nombre: string;
  };
  ciclo_acreditacion?: {
    id: number;
    nombre: string;
  };
}

export const CompromisosList: React.FC = () => {
  const navigate = useNavigate();
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompromisos();
  }, []);

  const fetchCompromisos = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada al servicio
      // const data = await compromisoService.getAll();
      
      // Simular datos de ejemplo
      await new Promise(resolve => setTimeout(resolve, 500));
      setCompromisos([]);
    } catch (error) {
      console.error('Error al cargar compromisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      'Pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'En Progreso': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Completado': { bg: 'bg-green-100', text: 'text-green-800' }
    };
    const badge = badges[estado] || badges['Pendiente'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {estado}
      </span>
    );
  };

  return (
    <ScreenContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compromisos de Mejora</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestione los compromisos de mejora vinculados a criterios y evidencias
            </p>
          </div>
          <Button
            onClick={() => navigate('/compromisos/crear')}
            variant="primary"
            size="md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Compromiso
          </Button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rojo-una mb-4"></div>
              <p className="text-gray-600">Cargando compromisos...</p>
            </div>
          </div>
        ) : compromisos.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay compromisos registrados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comience creando su primer compromiso de mejora
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => navigate('/compromisos/crear')}
                  variant="primary"
                  size="md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Primer Compromiso
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Table */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proceso/Ciclo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {compromisos.map((compromiso) => (
                  <tr key={compromiso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {compromiso.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {compromiso.proceso?.nombre || compromiso.ciclo_acreditacion?.nombre || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {new Date(compromiso.fecha_inicio).toLocaleDateString('es-CR')} -{' '}
                        {new Date(compromiso.fecha_fin).toLocaleDateString('es-CR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getEstadoBadge(compromiso.estado)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        className="text-rojo-una hover:text-red-900 mr-4"
                        onClick={() => navigate(`/compromisos/ver/${compromiso.id}`)}
                      >
                        Ver
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => navigate(`/compromisos/editar/${compromiso.id}`)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Acerca de los Compromisos de Mejora
              </h4>
              <p className="text-sm text-blue-800">
                Los compromisos de mejora son acciones planificadas para mejorar los procesos de acreditación. 
                Cada compromiso está vinculado a criterios específicos y puede tener evidencias asignadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
