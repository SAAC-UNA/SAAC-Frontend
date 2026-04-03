/**
 * AuditLogPage - Página principal de la Bitácora del Sistema (HU-005)
 * 
 * Funcionalidades:
 * - Consulta de registros con filtros avanzados
 * - Visualización en tabla paginada
 * - Ver detalle completo de cada registro
 * - Exportación a PDF/Excel (preparado para backend)
 * - Acceso restringido solo a Superusuario
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader, ScreenContainer, Tooltip, TooltipTrigger } from '@/Components/Ui/Index';
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { DropdownButton } from '@/Components/Ui/Buttons/DropdownButton';
import { Button } from '@/Components/Ui/Buttons/Button';
import type { DropdownOption } from '@/Components/Ui/Buttons/DropdownButton';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { AuditLogFilters } from './Components/AuditLogFilters';
import { AuditLogTable } from './Components/AuditLogTable';
import { AuditLogDetailModal } from './Components/AuditLogDetailModal';
import AuditLogService from '@/Services/AuditLogService';
import type { AuditLog, AuditLogFilters as Filters, ExportFormat } from '@/Types/AuditLogTypes';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { TooltipContent } from '@/Components/Ui/Index';
import { COLLAPSIBLE_PANEL, COLLAPSIBLE_PANEL_INNER } from '@/Constants/Animations';

const AuditLogPage: React.FC = () => {
  // Hook de toast
  const { showToast } = useToast();

  // Estado de los registros y paginación
  const [logsState, setLogsState] = useState<{ logs: AuditLog[]; isLoading: boolean; error: string | null; currentPage: number; totalPages: number }>({ logs: [], isLoading: false, error: null, currentPage: 1, totalPages: 1 });
  const logs = logsState.logs;
  const isLoading = logsState.isLoading;
  const error = logsState.error;
  const currentPage = logsState.currentPage;
  const totalPages = logsState.totalPages;
  const perPage = TABLE_PAGE_SIZE.standard;

  // Estado de filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState<Filters>({});
  
  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const appliedFiltersRef = useRef(appliedFilters);
  const isInitialMount = useRef(true);

  // Estado del panel de filtros
  const [showFilters, setShowFilters] = useState(false);

  // Estado del modal de detalle
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    log: AuditLog | null;
  }>({
    isOpen: false,
    log: null,
  });

  /**
   * Cargar registros de bitácora
   */
  const loadAuditLogs = useCallback(async (filters: Filters = {}, page: number = 1) => {
    setLogsState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await AuditLogService.getAuditLogs({
        ...filters,
        page,
        per_page: perPage,
      });

      setLogsState(prev => ({ ...prev, logs: response.data, isLoading: false, currentPage: response.current_page, totalPages: response.last_page }));
    } catch (err: any) {
      console.error('Error cargando registros de bitácora:', err);
      setLogsState(prev => ({ ...prev, isLoading: false, error: err.message || 'Error al cargar los registros de bitácora', logs: [] }));
    }
  }, [perPage]);

  /**
   * Cargar registros al montar el componente
   */
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  /**
   * Sincronizar la ref de filtros para usarla dentro del debounce de búsqueda
   */
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  /**
   * Buscar en el backend cuando cambia el término de búsqueda (debounced 300 ms).
   * Se omite la primera ejecución al montar (ya la maneja el useEffect inicial).
   */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      loadAuditLogs({ ...appliedFiltersRef.current, search: searchTerm || undefined }, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, loadAuditLogs]);

  /**
   * Aplicar filtros
   */
  const handleApplyFilters = useCallback((filters: Filters) => {
    setAppliedFilters(filters);
    loadAuditLogs({ ...filters, search: searchTerm || undefined }, 1);
  }, [loadAuditLogs, searchTerm]);

  /**
   * Manejar cambio en el buscador
   */
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  /**
   * Cambiar página
   */
  const handlePageChange = useCallback((page: number) => {
    loadAuditLogs({ ...appliedFilters, search: searchTerm || undefined }, page);
  }, [appliedFilters, searchTerm, loadAuditLogs]);

  /**
   * Ver detalle de un registro
   */
  const handleViewDetail = useCallback((log: AuditLog) => {
    setDetailModal({
      isOpen: true,
      log,
    });
  }, []);

  /**
   * Cerrar modal de detalle
   */
  const handleCloseDetailModal = useCallback(() => {
    setDetailModal({
      isOpen: false,
      log: null,
    });
  }, []);

  /**
   * Exportar registros (requiere rango de fechas obligatorio)
   */
  const handleExport = useCallback(async (format: ExportFormat) => {
    // Validar que se hayan seleccionado las fechas obligatorias
    if (!appliedFilters.fecha_desde || !appliedFilters.fecha_hasta) {
      showToast({
        type: 'error',
        title: 'Fechas requeridas',
        message: 'Debe seleccionar un rango de fechas (desde - hasta) para exportar la bitácora',
      });
      return;
    }

    try {
      showToast({
        type: 'info',
        title: 'Exportando...',
        message: `Generando archivo ${format.toUpperCase()}...`,
      });

      const blob = await AuditLogService.exportAuditLogs(
        format,
        appliedFilters.fecha_desde,
        appliedFilters.fecha_hasta,
        {
          usuario_id: appliedFilters.usuario_id,
          tipo_accion_id: appliedFilters.tipo_accion_id,
          tipo_accion: appliedFilters.tipo_accion,
          modulo: appliedFilters.modulo,
        }
      );
      
      AuditLogService.downloadExportedFile(blob, format);

      showToast({
        type: 'success',
        title: 'Exportación exitosa',
        message: `Bitácora exportada exitosamente a ${format.toUpperCase()}`,
      });
    } catch (err: any) {
      console.error('Error exportando bitácora:', err);
      showToast({
        type: 'error',
        title: 'Error al exportar',
        message: err.message || 'Error al exportar la bitácora',
      });
    }
  }, [appliedFilters, showToast]);

  const moduleInfo = getModuleInfo('auditlog');

  // Opciones del menú de exportación
  const exportOptions: DropdownOption[] = [
    {
      id: 'pdf',
      label: <span className={TYPOGRAPHY.button}>Exportar a PDF</span>,
      icon: <SystemIcons.modal.pdf className={`text-negro-una-2 ${ICON_SIZES.md}`} />,
      onClick: () => handleExport('pdf'),
      disabled: !appliedFilters.fecha_desde || !appliedFilters.fecha_hasta || logs.length === 0
    },
    {
      id: 'excel',
      label: <span className={TYPOGRAPHY.button}>Exportar a Excel</span>,
      icon: <SystemIcons.modal.excel className={`text-negro-una-2 ${ICON_SIZES.md}`} />,
      onClick: () => handleExport('excel'),
      disabled: !appliedFilters.fecha_desde || !appliedFilters.fecha_hasta || logs.length === 0
    }
  ];

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-64">
              <SearchInput
                placeholder="Buscar por usuario, módulo, acción, detalle..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
              <DropdownButton
                label="Exportar"
                icon={<SystemIcons.actions.export className="w-4 h-4" />}
                variant="outline"
                options={exportOptions}
                disabled={isLoading || logs.length === 0}
                tooltip={
                  !appliedFilters.fecha_desde || !appliedFilters.fecha_hasta
                    ? 'Debe seleccionar un rango de fechas para exportar'
                    : 'Exportar registros de bitácora'
                }
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
        {/* Panel de filtros colapsable — se pasa undefined cuando no hay filtros para no generar mt-4 en el PageHeader */}
        {showFilters && (
          <AnimatePresence>
            <motion.div
              key="audit-filters"
              className="w-full overflow-hidden"
              variants={COLLAPSIBLE_PANEL}
              initial="collapsed"
              animate="open"
              exit="collapsed"
            >
              <div className={COLLAPSIBLE_PANEL_INNER}>
                <AuditLogFilters
                  onApplyFilters={handleApplyFilters}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </PageHeader>

      {/* Alerta de error */}
      {error && (
        <div className="mb-6">
          <BackendErrorAlert
            error={error}
          />
        </div>
      )}

      {/* Tabla de registros */}
      <AuditLogTable
        logs={logs}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
      />

      {/* Modal de detalle */}
      <AuditLogDetailModal
        isOpen={detailModal.isOpen}
        onClose={handleCloseDetailModal}
        log={detailModal.log}
      />
    </ScreenContainer>
  );
};

export default AuditLogPage;
