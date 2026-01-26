/**
 * CompromisosList - Página de listado de compromisos de mejora
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { config } from '@/Config/app.config';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompromisos();
  }, []);

  const fetchCompromisos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Intentando cargar compromisos desde:', `${config.API_BASE_URL}/compromisos-de-mejora`);
      const response = await fetch(`${config.API_BASE_URL}/compromisos-de-mejora`);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Compromisos cargados (raw):', result);
        const data = result.data || result;
        console.log('Compromisos data:', data);
        console.log('Cantidad de compromisos:', data.length);
        setCompromisos(data);
      } else if (response.status === 500) {
        setError('Error en el servidor. Por favor, contacte al administrador.');
        setCompromisos([]);
      } else {
        const errorText = await response.text();
        console.error('Error al cargar compromisos:', response.status, errorText);
        setError(`Error ${response.status}: No se pudieron cargar los compromisos`);
        setCompromisos([]);
      }
    } catch (error) {
      console.error('Error al cargar compromisos (catch):', error);
      setError('Error de conexión. Verifique que el servidor esté funcionando.');
      setCompromisos([]);
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
            variant="secondary"
            className="gap-2"
          >
            <SystemIcons.actions.add className="w-4 h-4" size="sm" />
            Crear
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rojo-una mb-4"></div>
              <p className="text-gray-600">Cargando compromisos...</p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-base font-medium text-gray-900 mb-2 mt-4">{error}</h3>
              <p className="text-sm text-gray-500 mb-4">
                El servidor puede no estar funcionando correctamente
              </p>
              <Button
                onClick={fetchCompromisos}
                variant="secondary"
              >
                Reintentar
              </Button>
            </div>
          </div>
        ) : compromisos.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center py-24">
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
              <h3 className="text-base font-medium text-gray-900 mb-2">No hay compromisos registrados</h3>
              <p className="text-sm text-gray-500">
                Utilice el botón "Crear" para registrar un nuevo compromiso de mejora
              </p>
            </div>
          </div>
        ) : (
          /* Table */
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
        )}
      </div>
    </ScreenContainer>
  );
};
