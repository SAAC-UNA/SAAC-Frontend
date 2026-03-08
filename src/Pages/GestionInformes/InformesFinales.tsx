import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { Button, LoadingSpinner } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { axiosInstance } from '@/Config/axios';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { PublicLinkModal } from './Components/PublicLinkModal';
import { DropdownButton } from '@/Components/Ui/Buttons/DropdownButton';
import type { DropdownOption } from '@/Components/Ui/Buttons/DropdownButton';

type EstadoAprobacion = 'pendiente' | 'aprobado' | 'rechazado';

interface Archivo {
  archivo_id: number;
  nombre_original: string;
  ruta_archivo: string;
  token_publico?: string;
  is_publico: boolean;
  link_expira_en?: string;
}

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  archivos?: Archivo[];
}

interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
  estado_aprobacion?: EstadoAprobacion;
}

interface Proceso {
  proceso_id: number;
  tipo_proceso: string;
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

type ExportFormat = 'pdf' | 'excel';

const InformesFinales: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [selectedProcesoId, setSelectedProcesoId] = useState<number | null>(null);
  const [expandedCriterios, setExpandedCriterios] = useState<Set<number>>(new Set());
  const [loadingArchivos, setLoadingArchivos] = useState<Set<number>>(new Set());
  
  // Modal de enlaces públicos
  const [publicLinkModalOpen, setPublicLinkModalOpen] = useState(false);
  const [selectedArchivo, setSelectedArchivo] = useState<Archivo | null>(null);
  const [selectedEvidencia, setSelectedEvidencia] = useState<Evidencia | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedProcesoId]);

  const fetchData = async () => {
    try {
      const [criteriosResponse, evidenciasResponse, procesosResponse, aprobacionesResponse] = await Promise.all([
        axiosInstance.get('/estructura/criterios'),
        axiosInstance.get('/estructura/evidencias'),
        axiosInstance.get('/estructura/procesos'),
        axiosInstance.get('/aprobaciones-criterios')
      ]);
      
      const criteriosArray = criteriosResponse.data.data || criteriosResponse.data;
      const evidenciasArray = evidenciasResponse.data.data || evidenciasResponse.data;
      const procesosArray = procesosResponse.data.data || procesosResponse.data;
      const aprobacionesArray = aprobacionesResponse.data.data || aprobacionesResponse.data;
      
      // Crear mapa de aprobaciones por criterio_id + proceso_id
      const aprobacionesMap = new Map<string, EstadoAprobacion>();
      aprobacionesArray.forEach((aprobacion: any) => {
        const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
        aprobacionesMap.set(key, aprobacion.estado as EstadoAprobacion);
      });
      
      // Asignar estado de aprobación según el proceso seleccionado
      const criteriosConEstado = criteriosArray.map((c: any) => {
        const key = selectedProcesoId ? `${c.id}-${selectedProcesoId}` : '';
        const estadoAprobacion = aprobacionesMap.get(key) || 'pendiente';
        
        return {
          ...c,
          estado_aprobacion: estadoAprobacion as EstadoAprobacion
        };
      });
      
      // Filtrar solo criterios aprobados
      const criteriosAprobados = criteriosConEstado.filter(
        (c: Criterio) => c.estado_aprobacion === 'aprobado'
      );
      
      setCriterios(criteriosAprobados);
      setEvidencias(evidenciasArray);
      setProcesos(procesosArray);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEvidenciasPorCriterio = (criterioId: number) => {
    return evidencias.filter(ev => ev.criterio_id === criterioId);
  };
  
  const toggleEvidencias = async (criterioId: number) => {
    const isExpanding = !expandedCriterios.has(criterioId);
    
    setExpandedCriterios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(criterioId)) {
        newSet.delete(criterioId);
      } else {
        newSet.add(criterioId);
      }
      return newSet;
    });
    
    // Si estamos expandiendo, cargar los archivos de las evidencias
    if (isExpanding) {
      const evidenciasCriterio = getEvidenciasPorCriterio(criterioId);
      await Promise.all(
        evidenciasCriterio.map(evidencia => loadArchivosEvidencia(evidencia.id))
      );
    }
  };

  const loadArchivosEvidencia = async (evidenciaId: number) => {
    if (loadingArchivos.has(evidenciaId)) return;
    
    setLoadingArchivos(prev => new Set(prev).add(evidenciaId));
    
    try {
      const response = await axiosInstance.get(`/archivos?evidencia_id=${evidenciaId}`);
      const archivos = response.data.data || response.data;
      
      // Actualizar evidencias con archivos cargados
      setEvidencias(prev => prev.map(ev => 
        ev.id === evidenciaId ? { ...ev, archivos } : ev
      ));
    } catch (error) {
      console.error('Error cargando archivos:', error);
    } finally {
      setLoadingArchivos(prev => {
        const newSet = new Set(prev);
        newSet.delete(evidenciaId);
        return newSet;
      });
    }
  };

  const getArchivoParaEnlace = (evidencia: Evidencia): Archivo | null => {
    const archivos = evidencia.archivos || [];
    if (archivos.length === 0) return null;

    const publico = archivos.find((archivo) => archivo.is_publico && archivo.token_publico);
    return publico || archivos[0];
  };

  const getPublicLinkForEvidence = (evidencia: Evidencia): string => {
    const archivoPublico = (evidencia.archivos || []).find(
      (archivo) => archivo.is_publico && archivo.token_publico
    );

    return archivoPublico?.token_publico
      ? `${window.location.origin}/api/p/${archivoPublico.token_publico}`
      : '';
  };

  const handleGenerarEnlace = (archivo: Archivo, evidencia: Evidencia) => {
    setSelectedArchivo(archivo);
    setSelectedEvidencia(evidencia);
    setPublicLinkModalOpen(true);
  };

  const handleAbrirEnlaceEvidencia = (evidencia: Evidencia) => {
    const archivo = getArchivoParaEnlace(evidencia);
    if (!archivo) {
      alert('No hay archivos adjuntos para esta evidencia');
      return;
    }

    handleGenerarEnlace(archivo, evidencia);
  };

  const handleEnlaceGenerado = async () => {
    // Recargar los archivos de la evidencia seleccionada
    if (selectedEvidencia) {
      await loadArchivosEvidencia(selectedEvidencia.id);
    }
    setPublicLinkModalOpen(false);
    setSelectedArchivo(null);
    setSelectedEvidencia(null);
  };

  const handleGenerarTodosLosEnlaces = async () => {
    if (!selectedProcesoId) {
      alert('Seleccione un proceso primero');
      return;
    }

    const confirmacion = confirm(
      '¿Está seguro que desea generar enlaces públicos para TODAS las evidencias de los criterios aprobados? Esta acción puede tardar un momento.'
    );
    
    if (!confirmacion) return;

    try {
      // Recopilar todos los archivos de todas las evidencias
      const todosLosArchivos: number[] = [];
      
      for (const criterio of criterios) {
        const evidenciasCriterio = getEvidenciasPorCriterio(criterio.id);
        for (const evidencia of evidenciasCriterio) {
          if (evidencia.archivos) {
            evidencia.archivos.forEach(archivo => {
              if (!archivo.is_publico) {
                todosLosArchivos.push(archivo.archivo_id);
              }
            });
          }
        }
      }

      if (todosLosArchivos.length === 0) {
        alert('No hay archivos sin enlace público');
        return;
      }

      await axiosInstance.post('/archivos/bulk-make-public', {
        archivo_ids: todosLosArchivos
      });

      alert(`Se generaron ${todosLosArchivos.length} enlaces públicos exitosamente`);
      
      // Recargar todas las evidencias expandidas
      for (const criterioId of Array.from(expandedCriterios)) {
        const evidenciasCriterio = getEvidenciasPorCriterio(criterioId);
        await Promise.all(
          evidenciasCriterio.map(ev => loadArchivosEvidencia(ev.id))
        );
      }
    } catch (error: any) {
      console.error('Error generando enlaces masivos:', error);
      alert(error.response?.data?.message || 'Error al generar enlaces públicos');
    }
  };

  const buildReportRows = () => {
    return criterios.flatMap((criterio) => {
      const evidenciasCriterio = getEvidenciasPorCriterio(criterio.id);
      return evidenciasCriterio.map((evidencia) => ({
        criterio: `${criterio.nomenclatura} - ${criterio.descripcion}`,
        evidencia: `${evidencia.nomenclatura} - ${evidencia.descripcion}`,
        link: getPublicLinkForEvidence(evidencia) || 'Sin enlace'
      }));
    });
  };

  const downloadCsv = (rows: Array<{ criterio: string; evidencia: string; link: string }>) => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = ['Criterio', 'Evidencia', 'Enlace'].map(escapeCsv).join(',');
    const lines = rows.map((row) => [row.criterio, row.evidencia, row.link].map(escapeCsv).join(','));
    const csvContent = `\ufeff${[header, ...lines].join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `informe_evidencias_${selectedProcesoId}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = (rows: Array<{ criterio: string; evidencia: string; link: string }>) => {
    const procesoSeleccionado = procesos.find(p => p.proceso_id === selectedProcesoId);
    if (!procesoSeleccionado) return;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Informe de Evidencias</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
          h1 { font-size: 18px; margin: 0 0 8px; }
          .meta { font-size: 12px; color: #555; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
          th { background: #f5f5f5; text-align: left; }
          .link { color: #0b5fff; word-break: break-all; }
        </style>
      </head>
      <body>
        <h1>Informe de Evidencias con Enlaces</h1>
        <div class="meta">
          Proceso: ${procesoSeleccionado.accreditation_cycle.career_campus.career.nombre} - ${procesoSeleccionado.accreditation_cycle.career_campus.campus.nombre}<br />
          Tipo: ${procesoSeleccionado.tipo_proceso} | Ciclo: ${procesoSeleccionado.accreditation_cycle.nombre}<br />
          Generado: ${new Date().toLocaleString()}
        </div>
        <table>
          <thead>
            <tr>
              <th>Criterio</th>
              <th>Evidencia</th>
              <th>Enlace</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${row.criterio}</td>
                <td>${row.evidencia}</td>
                <td class="link">${row.link}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportInforme = (format: ExportFormat) => {
    if (!selectedProcesoId) {
      alert('Seleccione un proceso primero');
      return;
    }

    const rows = buildReportRows();
    if (rows.length === 0) {
      alert('No hay evidencias para exportar');
      return;
    }

    if (format === 'excel') {
      downloadCsv(rows);
    } else {
      exportToPdf(rows);
    }
  };

  return (
    <ScreenContainer
      title="Gestión de Informes Finales"
      description="Genere enlaces públicos para las evidencias de criterios aprobados y exporte informes"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Selector de proceso y acciones */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <CustomSelect
                  label="Seleccionar Proceso"
                  value={selectedProcesoId?.toString() || ''}
                  placeholder="Seleccione un proceso"
                  size="sm"
                  onChange={(value) => setSelectedProcesoId(value ? Number(value) : null)}
                  options={procesos
                    .filter(proceso => 
                      proceso.accreditation_cycle?.career_campus?.career?.nombre && 
                      proceso.accreditation_cycle?.career_campus?.campus?.nombre
                    )
                    .map((proceso) => ({
                      value: proceso.proceso_id.toString(),
                      label: `${proceso.accreditation_cycle.career_campus.career.nombre} - ${proceso.accreditation_cycle.career_campus.campus.nombre} (${proceso.tipo_proceso})`
                    }))}
                  maxVisibleItems={5}
                />
              </div>
            </div>
            
            {/* Botones de acción */}
            {selectedProcesoId && criterios.length > 0 && (
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerarTodosLosEnlaces}
                >
                  <SystemIcons.actions.linkIcon className="w-4 h-4" />
                  Generar todos los enlaces
                </Button>
                <DropdownButton
                  label="Exportar"
                  variant="secondary"
                  size="sm"
                  icon={<SystemIcons.actions.download className="w-4 h-4" />}
                  options={(
                    [
                      {
                        id: 'pdf',
                        label: 'Exportar a PDF',
                        icon: <SystemIcons.modal.pdf className="w-4 h-4" />,
                        onClick: () => handleExportInforme('pdf')
                      },
                      {
                        id: 'excel',
                        label: 'Exportar a Excel',
                        icon: <SystemIcons.modal.excel className="w-4 h-4" />,
                        onClick: () => handleExportInforme('excel')
                      }
                    ] as DropdownOption[]
                  )}
                />
              </div>
            )}
          </div>

          {/* Lista de criterios aprobados */}
          {selectedProcesoId && (
            <>
              {criterios.length === 0 ? (
                <div className="bg-white shadow sm:rounded-lg p-8 text-center">
                  <SystemIcons.interface.informationCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay criterios aprobados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron criterios aprobados para este proceso.
                  </p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Criterio
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Descripción
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Evidencias
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {criterios.map((criterio) => {
                        const evidenciasCriterio = getEvidenciasPorCriterio(criterio.id);
                        const totalEvidencias = evidenciasCriterio.length;
                        const isExpanded = expandedCriterios.has(criterio.id);
                        
                        return (
                          <React.Fragment key={criterio.id}>
                            <tr>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {criterio.nomenclatura}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {criterio.descripcion}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {totalEvidencias > 0 ? (
                                  <button
                                    onClick={() => toggleEvidencias(criterio.id)}
                                    className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
                                  >
                                    <span>{totalEvidencias} evidencia{totalEvidencias !== 1 ? 's' : ''}</span>
                                    <svg 
                                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                ) : (
                                  <span className="text-sm text-gray-400">Sin evidencias</span>
                                )}
                              </td>
                            </tr>
                            
                            {/* Fila expandida con evidencias y archivos */}
                            {isExpanded && totalEvidencias > 0 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-4 bg-gray-50">
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                      Evidencias del Criterio:
                                    </h4>
                                    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
                                      {evidenciasCriterio.map((evidencia) => {
                                        const tieneArchivos = (evidencia.archivos?.length || 0) > 0;
                                        const tieneEnlace = (evidencia.archivos || []).some(
                                          (archivo) => archivo.is_publico && archivo.token_publico
                                        );
                                        const isLoading = loadingArchivos.has(evidencia.id);

                                        return (
                                          <div
                                            key={evidencia.id}
                                            className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                          >
                                            <div className="flex-1 min-w-0">
                                              <div className="text-xs text-gray-700 truncate">
                                                <span className="font-medium text-gray-900">{evidencia.nomenclatura}</span>
                                                <span className="text-gray-500"> - {evidencia.descripcion}</span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span
                                                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                                  isLoading
                                                    ? 'border-gray-200 bg-gray-50 text-gray-600'
                                                    : tieneEnlace
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : tieneArchivos
                                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                    : 'border-gray-200 bg-gray-50 text-gray-600'
                                                }`}
                                              >
                                                <span
                                                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                                                    isLoading
                                                      ? 'bg-gray-400'
                                                      : tieneEnlace
                                                      ? 'bg-green-500'
                                                      : tieneArchivos
                                                      ? 'bg-amber-500'
                                                      : 'bg-gray-400'
                                                  }`}
                                                />
                                                {isLoading
                                                  ? 'Cargando...'
                                                  : tieneEnlace
                                                  ? 'Enlace listo'
                                                  : tieneArchivos
                                                  ? 'Sin enlace'
                                                  : 'Sin archivos'}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => handleAbrirEnlaceEvidencia(evidencia)}
                                                disabled={isLoading || !tieneArchivos}
                                                className="ml-1 p-1.5 text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={
                                                  !tieneArchivos
                                                    ? 'No hay archivos adjuntos'
                                                    : 'Abrir enlace público'
                                                }
                                              >
                                                <SystemIcons.actions.linkIcon className="w-5 h-5" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Modal para gestionar enlaces públicos */}
      <PublicLinkModal
        isOpen={publicLinkModalOpen}
        onClose={() => {
          setPublicLinkModalOpen(false);
          setSelectedArchivo(null);
          setSelectedEvidencia(null);
        }}
        archivo={selectedArchivo}
        evidencia={selectedEvidencia}
        onSuccess={handleEnlaceGenerado}
      />
    </ScreenContainer>
  );
};

export default InformesFinales;
