/**
 * EvidenceSearchPage - Página de búsqueda avanzada de evidencias
 * Mockup funcional para demostración del diseño y flujo de búsqueda con filtros
 * 
 * Características:
 * - Filtros múltiples: criterio, responsable, fecha, estado, rol
 * - Paginación
 * - Exportación a PDF/Excel (simulada)
 * - Restricción de resultados según rol del usuario
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, ScreenContainer, Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Index';
import type { SelectOption } from '@/Components/Ui/Index';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { Button } from '@/Components/Ui/Buttons/Button';
import { DropdownButton } from '@/Components/Ui/Buttons/DropdownButton';
import type { DropdownOption } from '@/Components/Ui/Buttons/DropdownButton';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { EvidenceSearchResultsTable, EvidenceDetailsModal, EvidenceSearchFiltersPanel } from './Components';
import { useToast } from '@/Context/ToastContext';
import { useAuth } from '@/Context/AuthContext';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { evidenceSearchService, mapBackendToFrontend } from '@/Services/EvidenceSearchService';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import type {
  EvidenceSearchFilters as EvidenceFilters,
  EvidenceSearchResult,
  ExportFormat
} from '@/Types/EvidenceSearchTypes';
import { filterEvidenceResults } from '@/Types/EvidenceSearchTypes';
import type { Process } from '@/Types/EvidenceAssignment';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import { ICON_SIZES } from '@/Constants/Components';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { TYPOGRAPHY } from '@/Constants/Typography';

export const EvidenceSearchPage: React.FC = () => {
  const { showToast } = useToast();
  const { user: _user } = useAuth();

  // ── Contexto de proceso / modelo ─────────────────────────────────────────
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [flexElements, setFlexElements] = useState<FlexibleElement[]>([]);

  const selectedProcess = useMemo(
    () => (selectedProcessId ? processes.find(p => p.proceso_id === parseInt(selectedProcessId)) ?? null : null),
    [processes, selectedProcessId]
  );
  const isFlexible = selectedProcess?.modelo_estructura_tipo === 'elemento_flexible';

  const processOptions = useMemo<SelectOption[]>(
    () => processes.map(p => ({ value: p.proceso_id.toString(), label: p.nombre })),
    [processes]
  );

  // Elementos hoja del modelo flexible (sin hijos, activos)
  const elementOptions = useMemo<SelectOption[]>(() => {
    if (!isFlexible) return [];
    const parentIds = new Set(
      flexElements.filter(e => e.padre_id !== null).map(e => e.padre_id as number)
    );
    return flexElements
      .filter(e => !parentIds.has(e.elemento_id) && e.activo)
      .map(e => ({ value: e.elemento_id.toString(), label: e.nombre ?? `Elemento ${e.elemento_id}` }));
  }, [isFlexible, flexElements]);

  // Estado de resultados y búsqueda
  const [searchState, setSearchState] = useState<{ filteredResults: EvidenceSearchResult[]; displayedResults: EvidenceSearchResult[]; loading: boolean; searchTerm: string; currentPage: number; currentFilters: EvidenceFilters }>({
    filteredResults: [], displayedResults: [], loading: false, searchTerm: '', currentPage: 1, currentFilters: {}
  });
  const filteredResults = searchState.filteredResults;
  const displayedResults = searchState.displayedResults;
  const loading = searchState.loading;
  const searchTerm = searchState.searchTerm;
  const currentPage = searchState.currentPage;
  const currentFilters = searchState.currentFilters;
  // Paginación
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  // Visibilidad del panel de filtros
  const [showFilters, setShowFilters] = useState(false);

  // Modal de detalles
  const [modalState, setModalState] = useState<{ isOpen: boolean; selectedCriterioId: number | null }>({ isOpen: false, selectedCriterioId: null });
  const isModalOpen = modalState.isOpen;
  const selectedCriterioId = modalState.selectedCriterioId;

  // Modal de retroalimentación movido a EvidenceDetailsModal

  // Cargar procesos al montar
  useEffect(() => {
    evidenceAssignmentService.getAllProcesses().then(setProcesses).catch(console.error);
  }, []);

  // Cargar elementos del modelo al seleccionar un proceso flexible
  useEffect(() => {
    if (!isFlexible || !selectedProcess?.modelo_estructura_id) {
      setFlexElements([]);
      return;
    }
    evidenceAssignmentService
      .getElementsByModel(selectedProcess.modelo_estructura_id)
      .then(setFlexElements)
      .catch(console.error);
  }, [isFlexible, selectedProcess?.modelo_estructura_id]);

  // Cargar datos iniciales
  useEffect(() => {
    // Ejecutar búsqueda inicial sin filtros
    applyFilters({});
  }, []);

  // Filtrar localmente según término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchState(prev => ({ ...prev, displayedResults: filteredResults }));
      return;
    }

    const filtered = filterEvidenceResults(filteredResults, searchTerm);
    setSearchState(prev => ({ ...prev, displayedResults: filtered }));
  }, [filteredResults, searchTerm]);

  // Handler para cambio en el buscador
  const handleSearchChange = useCallback((term: string) => {
    setSearchState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback(async (filtersToApply: EvidenceFilters, page: number = 1) => {
    setSearchState(prev => ({ ...prev, loading: true, currentFilters: filtersToApply, currentPage: page }));

    try {
      // Llamar al backend con timestamp para evitar caché
      const response = await evidenceSearchService.search(
        filtersToApply,
        page,
        itemsPerPage
      );

      // Mapear datos del backend a nuestro formato
      const mappedResults = response.data.map(mapBackendToFrontend);
      
      setSearchState(prev => ({ ...prev, filteredResults: mappedResults, displayedResults: mappedResults, loading: false }));

      if (mappedResults.length === 0) {
        showToast({
          type: 'info',
          title: 'Sin resultados',
          message: 'No se encontraron evidencias con los filtros aplicados'
        });
      }
    } catch (error) {
      setSearchState(prev => ({ ...prev, loading: false, filteredResults: [], displayedResults: [] }));
      showToast({
        type: 'error',
        title: 'Error al buscar evidencias',
        message: 'Intente nuevamente'
      });
      console.error('Error en búsqueda:', error);
    }
  }, [showToast, currentPage, itemsPerPage]);

  // Cambio de proceso — actualiza selección y lanza búsqueda con proceso correcto
  const handleProcessChange = useCallback((value: string) => {
    const newId = value === '__all__' ? '' : value;
    setSelectedProcessId(newId);
    const newProcess = processes.find(p => p.proceso_id === parseInt(newId)) ?? null;
    const newIsFlexible = newProcess?.modelo_estructura_tipo === 'elemento_flexible';
    applyFilters({
      proceso_id: newId ? parseInt(newId) : null,
      is_flexible: newIsFlexible,
    });
  }, [applyFilters, processes]);

  // Exportar resultados
  const handleExport = async (format: ExportFormat) => {
    setSearchState(prev => ({ ...prev, loading: true }));
    try {
      if (format === 'excel') {
        await evidenceSearchService.exportExcel(currentFilters);
      } else {
        await evidenceSearchService.exportPDF(currentFilters);
      }

      setSearchState(prev => ({ ...prev, loading: false }));
      showToast({
        type: 'success',
        title: 'Archivo descargado exitosamente'
      });
    } catch (error) {
      setSearchState(prev => ({ ...prev, loading: false }));
      showToast({
        type: 'error',
        title: 'Error al exportar',
        message: 'Intente nuevamente'
      });
      console.error('Error en exportación:', error);
    }
  };

  // Ver detalles de evidencia
  const handleViewDetails = (evidenceId: number) => {
    const evidence = displayedResults.find(e => e.evidencia_id === evidenceId);
    if (evidence) {
      setModalState({ isOpen: true, selectedCriterioId: evidence.criterio_id });
    }
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, selectedCriterioId: null });
  };

  // Handlers de retroalimentación movidos a EvidenceDetailsModal

  const moduleInfo = getModuleInfo('evidence_search');
  const pageTitle = isFlexible ? 'Explorador de Pautas' : moduleInfo.title;

  // Opciones del menú de exportación
  const exportOptions: DropdownOption[] = [
    {
      id: 'pdf',
      label: <span className={TYPOGRAPHY.button}>Exportar a PDF</span>,
      icon: <SystemIcons.modal.pdf className={`text-negro-una-2 ${ICON_SIZES.md}`} />,
      onClick: () => handleExport('pdf'),
      disabled: displayedResults.length === 0
    },
    {
      id: 'excel',
      label: <span className={TYPOGRAPHY.button}>Exportar a Excel</span>,
      icon: <SystemIcons.modal.excel className={`text-negro-una-2 ${ICON_SIZES.md}`} />,
      onClick: () => handleExport('excel'),
      disabled: displayedResults.length === 0
    }
  ];

  return (
    <ScreenContainer>
      <PageHeader
        title={pageTitle}
        description={moduleInfo.description}
        headerExtra={
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-64">
              <SearchInput
                placeholder={isFlexible ? 'Buscar por descripción, pauta o responsable...' : 'Buscar por descripción, criterio o responsable...'}
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={loading}
              />
            </div>
            <DropdownButton
              label={<span className={TYPOGRAPHY.button}>Exportar</span>}
              icon={<SystemIcons.actions.export className={`text-negro-una-2 ${ICON_SIZES.button}`} />}
              variant="outline"
              options={exportOptions}
              disabled={loading || displayedResults.length === 0}
            />
            <Tooltip>
              <TooltipTrigger>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowFilters(prev => !prev)}
                >
                  <SystemIcons.interface.filter className={ICON_SIZES.md} color="currentColor" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Filtros</p>
              </TooltipContent>
            </Tooltip>
          </div>
        }
      >
        {showFilters && (
          <EvidenceSearchFiltersPanel
            onFiltersChange={(filters) => applyFilters({ ...currentFilters, ...filters, is_flexible: isFlexible })}
            isFlexible={isFlexible}
            processOptions={processOptions}
            selectedProcessId={selectedProcessId}
            onProcessChange={handleProcessChange}
            elementOptions={elementOptions}
          />
        )}
      </PageHeader>

      {/* Tabla de resultados */}
      <EvidenceSearchResultsTable
        results={displayedResults}
        loading={loading}
        onViewDetails={handleViewDetails}
        isFlexible={isFlexible}
      />

      {/* Modal de detalles */}
      <EvidenceDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        criterioId={selectedCriterioId}
      />
    </ScreenContainer>
  );
};

