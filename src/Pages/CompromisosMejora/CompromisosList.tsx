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
  const nowTs = Date.now();
  const sortedByEndDate = [...compromisosFiltrados].sort((a, b) => {
    const aTs = new Date(a.fecha_fin).getTime();
    const bTs = new Date(b.fecha_fin).getTime();
    const aDiff = aTs - nowTs;
    const bDiff = bTs - nowTs;

    const aUpcoming = aDiff >= 0;
    const bUpcoming = bDiff >= 0;

    if (aUpcoming && bUpcoming) return aDiff - bDiff;
    if (!aUpcoming && !bUpcoming) return bDiff - aDiff;
    return aUpcoming ? -1 : 1;
  });
  const featuredCompromiso = sortedByEndDate[0];
  const remainingCompromisos = sortedByEndDate.slice(1);

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
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                {compromisosFiltrados.length} total
              </span>
              <span className="text-gray-400">•</span>
              <span className="inline-flex items-center gap-1">
                <SystemIcons.interface.clock size="xs" className="text-gray-400" />
                {compromisosFiltrados.filter((c) => c.is_overdue).length} vencidos
              </span>
            </div>
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
          <div className="space-y-5">
            {featuredCompromiso && (
              <div
                className={`rounded-xl border p-5 transition-shadow cursor-pointer bg-gradient-to-br from-gray-50 via-white to-gray-50/60 hover:shadow-md ${
                  featuredCompromiso.is_overdue ? 'border-red-200' : 'border-gray-200'
                }`}
                onClick={() => handleVerDetalle(featuredCompromiso.compromiso_mejora_id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-gray-500">Destacado</span>
                      {featuredCompromiso.is_overdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-medium">
                          <SystemIcons.interface.alert size="xs" className="w-3 h-3" />
                          Vencido
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-negro-una truncate">
                      {featuredCompromiso.descripcion || 'Sin descripción'}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5">
                        {formatearFecha(featuredCompromiso.fecha_inicio)} - {formatearFecha(featuredCompromiso.fecha_fin)}
                      </span>
                      {featuredCompromiso.selecciones && featuredCompromiso.selecciones.length > 0 && (
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5">
                            {featuredCompromiso.selecciones.length} {featuredCompromiso.selecciones.length === 1 ? 'criterio' : 'criterios'}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            Proximo a vencer
                          </span>
                        </div>
                      )}
                      {featuredCompromiso.assignedEvidences && featuredCompromiso.assignedEvidences.length > 0 && (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5">
                          {featuredCompromiso.assignedEvidences.length} {featuredCompromiso.assignedEvidences.length === 1 ? 'asignación' : 'asignaciones'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Ver detalle</span>
                    <SystemIcons.interface.chevronRight size="sm" className="text-gris-una" />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white/90">
              <div className="divide-y divide-gray-100">
                {remainingCompromisos.map((compromiso) => (
                  <div
                    key={compromiso.compromiso_mejora_id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 ${
                      compromiso.is_overdue ? 'border-l-4 border-red-300' : 'border-l-4 border-transparent'
                    }`}
                    onClick={() => handleVerDetalle(compromiso.compromiso_mejora_id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-negro-una truncate">
                          {compromiso.descripcion || 'Sin descripción'}
                        </h4>
                        {compromiso.is_overdue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded text-[11px] text-red-800 font-medium">
                            <SystemIcons.interface.alert size="xs" className="w-3 h-3" />
                            Vencido
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                          {formatearFecha(compromiso.fecha_inicio)} - {formatearFecha(compromiso.fecha_fin)}
                        </span>
                        {compromiso.selecciones && compromiso.selecciones.length > 0 && (
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                            {compromiso.selecciones.length} {compromiso.selecciones.length === 1 ? 'criterio' : 'criterios'}
                          </span>
                        )}
                        {compromiso.assignedEvidences && compromiso.assignedEvidences.length > 0 && (
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                            {compromiso.assignedEvidences.length} {compromiso.assignedEvidences.length === 1 ? 'asignación' : 'asignaciones'}
                          </span>
                        )}
                      </div>
                    </div>

                    <SystemIcons.interface.chevronRight size="sm" className="text-gris-una" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
