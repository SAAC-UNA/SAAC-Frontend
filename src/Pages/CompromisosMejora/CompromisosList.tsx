/**
 * CompromisosList - Página de listado de compromisos de mejora
 * Muestra todos los compromisos con filtros y acciones
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button, LoadingSpinner } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type { CompromisoMejora } from '@/Types/ImprovementCommitmentTypes';
import { useToast } from '@/Context/ToastContext';

export const CompromisosList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [compromisos, setCompromisos] = useState<CompromisoMejora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompromisos();
  }, []);

  const fetchCompromisos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await improvementCommitmentService.listarCompromisos({
        per_page: 50
      });
      
      setCompromisos(response.data || []);
    } catch (error: any) {
      console.error('Error al cargar compromisos:', error);
      
      if (error.response) {
        if (error.response.status === 500) {
          setError('Error en el servidor. Por favor, contacte al administrador.');
        } else if (error.response.status === 403) {
          setError('No tiene permisos para ver los compromisos de mejora.');
        } else {
          setError(`Error ${error.response.status}: No se pudieron cargar los compromisos`);
        }
      } else {
        setError('Error de conexión. Verifique que el servidor esté funcionando.');
      }
      setCompromisos([]);
    } finally {
      setLoading(false);
    }
  };

  const compromisosFiltrados = compromisos;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleVerDetalle = (id: number) => {
    navigate(`/compromisos/ver/${id}`);
  };

  return (
    <ScreenContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-negro-una">Compromisos de Mejora</h1>
            <p className="mt-1 text-sm text-gris-una">
              Gestione los compromisos de mejora vinculados a criterios y evidencias
            </p>
          </div>
          <Button
            onClick={() => navigate('/compromisos/crear')}
            variant="secondary"
            className="gap-2"
          >
            <SystemIcons.actions.add size="sm" />
            Crear
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gris-una">Cargando compromisos...</p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md">
              <SystemIcons.interface.alert size="xl" className="mx-auto text-red-400 mb-4" />
              <h3 className="text-base font-medium text-negro-una mb-2 mt-4">{error}</h3>
              <p className="text-sm text-gris-una mb-4">
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
          ) : compromisosFiltrados.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <SystemIcons.interface.document size="xl" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-base font-medium text-negro-una mb-2">
                {'No hay compromisos registrados'}
              </h3>
              <p className="text-sm text-gris-una">
                {'Utilice el botón "Crear" para registrar un nuevo compromiso de mejora'}
              </p>
            </div>
          </div>
        ) : (
          /* Cards de Compromisos */
          <div className="grid gap-4">
            {compromisosFiltrados.map((compromiso) => (
              <div
                key={compromiso.compromiso_mejora_id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleVerDetalle(compromiso.compromiso_mejora_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-negro-una">
                        {compromiso.descripcion || 'Sin descripción'}
                      </h3>
                      {compromiso.is_overdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-medium">
                          <SystemIcons.interface.alert size="xs" className="w-3 h-3" />
                          Vencido
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs font-medium text-gris-una mb-1">Fechas</p>
                        <p className="text-sm text-negro-una">
                          {formatearFecha(compromiso.fecha_inicio)} - {formatearFecha(compromiso.fecha_fin)}
                        </p>
                      </div>
                      
                      {compromiso.selecciones && compromiso.selecciones.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gris-una mb-1">Criterios vinculados</p>
                          <p className="text-sm text-negro-una">
                            {compromiso.selecciones.length} {compromiso.selecciones.length === 1 ? 'criterio' : 'criterios'}
                          </p>
                        </div>
                      )}
                      
                      {compromiso.assignedEvidences && compromiso.assignedEvidences.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gris-una mb-1">Asignaciones</p>
                          <p className="text-sm text-negro-una">
                            {compromiso.assignedEvidences.length} {compromiso.assignedEvidences.length === 1 ? 'asignación' : 'asignaciones'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <SystemIcons.interface.chevronRight size="md" className="text-gris-una" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
