import React, { useState, useEffect } from 'react';
import { ScreenContainer, PageHeader } from '@/Components/Ui/Index';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { useToast } from '@/Context/ToastContext';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { axiosInstance } from '@/Config/axios';
import { ApprovalModal } from './Components/ApprovalModal';
import { EvidenceFilesModal } from './Components/EvidenceFilesModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { FilterButton, type FilterOption } from '@/Components/Ui/Buttons/FilterButton';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { DataTable } from '@/components/index';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';

type ApprovalStatus = 'pendiente' | 'aprobado' | 'rechazado';

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  archivo_adjuntado?: boolean;
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

const BlockApproval: React.FC = () => {
  const moduleInfo = getModuleInfo('block_approval');
  const { showToast } = useToast();
  const [dataState, setDataState] = useState<{ isLoading: boolean; criteria: Criterio[]; evidences: Evidencia[]; processes: Proceso[] }>({ isLoading: true, criteria: [], evidences: [], processes: [] });
  const isLoading = dataState.isLoading;
  const criteria = dataState.criteria;
  const evidences = dataState.evidences;
  const processes = dataState.processes;
  // Estado para filtros y UI
  const [filterState, setFilterState] = useState<{ selectedProcesoId: number | null; currentPage: number; approvalFilter: ApprovalStatus | 'todos' }>({ selectedProcesoId: null, currentPage: 1, approvalFilter: 'pendiente' });
  const selectedProcesoId = filterState.selectedProcesoId;
  const currentPage = filterState.currentPage;
  const approvalFilter = filterState.approvalFilter;
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  // Estado para modales de aprobación y éxito
  const [approvalState, setApprovalState] = useState<{ isOpen: boolean; action: 'aprobar' | 'rechazar'; criterion: Criterio | null; successOpen: boolean }>({ isOpen: false, action: 'aprobar', criterion: null, successOpen: false });
  const isModalOpen = approvalState.isOpen;
  const modalAction = approvalState.action;
  const selectedCriterion = approvalState.criterion;
  const successModalState = { isOpen: approvalState.successOpen, action: approvalState.action };

  // Estado para modal de archivos
  const [filesModal, setFilesModal] = useState<{ open: boolean; evidencia: Evidencia | null }>({ open: false, evidencia: null });
  const filesModalOpen = filesModal.open;
  const selectedEvidencia = filesModal.evidencia;

  // Opciones para el filtro de aprobación
  const filtroOptions: FilterOption<ApprovalStatus | 'todos'>[] = [
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aprobado', label: 'Aprobados' },
    { value: 'rechazado', label: 'Rechazados' },
    { value: 'todos', label: 'Todos' },
  ];


  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProcesoId]); // Recargar cuando cambie el proceso seleccionado

  const fetchData = async () => {
    try {
      // Load criteria, evidences, processes and approvals in parallel
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
      
      setDataState(prev => ({
        ...prev,
        criteria: criteriaWithStatus,
        evidences: evidencesArray,
        processes: processesArray,
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error:', error);
      showToast({
        type: 'error',
        title: 'Error al cargar datos',
        message: error?.response?.data?.message || error?.message || 'No se pudieron cargar los criterios'
      });
      setDataState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getEvidencesByCriterion = (criterionId: number) => {
    return evidences.filter(ev => ev.criterio_id === criterionId);
  };

  const handleViewFiles = (evidencia: Evidencia) => {
    setFilesModal({ open: true, evidencia });
  };

  // Filter criteria by approval status
  const filteredCriteria = criteria.filter(criterio => {
    if (approvalFilter === 'todos') return true;
    return criterio.estado_aprobacion === approvalFilter;
  });

  // Calculate paginated data
  const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);
  const paginatedCriteria = filteredCriteria.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filtered criteria changes
  useEffect(() => {
    setFilterState(prev => ({...prev, currentPage: 1}));
  }, [filteredCriteria.length]);

  const APPROVAL_STATUS_COLORS: Record<string, string> = {
    pendiente:  'text-warning-dark bg-warning-ring',
    aprobado:   'text-verde-dark bg-verde-ring',
    rechazado:  'text-error-dark bg-error-ring',
  };
  const APPROVAL_STATUS_LABELS: Record<string, string> = {
    pendiente: 'Pendiente',
    aprobado:  'Aprobado',
    rechazado: 'Rechazado',
  };

  const criteriaColumns: DataTableColumn<Criterio>[] = [
    {
      key: 'nomenclatura',
      header: 'Criterio',
      width: '140px',
      render: (_, item) => (
        <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {item.nomenclatura}
        </p>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      align: 'left',
      render: (_, item) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-gris-una max-w-2xl truncate ${TYPOGRAPHY.table.cell}`}
          title={item.descripcion}>
          {item.descripcion}
        </p>
      ),
    },
    {
      key: 'estado_aprobacion',
      header: 'Estado',
      align: 'center',
      width: '130px',
      render: (_, item) => (
        <div className="flex justify-center">
          <StatusBadge
            label={APPROVAL_STATUS_LABELS[item.estado_aprobacion ?? 'pendiente'] ?? 'Pendiente'}
            colorClasses={APPROVAL_STATUS_COLORS[item.estado_aprobacion ?? 'pendiente'] ?? APPROVAL_STATUS_COLORS['pendiente']}
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: '110px',
      render: (_, item) => {
        const isPending = item.estado_aprobacion === 'pendiente';
        return (
          <div className="flex gap-1 justify-center" onClick={e => e.stopPropagation()}>
            <ButtonWithTooltip
              variant="tablePower"
              size="sm"
              tooltip={isPending ? 'Aprobar criterio' : 'Ya procesado'}
              onClick={isPending ? () => handleAprobar(item) : undefined}
              disabled={!isPending}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.interface.checkCircle className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              variant="tableDelete"
              size="sm"
              tooltip={isPending ? 'Rechazar criterio' : 'Ya procesado'}
              onClick={isPending ? () => handleRechazar(item) : undefined}
              disabled={!isPending}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.interface.xCircle className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>
          </div>
        );
      },
    },
  ];

  const handleAprobar = (criterio: Criterio) => {
    setApprovalState(prev => ({ ...prev, isOpen: true, action: 'aprobar', criterion: criterio }));
  };

  const handleRechazar = (criterio: Criterio) => {
    setApprovalState(prev => ({ ...prev, isOpen: true, action: 'rechazar', criterion: criterio }));
  };

  const handleConfirmAction = async (comentario: string) => {
    if (!selectedCriterion || !selectedProcesoId) return;

    try {
      const endpoint = modalAction === 'aprobar' 
        ? `/criterios/${selectedCriterion.id}/aprobar`
        : `/criterios/${selectedCriterion.id}/rechazar`;

      const response = await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
        comentario: comentario || null
      });

      console.log('Respuesta del backend:', response.data);

      // Cerrar modal de confirmación y mostrar modal de éxito
      setApprovalState(prev => ({ ...prev, isOpen: false, criterion: null, successOpen: true }));
      
      // Recargar datos para actualizar el estado
      await fetchData();
    } catch (error: any) {
      console.error('Error completo:', error);
      
      showToast({
        type: 'error',
        title: 'Error al procesar la solicitud',
        message: error.response?.data?.message || 'Ocurrió un error inesperado'
      });
      
      // Cerrar modal de confirmación
      setApprovalState(prev => ({ ...prev, isOpen: false, criterion: null }));
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
          {/* Selector de proceso y filtro */}
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <CustomSelect
                label="Seleccionar Proceso"
                value={selectedProcesoId?.toString() || ''}
                placeholder="Seleccione un proceso"
                size="sm"
                onChange={(value) => setFilterState(prev => ({...prev, selectedProcesoId: value ? Number(value) : null}))}
                options={processes
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
            
            <FilterButton
              tooltipText="Filtrar por estado"
              options={filtroOptions}
              value={approvalFilter}
              onChange={(value) => setFilterState(prev => ({...prev, approvalFilter: value}))}
            />
          </div>

          {/* Tabla de criterios */}
          {!selectedProcesoId ? (
            <div className="bg-white rounded-lg border border-gray-200 py-16">
              <div className="text-center">
                <SystemIcons.modal.document size="lg" className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-medium text-negro-una mb-1">No hay datos disponibles</p>
                <p className="text-sm text-gris-una">Seleccione un proceso para continuar</p>
              </div>
            </div>
          ) : (
            <DataTable
              data={paginatedCriteria as any}
              columns={criteriaColumns as any}
              title=""
              searchable={false}
              loading={false}
              emptyMessage="No hay criterios disponibles para el filtro seleccionado"
              pagination={
                totalPages > 1
                  ? { currentPage, totalPages, onPageChange: (value) => setFilterState(prev => ({ ...prev, currentPage: value })) }
                  : undefined
              }
              getRowKey={(item) => String(item.id)}
              expandableRow={(criterio: any) => {
                const criterionEvidences = getEvidencesByCriterion(criterio.id);
                if (criterionEvidences.length === 0) {
                  return <p className="text-sm text-gris-una py-2">No hay evidencias para este criterio.</p>;
                }
                return (
                  <div className="space-y-1.5 py-2">
                    {criterionEvidences.map((evidencia) => (
                      <div
                        key={evidencia.id}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border border-gray-200"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`truncate ${TYPOGRAPHY.table.cell}`}>
                            <span className="font-medium text-negro-una">{evidencia.nomenclatura}</span>
                            <span className="text-gris-una"> — {evidencia.descripcion}</span>
                          </p>
                        </div>
                        <ButtonWithTooltip
                          variant="tableView"
                          size="sm"
                          tooltip="Ver archivos asociados"
                          tooltipPosition="left"
                          onClick={(e) => { e.stopPropagation(); handleViewFiles(evidencia); }}
                          className={TABLE_ACTION_BUTTON.button}
                        >
                          <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
                        </ButtonWithTooltip>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          )}
        </>
      )}
      
      {/* Modal de confirmación */}
      {selectedCriterion && (
        <ApprovalModal
          isOpen={isModalOpen}
          onClose={() => setApprovalState(prev => ({ ...prev, isOpen: false, criterion: null }))}
          onConfirm={handleConfirmAction}
          action={modalAction}
          criterio={selectedCriterion}
          evidencias={getEvidencesByCriterion(selectedCriterion.id)}
        />
      )}
      
      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        onClose={() => setApprovalState(prev => ({ ...prev, successOpen: false }))}
        title={successModalState.action === 'aprobar' ? 'Criterio Aprobado' : 'Criterio Rechazado'}
        message={`El criterio ha sido ${successModalState.action === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente.`}
      />
      
      {/* Modal de archivos asociados */}
      <EvidenceFilesModal
        isOpen={filesModalOpen}
        onClose={() => setFilesModal({ open: false, evidencia: null })}
        evidencia={selectedEvidencia}
      />
    </ScreenContainer>
  );
};

export default BlockApproval;
