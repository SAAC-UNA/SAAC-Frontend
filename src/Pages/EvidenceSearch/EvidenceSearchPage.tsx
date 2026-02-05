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
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { DropdownButton } from '@/Components/Ui/DropdownButton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Tooltip';
import type { DropdownOption } from '@/Components/Ui/DropdownButton';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { EvidenceSearchResultsTable, EvidenceSearchFilters } from './Components';
import { useToast } from '@/Context/ToastContext';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import type {
  EvidenceSearchFilters as EvidenceFilters,
  EvidenceSearchResult,
  ExportFormat
} from '@/Types/EvidenceSearchTypes';
import { mockEvidenceResults } from '@/Mocks/EvidenceSearchMockData';

export const EvidenceSearchPage: React.FC = () => {
  const { showToast } = useToast();

  // Estado de resultados
  const [filteredResults, setFilteredResults] = useState<EvidenceSearchResult[]>([]);
  const [displayedResults, setDisplayedResults] = useState<EvidenceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    setFilteredResults(mockEvidenceResults);
    setDisplayedResults(mockEvidenceResults);
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
        item.responsable.nombre.toLowerCase().includes(term)
    );

    setDisplayedResults(filtered);
  }, [filteredResults, searchTerm]);

  // Handler para cambio en el buscador
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback((filtersToApply: EvidenceFilters) => {
    setLoading(true);

    // Simular delay de API
    setTimeout(() => {
      let filtered = [...mockEvidenceResults];

      // Filtro por criterio
      if (filtersToApply.criterio) {
        filtered = filtered.filter(
          (item) => item.criterio_nomenclatura === filtersToApply.criterio
        );
      }

      // Filtro por responsable
      if (filtersToApply.responsable_id) {
        filtered = filtered.filter(
          (item) => item.responsable.usuario_id === filtersToApply.responsable_id
        );
      }

      // Filtro por fecha desde
      if (filtersToApply.fecha_publicacion_desde) {
        filtered = filtered.filter(
          (item) =>
            new Date(item.fecha_publicacion) >= new Date(filtersToApply.fecha_publicacion_desde!)
        );
      }

      // Filtro por fecha hasta
      if (filtersToApply.fecha_publicacion_hasta) {
        const endDate = new Date(filtersToApply.fecha_publicacion_hasta);
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día
        filtered = filtered.filter(
          (item) => new Date(item.fecha_publicacion) <= endDate
        );
      }

      // Filtro por estado
      if (filtersToApply.estado && filtersToApply.estado !== 'todos') {
        filtered = filtered.filter((item) => item.estado === filtersToApply.estado);
      }

      // Filtro por rol (simular restricción de permisos)
      if (filtersToApply.rol_id) {
        // En un escenario real, esto vendría del backend
        // Por ahora solo filtramos los que tienen ese rol en roles_acceso
        const roleNames: Record<number, string> = {
          1: 'Administrador',
          2: 'Coordinador',
          3: 'Auditor',
          4: 'Docente',
          5: 'Estudiante'
        };
        const roleName = roleNames[filtersToApply.rol_id];
        if (roleName) {
          filtered = filtered.filter((item) =>
            item.roles_acceso.includes(roleName)
          );
        }
      }

      setFilteredResults(filtered);
      setLoading(false);

      // Mostrar mensaje con cantidad de resultados
      if (filtered.length === 0) {
        showToast({
          type: 'info',
          title: 'No se encontraron evidencias con los filtros aplicados'
        });
      } else {
        showToast({
          type: 'success',
          title: `Se encontraron ${filtered.length} evidencia(s)`
        });
      }
    }, 800);
  }, [showToast]);

  // Exportar resultados
  const handleExport = (format: ExportFormat) => {
    setLoading(true);

    // Simular exportación
    setTimeout(() => {
      setLoading(false);
      
      const fileName = `evidencias_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

      showToast({
        type: 'success',
        title: `Archivo ${fileName} generado exitosamente. Descarga iniciada.`
      });

      // En producción, aquí se generaría y descargaría el archivo real
      console.log(`Exportando ${displayedResults.length} evidencias a ${format}`);
    }, 1500);
  };

  // Ver detalles de evidencia
  const handleViewDetails = (evidenceId: number) => {
    showToast({
      type: 'info',
      title: `Mostrando detalles de evidencia #${evidenceId} (funcionalidad pendiente)`
    });
  };

  const moduleInfo = getModuleInfo('evidence_search');

  // Opciones del menú de exportación
  const exportOptions: DropdownOption[] = [
    {
      id: 'pdf',
      label: 'Exportar a PDF',
      icon: <SystemIcons.modal.pdf className="w-4 h-4" />,
      onClick: () => handleExport('pdf'),
      disabled: displayedResults.length === 0
    },
    {
      id: 'excel',
      label: 'Exportar a Excel',
      icon: <SystemIcons.modal.excel className="w-4 h-4" />,
      onClick: () => handleExport('excel'),
      disabled: displayedResults.length === 0
    }
  ];

  return (
    <ScreenContainer
      title={moduleInfo.title}
      description={moduleInfo.description}
      variant="full-width"
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
    >
      {/* Header con botones de acción */}
      <div className="mb-6 flex justify-end items-center gap-3">
        <DropdownButton
          label="Exportar"
          icon={<SystemIcons.actions.export className="w-4 h-4" />}
          variant="outline"
          options={exportOptions}
          disabled={loading || displayedResults.length === 0}
          tooltip="Exportar resultados de búsqueda"
        />
        
        <Tooltip>
          <TooltipTrigger>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={
                `p-2 rounded-lg border transition-colors
                border-gris-una/5 bg-gris-una/10
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
    </ScreenContainer>
  );
};

export default EvidenceSearchPage;
