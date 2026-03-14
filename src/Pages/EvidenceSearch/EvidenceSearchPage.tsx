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

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { DropdownButton } from '@/Components/Ui/Buttons/DropdownButton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Feedback/Tooltip';
import type { DropdownOption } from '@/Components/Ui/Buttons/DropdownButton';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { EvidenceSearchResultsTable, EvidenceSearchFilters, EvidenceDetailsModal } from './Components';
import { useToast } from '@/Context/ToastContext';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { evidenceSearchService, mapBackendToFrontend } from '@/Services/EvidenceSearchService';
import type {
  EvidenceSearchFilters as EvidenceFilters,
  EvidenceSearchResult,
  ExportFormat
} from '@/Types/EvidenceSearchTypes';
import { ICON_SIZES } from '@/Constants/Components';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';

export const EvidenceSearchPage: React.FC = () => {
  const { showToast } = useToast();

  // Estado de resultados
  const [filteredResults, setFilteredResults] = useState<EvidenceSearchResult[]>([]);
  const [displayedResults, setDisplayedResults] = useState<EvidenceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  
  // Filtros actuales
  const [currentFilters, setCurrentFilters] = useState<EvidenceFilters>({});

  // Modal de detalles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCriterioId, setSelectedCriterioId] = useState<number | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    // Ejecutar búsqueda inicial sin filtros
    applyFilters({});
  }, []);

  // Filtrar localmente según término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setDisplayedResults(filteredResults);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = filteredResults.filter(
      (item) =>
        item.descripcion.toLowerCase().includes(term) ||
        item.criterio_nomenclatura.toLowerCase().includes(term) ||
        item.criterio_descripcion.toLowerCase().includes(term) ||
        item.responsables.some(r => r.nombre.toLowerCase().includes(term))
    );

    setDisplayedResults(filtered);
  }, [filteredResults, searchTerm]);

  // Handler para cambio en el buscador
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback(async (filtersToApply: EvidenceFilters, page: number = 1) => {
    setLoading(true);
    setCurrentFilters(filtersToApply);
    setCurrentPage(page);

    try {
      // Llamar al backend con timestamp para evitar caché
      const response = await evidenceSearchService.search(
        filtersToApply,
        page,
        itemsPerPage
      );

      // Mapear datos del backend a nuestro formato
      const mappedResults = response.data.map(mapBackendToFrontend);
      
      setFilteredResults(mappedResults);
      setDisplayedResults(mappedResults);

      setLoading(false);

      // TODO: Implementar componente de toast y descomentar
      // if (mappedResults.length === 0) {
      //   showToast({
      //     type: 'info',
      //     title: 'No se encontraron evidencias con los filtros aplicados'
      //   });
      // } else {
      //   showToast({
      //     type: 'success',
      //     title: `Se encontraron ${response.meta.total} evidencia(s)`
      //   });
      // }
    } catch (error) {
      setLoading(false);
      setFilteredResults([]);
      setDisplayedResults([]);
      // TODO: Implementar componente de toast y descomentar
      // showToast({
      //   type: 'error',
      //   title: 'Error al buscar evidencias. Intente nuevamente.'
      // });
      console.error('Error en búsqueda:', error);
    }
  }, [showToast, currentPage, itemsPerPage]);

  // Exportar resultados
  const handleExport = async (format: ExportFormat) => {
    setLoading(true);

    try {
      if (format === 'excel') {
        await evidenceSearchService.exportExcel(currentFilters);
      } else {
        await evidenceSearchService.exportPDF(currentFilters);
      }

      setLoading(false);
      // TODO: Implementar componente de toast y descomentar
      // showToast({
      //   type: 'success',
      //   title: 'Archivo descargado exitosamente'
      // });
    } catch (error) {
      setLoading(false);
      // TODO: Implementar componente de toast y descomentar
      // showToast({
      //   type: 'error',
      //   title: 'Error al exportar. Intente nuevamente.'
      // });
      console.error('Error en exportación:', error);
    }
  };

  // Ver detalles de evidencia
  const handleViewDetails = (evidenceId: number) => {
    const evidence = displayedResults.find(e => e.evidencia_id === evidenceId);
    if (evidence) {
      setSelectedCriterioId(evidence.criterio_id);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCriterioId(null);
  };

  const moduleInfo = getModuleInfo('evidence_search');

  // Opciones del menú de exportación
  const exportOptions: DropdownOption[] = [
    {
      id: 'pdf',
      label: 'Exportar a PDF',
      icon: <SystemIcons.modal.pdf className={`text-negro-una-2 ${ICON_SIZES.md}`} />,
      onClick: () => handleExport('pdf'),
      disabled: displayedResults.length === 0
    },
    {
      id: 'excel',
      label: 'Exportar a Excel',
      icon: <SystemIcons.modal.excel className={`text-negro-una-2 ${ICON_SIZES.md}`} />,
      onClick: () => handleExport('excel'),
      disabled: displayedResults.length === 0
    }
  ];

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Buscar por descripción, criterio o responsable..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={loading}
            />
          </div>
        }
      />
      {/* Header con botones de acción */}
      <div className="mb-6 flex justify-end items-center gap-3">
        <DropdownButton
            label="Exportar"
            icon={<SystemIcons.actions.export className={`text-negro-una-2 ${ICON_SIZES.button}`} />}
            variant="outline"
            options={exportOptions}
            disabled={loading || displayedResults.length === 0}
          />
      {/** TODO: hacer un componente para este botón desplegable. Ya existe filterbutton pero es un dropdown, este hace aparecer multiples opciones singleselect 
       * Revisar si evidenceSearchFilter es el que lo maneja (no recuerdo) y si sí, hacerlo componente
      */}
        <Tooltip>
          <TooltipTrigger>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={
                `p-2 rounded-corner border transition-colors
                border-blanco-una-2 bg-blanco-una-2
                hover:bg-gris-una/20
                ${showFilters ? 'bg-azul-una/10' : ''}`
              }
            >
              <div className="text-gris-una">
                <SystemIcons.interface.filter size="md" color="currentColor" />
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div>
          <EvidenceSearchFilters
            onApplyFilters={applyFilters}
            isLoading={loading}
          />
        </div>
      )}

      {/* Tabla de resultados */}
      <div>
        <EvidenceSearchResultsTable
          results={displayedResults}
          loading={loading}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Modal de detalles */}
      <EvidenceDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        criterioId={selectedCriterioId}
      />
    </ScreenContainer>
  );
};

export default EvidenceSearchPage;
