import React, { useState, useEffect } from 'react';
import { ScreenContainer, PageHeader } from '@/Components/Ui/Index';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { axiosInstance } from '@/Config/axios';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { PublicLinkModal } from './Components/PublicLinkModal';
import { DropdownButton } from '@/Components/Ui/Buttons/DropdownButton';
import type { DropdownOption } from '@/Components/Ui/Buttons/DropdownButton';
import { usePdfExport } from '@/Hooks/usePdfExport';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { useToast } from '@/Context/ToastContext';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';

type ApprovalStatus = 'pendiente' | 'aprobado' | 'rechazado';

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
  estado_aprobacion?: ApprovalStatus;
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

// ---------- Expandable row component ----------
interface EvidenceExpansionProps {
  criterio: Criterio;
  evidences: Evidencia[];
  loadingFiles: Set<number>;
  onLoadFile: (id: number) => void;
  onOpenLink: (evidencia: Evidencia) => void;
}

const EvidenceExpansionRow: React.FC<EvidenceExpansionProps> = ({
  criterio,
  evidences,
  loadingFiles,
  onLoadFile,
  onOpenLink,
}) => {
  const criterionEvidences = evidences.filter((e) => e.criterio_id === criterio.id);
  const [noFilesModal, setNoFilesModal] = useState<{ open: boolean; evidencia: Evidencia | null }>({ open: false, evidencia: null });

  useEffect(() => {
    criterionEvidences.forEach((ev) => {
      if (!ev.archivos) onLoadFile(ev.id);
    });
    // Only run on mount for this criterio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criterio.id]);

  if (criterionEvidences.length === 0) {
    return <p className="px-4 py-3 text-sm text-gris-una">Sin evidencias</p>;
  }

  return (
    <>
      <div className="p-4 bg-gray-50 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Evidencias del Criterio:</h4>
        <div className="space-y-1.5">
          {criterionEvidences.map((evidencia) => {
            const tieneArchivos = (evidencia.archivos?.length || 0) > 0;
            const tieneEnlace = (evidencia.archivos || []).some(
              (archivo) => archivo.is_publico && archivo.token_publico
            );
            const isLoadingFile = loadingFiles.has(evidencia.id);

            return (
              <div
                key={evidencia.id}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-1 min-w-0">
                  <p className={`truncate ${TYPOGRAPHY.table.cell}`}>
                    <span className="font-medium text-negro-una">{evidencia.nomenclatura}</span>
                    <span className="text-gris-una"> — {evidencia.descripcion}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 ml-3 shrink-0">
                  {isLoadingFile ? (
                    <span className="text-xs text-gris-una px-2">Cargando...</span>
                  ) : tieneEnlace ? (
                    <>
                      <StatusBadge label="Enlace listo" colorClasses="text-verde-dark bg-verde-ring" />
                      <ButtonWithTooltip
                        variant="tableView"
                        size="sm"
                        tooltip="Abrir enlace público"
                        tooltipPosition="left"
                        onClick={() => onOpenLink(evidencia)}
                        className={TABLE_ACTION_BUTTON.button}
                      >
                        <SystemIcons.actions.linkIcon className={TABLE_ACTION_BUTTON.icon} />
                      </ButtonWithTooltip>
                    </>
                  ) : tieneArchivos ? (
                    <>
                      <StatusBadge label="Sin enlace" colorClasses="text-warning-dark bg-warning-ring" />
                      <ButtonWithTooltip
                        variant="tableView"
                        size="sm"
                        tooltip="Abrir enlace público"
                        tooltipPosition="left"
                        onClick={() => onOpenLink(evidencia)}
                        className={TABLE_ACTION_BUTTON.button}
                      >
                        <SystemIcons.actions.linkIcon className={TABLE_ACTION_BUTTON.icon} />
                      </ButtonWithTooltip>
                    </>
                  ) : (
                    <ButtonWithTooltip
                      variant="tableView"
                      size="sm"
                      tooltip="Ver archivos asociados"
                      tooltipPosition="left"
                      onClick={() => setNoFilesModal({ open: true, evidencia })}
                      className={TABLE_ACTION_BUTTON.button}
                    >
                      <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
                    </ButtonWithTooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal sin archivos */}
      <Modal
        isOpen={noFilesModal.open}
        onClose={() => setNoFilesModal({ open: false, evidencia: null })}
        title="Archivos de la evidencia"
        subtitle={noFilesModal.evidencia?.nomenclatura ?? ''}
        size="md"
        variant="info"
        heroIcon={<SystemIcons.modal.document className="h-5 w-5 text-blanco-una" />}
        showCancel
        cancelLabel="Cerrar"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">{noFilesModal.evidencia?.descripcion}</div>
          </div>
          <div className="border border-gray-200 rounded-md p-8">
            <div className="text-center">
              <SystemIcons.modal.document className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay archivos asociados</h3>
              <p className="mt-1 text-sm text-gray-500">Esta evidencia aún no tiene archivos adjuntos.</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
// ---------- End EvidenceExpansionRow ----------

const FinalReports: React.FC = () => {
  const moduleInfo = getModuleInfo('final_reports');
  const { exportToPdf: generatePdfReport } = usePdfExport();
  const { showToast } = useToast();
  
  const [dataState, setDataState] = useState<{ isLoading: boolean; criteria: Criterio[]; evidences: Evidencia[]; processes: Proceso[] }>({ isLoading: true, criteria: [], evidences: [], processes: [] });
  const isLoading = dataState.isLoading;
  const criteria = dataState.criteria;
  const evidences = dataState.evidences;
  const processes = dataState.processes;
  const [uiState, setUiState] = useState<{ selectedProcesoId: number | null; loadingFiles: Set<number> }>({ selectedProcesoId: null, loadingFiles: new Set() });
  const selectedProcesoId = uiState.selectedProcesoId;
  const loadingFiles = uiState.loadingFiles;
  
  // Modal de detalle de criterio
  const [detailModal, setDetailModal] = useState<{ open: boolean; criterio: Criterio | null }>({ open: false, criterio: null });

  // Modal de enlaces públicos
  const [publicLinkModal, setPublicLinkModal] = useState<{ open: boolean; archivo: Archivo | null; evidencia: Evidencia | null }>({ open: false, archivo: null, evidencia: null });
  const publicLinkModalOpen = publicLinkModal.open;
  const selectedArchivo = publicLinkModal.archivo;
  const selectedEvidencia = publicLinkModal.evidencia;
  
  // Modal de confirmación para generar todos los enlaces
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; isGeneratingLinks: boolean }>({ show: false, isGeneratingLinks: false });
  const showConfirmModal = confirmModal.show;
  const isGeneratingLinks = confirmModal.isGeneratingLinks;

  useEffect(() => {
    fetchData();
  }, [selectedProcesoId]);

  const fetchData = async () => {
    try {
      setDataState(prev => ({ ...prev, isLoading: true }));
      const [criteriaResponse, evidencesResponse, processesResponse, approvalsResponse] = await Promise.all([
        axiosInstance.get('/estructura/criterios'),
        axiosInstance.get('/estructura/evidencias'),
        axiosInstance.get('/estructura/procesos'),
        axiosInstance.get('/aprobaciones-criterios')
      ]);
      
      const criteriaArray = criteriaResponse.data.data || criteriaResponse.data;
      const evidencesArray = evidencesResponse.data.data || evidencesResponse.data;
      const processesArray = processesResponse.data.data || processesResponse.data;
      const approvalsArray = approvalsResponse.data.data || approvalsResponse.data;
      
      // Create approvals map by criterio_id + proceso_id
      const approvalsMap = new Map<string, ApprovalStatus>();
      approvalsArray.forEach((aprobacion: any) => {
        const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
        approvalsMap.set(key, aprobacion.estado as ApprovalStatus);
      });
      
      // Assign approval status according to selected process
      const criteriaWithStatus = criteriaArray.map((c: any) => {
        const key = selectedProcesoId ? `${c.id}-${selectedProcesoId}` : '';
        const approvalStatus = approvalsMap.get(key) || 'pendiente';
        
        return {
          ...c,
          estado_aprobacion: approvalStatus as ApprovalStatus
        };
      });
      
      // Filter only approved criteria
      const approvedCriteria = criteriaWithStatus.filter(
        (c: Criterio) => c.estado_aprobacion === 'aprobado'
      );
      
      setDataState(prev => ({ ...prev, criteria: approvedCriteria, evidences: evidencesArray, processes: processesArray }));
    } catch (error: any) {
      console.error('Error:', error);
      showToast({
        type: 'error',
        title: 'Error al cargar informe',
        message: error?.response?.data?.message || error?.message || 'No se pudieron cargar los datos del informe'
      });
    } finally {
      setDataState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getEvidenciasPorCriterio = (criterioId: number) => {
    return evidences.filter(ev => ev.criterio_id === criterioId);
  };

  const loadEvidenceFiles = async (evidenciaId: number) => {
    if (loadingFiles.has(evidenciaId)) return;
    
    setUiState(prev => ({...prev, loadingFiles: new Set(prev.loadingFiles).add(evidenciaId)}));
    
    try {
      const response = await axiosInstance.get(`/archivos?evidencia_id=${evidenciaId}`);
      const archivos = response.data.data || response.data;
      
      // Update evidences with loaded files
      setDataState(prev => ({ ...prev, evidences: prev.evidences.map(ev => 
        ev.id === evidenciaId ? { ...ev, archivos } : ev
      ) }));
    } catch (error) {
      console.error('Error cargando archivos:', error);
    } finally {
      setUiState(prev => {
        const newSet = new Set(prev.loadingFiles);
        newSet.delete(evidenciaId);
        return {...prev, loadingFiles: newSet};
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

  const handleGenerateLink = (archivo: Archivo, evidencia: Evidencia) => {
    setPublicLinkModal({ open: true, archivo, evidencia });
  };

  const handleAbrirEnlaceEvidencia = (evidencia: Evidencia) => {
    const archivo = getArchivoParaEnlace(evidencia);
    if (!archivo) {
      showToast({ type: 'warning', title: 'No hay archivos adjuntos para esta evidencia' });
      return;
    }

    handleGenerateLink(archivo, evidencia);
  };

  const handleEnlaceGenerado = async () => {
    // Recargar los archivos de la evidencia seleccionada
    if (selectedEvidencia) {
      await loadEvidenceFiles(selectedEvidencia.id);
    }
    setPublicLinkModal({ open: false, archivo: null, evidencia: null });
  };

  const handleGenerateAllLinks = async () => {
    if (!selectedProcesoId) {
      showToast({ type: 'error', title: 'Seleccione un proceso primero' });
      return;
    }
    
    setConfirmModal({ show: true, isGeneratingLinks: false });
  };
  
  const confirmGenerateAllLinks = async () => {
    setConfirmModal({ show: false, isGeneratingLinks: true });

    try {
      // Collect all files from all evidences
      const todosLosArchivos: number[] = [];
      
      for (const criterio of criteria) {
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
        showToast({ type: 'info', title: 'No hay archivos sin enlace público' });
        return;
      }

      await axiosInstance.post('/archivos/bulk-make-public', {
        archivo_ids: todosLosArchivos
      });

      showToast({ 
        type: 'success', 
        title: `Se generaron ${todosLosArchivos.length} enlaces públicos exitosamente` 
      });
      
      // Reload all evidences that have been previously loaded
      const evidencesWithFiles = evidences.filter(ev => ev.archivos !== undefined);
      await Promise.all(evidencesWithFiles.map(ev => loadEvidenceFiles(ev.id)));
    } catch (error: any) {
      console.error('Error generando enlaces masivos:', error);
      showToast({ 
        type: 'error', 
        title: error.response?.data?.message || 'Error al generar enlaces públicos' 
      });
    } finally {
      setConfirmModal(prev => ({ ...prev, isGeneratingLinks: false }));
    }
  };

  const buildReportRows = () => {
    return criteria.flatMap((criterio) => {
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
    const procesoSeleccionado = processes.find(p => p.proceso_id === selectedProcesoId);
    if (!procesoSeleccionado) return;

    generatePdfReport({
      title: 'Informe de Evidencias con Enlaces',
      metadata: {
        'Proceso': `${procesoSeleccionado.accreditation_cycle.career_campus.career.nombre} - ${procesoSeleccionado.accreditation_cycle.career_campus.campus.nombre}`,
        'Tipo': `${procesoSeleccionado.tipo_proceso} | Ciclo: ${procesoSeleccionado.accreditation_cycle.nombre}`,
        'Generado': new Date().toLocaleString()
      },
      columns: [
        { header: 'Criterio', key: 'criterio' },
        { header: 'Evidencia', key: 'evidencia' },
        { header: 'Enlace', key: 'link' }
      ],
      data: rows
    });
  };

  const handleExportInforme = (format: ExportFormat) => {
    if (!selectedProcesoId) {
      showToast({ type: 'error', title: 'Seleccione un proceso primero' });
      return;
    }

    const rows = buildReportRows();
    if (rows.length === 0) {
      showToast({ type: 'warning', title: 'No hay evidencias para exportar' });
      return;
    }

    if (format === 'excel') {
      downloadCsv(rows);
    } else {
      exportToPdf(rows);
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
      />
      {isLoading ? (
        <div className="relative py-12 min-h-[400px]">
          <LoadingSpinner variant="loader" />
        </div>
      ) : (
        <>
          {/* Selector de proceso y acciones */}
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <CustomSelect
                label="Seleccionar Proceso"
                value={selectedProcesoId?.toString() || ''}
                placeholder="Seleccione un proceso"
                size="sm"
                onChange={(value) => setUiState(prev => ({...prev, selectedProcesoId: value ? Number(value) : null}))}
                options={processes
                  .filter((proceso: Proceso) => 
                    proceso.accreditation_cycle?.career_campus?.career?.nombre && 
                    proceso.accreditation_cycle?.career_campus?.campus?.nombre
                  )
                  .map((proceso: Proceso) => ({
                    value: proceso.proceso_id.toString(),
                    label: `${proceso.accreditation_cycle.career_campus.career.nombre} - ${proceso.accreditation_cycle.career_campus.campus.nombre} (${proceso.tipo_proceso})`
                  }))}
                maxVisibleItems={5}
              />
            </div>
            
            {/* Botones de acción */}
            {selectedProcesoId && criteria.length > 0 && (
              <>
                <ButtonWithTooltip
                  variant="primary"
                  size="sm"
                  tooltip="Generar enlaces"
                  onClick={handleGenerateAllLinks}
                  className="h-9 w-9 max-h-[36px] max-w-[36px]"
                >
                  <SystemIcons.actions.linkIcon className="w-4 h-4" />
                </ButtonWithTooltip>
                <DropdownButton
                  label="Exportar"
                  variant="outline"
                  size="sm"
                  icon={<SystemIcons.actions.export className="w-4 h-4" />}
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
              </>
            )}
          </div>

          {/* Lista de criterios aprobados */}
          {!selectedProcesoId ? (
            <div className="bg-white rounded-lg border border-gray-200 py-16">
              <div className="text-center">
                <SystemIcons.modal.document size="lg" className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-medium text-negro-una mb-1">No hay datos disponibles</p>
                <p className="text-sm text-gris-una">Seleccione un proceso para continuar</p>
              </div>
            </div>
          ) : (
            <>
              {criteria.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex flex-col items-center">
                    <SystemIcons.modal.document className="h-24 w-24 text-gris-una mb-4" />
                    <p className="text-sm font-medium text-negro-una mb-1">No hay criterios aprobados</p>
                    <p className="text-sm text-gris-una">No se encontraron criterios aprobados para este proceso</p>
                  </div>
                </div>
              ) : (
<DataTable
                  data={criteria as any}
                  columns={([
                    {
                      key: 'nomenclatura',
                      header: 'Criterio',
                      width: '140px',
                      render: (_: any, item: any) => (
                        <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
                          {item.nomenclatura}
                        </p>
                      ),
                    },
                    {
                      key: 'descripcion',
                      header: 'Descripción',
                      render: (_: any, item: any) => (
                        <p
                          className={`block font-sans antialiased font-normal leading-normal text-gris-una max-w-2xl truncate ${TYPOGRAPHY.table.cell}`}
                          title={item.descripcion}
                        >
                          {item.descripcion}
                        </p>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Acciones',
                      align: 'center',
                      width: '90px',
                      render: (_: any, item: any) => (
                        <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                          <ButtonWithTooltip
                            variant="tableView"
                            size="sm"
                            tooltip="Ver detalles"
                            onClick={() => setDetailModal({ open: true, criterio: item })}
                            className={TABLE_ACTION_BUTTON.button}
                          >
                            <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
                          </ButtonWithTooltip>
                        </div>
                      ),
                    },
                  ] as DataTableColumn[]) as any}
                  getRowKey={(item: any) => item.id.toString()}
                  expandableRow={(item: any) => (
                    <EvidenceExpansionRow
                      criterio={item}
                      evidences={evidences}
                      loadingFiles={loadingFiles}
                      onLoadFile={loadEvidenceFiles}
                      onOpenLink={handleAbrirEnlaceEvidencia}
                    />
                  )}
                  searchable={false}
                />
              )}
            </>
          )}
        </>
      )}
      
      {/* Modal de detalle de criterio */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, criterio: null })}
        title={detailModal.criterio?.nomenclatura ?? ''}
        subtitle="Descripción completa del criterio"
        size="md"
        variant="info"
        heroIcon={<SystemIcons.modal.document className="h-5 w-5 text-blanco-una" />}
        showCancel
        cancelLabel="Cerrar"
      >
        <p className="text-sm text-gris-una leading-relaxed">{detailModal.criterio?.descripcion}</p>
      </Modal>

      {/* Modal de confirmación para generar todos los enlaces */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, show: false }))}
        title="Generar Enlaces Públicos"
        size="md"
        variant="warning"
        showConfirm={true}
        confirmLabel="Generar"
        onConfirm={confirmGenerateAllLinks}
        confirmLoading={isGeneratingLinks}
        showCancel={true}
        cancelLabel="Cancelar"
      >
        ¿Está seguro que desea generar enlaces públicos para TODAS las evidencias de los criterios aprobados? Esta acción puede tardar un momento.
      </Modal>
      
      {/* Modal para gestionar enlaces públicos */}
      <PublicLinkModal
        isOpen={publicLinkModalOpen}
        onClose={() => setPublicLinkModal({ open: false, archivo: null, evidencia: null })}
        archivo={selectedArchivo}
        evidencia={selectedEvidencia}
        onSuccess={handleEnlaceGenerado}
      />
    </ScreenContainer>
  );
};

export default FinalReports;
