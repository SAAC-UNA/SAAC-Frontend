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

import React, { useState, useEffect, useCallback } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ButtonWithTooltip } from '@/Components/Ui/ButtonWithTooltip';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { AuditLogFilters } from './Components/AuditLogFilters';
import { AuditLogTable } from './Components/AuditLogTable';
import { AuditLogDetailModal } from './Components/AuditLogDetailModal';
import AuditLogService from '@/Services/AuditLogService';
import type { AuditLog, AuditLogFilters as Filters, ExportFormat } from '@/Types/AuditLogTypes';
import { useToast } from '@/Context/ToastContext';

const AuditLogPage: React.FC = () => {
  // Hook de toast
  const { showToast } = useToast();

  // Estado de los registros
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  // Estado de filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState<Filters>({});
  
  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);

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
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuditLogService.getAuditLogs({
        ...filters,
        page,
        per_page: perPage,
      });

      setLogs(response.data);
      setFilteredLogs(response.data);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
    } catch (err: any) {
      console.error('Error cargando registros de bitácora:', err);
      setError(err.message || 'Error al cargar los registros de bitácora');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [perPage]);

  /**
   * Cargar registros al montar el componente
   */
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  /**
   * Filtrar logs localmente según el término de búsqueda
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = logs.filter(log => {
      const usuario = log.usuario?.nombre?.toLowerCase() || '';
      const email = log.usuario?.email?.toLowerCase() || '';
      const modulo = log.modulo?.toLowerCase() || '';
      const accion = log.tipo_accion?.descripcion?.toLowerCase() || '';
      const detalle = log.detalle?.toLowerCase() || '';
      const fecha = log.fecha_hora?.toLowerCase() || '';

      return (
        usuario.includes(term) ||
        email.includes(term) ||
        modulo.includes(term) ||
        accion.includes(term) ||
        detalle.includes(term) ||
        fecha.includes(term)
      );
    });

    setFilteredLogs(filtered);
  }, [logs, searchTerm]);

  /**
   * Aplicar filtros
   */
  const handleApplyFilters = useCallback((filters: Filters) => {
    setAppliedFilters(filters);
    loadAuditLogs(filters, 1);
  }, [loadAuditLogs]);

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
    loadAuditLogs(appliedFilters, page);
  }, [appliedFilters, loadAuditLogs]);

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

  return (
    <ScreenContainer
      title={moduleInfo.title}
      description={moduleInfo.description}
      variant="full-width"
      headerExtra={
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar por usuario, módulo, acción, detalle..."
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={isLoading}
          />
        </div>
      }
    >
      {/* Botones de exportación */}
      <div className="flex justify-end gap-3 mb-6">
        <ButtonWithTooltip
          variant="outline"
          onClick={() => handleExport('pdf')}
          disabled={isLoading || logs.length === 0}
          tooltip={
            !appliedFilters.fecha_desde || !appliedFilters.fecha_hasta
              ? 'Debe seleccionar un rango de fechas para exportar'
              : 'Exportar registros de bitácora a PDF'
          }
          className="flex items-center gap-2"
        >
          <SystemIcons.modal.pdf className="w-4 h-4" />
          Exportar PDF
        </ButtonWithTooltip>
        <ButtonWithTooltip
          variant="outline"
          onClick={() => handleExport('excel')}
          disabled={isLoading || logs.length === 0}
          tooltip={
            !appliedFilters.fecha_desde || !appliedFilters.fecha_hasta
              ? 'Debe seleccionar un rango de fechas para exportar'
              : 'Exportar registros de bitácora a Excel'
          }
          className="flex items-center gap-2"
        >
          <SystemIcons.modal.excel className="w-4 h-4" />
          Exportar Excel
        </ButtonWithTooltip>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="mb-6">
          <BackendErrorAlert
            error={error}
          />
        </div>
      )}

      {/* Componente de filtros */}
      <AuditLogFilters
        onApplyFilters={handleApplyFilters}
        isLoading={isLoading}
      />

      {/* Información de registros */}
      {!isLoading && !error && filteredLogs.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <SystemIcons.interface.informationCircle className="w-4 h-4" />
          <span>
            Mostrando {filteredLogs.length} registro(s) de la página {currentPage} de {totalPages}
            {searchTerm && ` (filtrados de ${logs.length} total)`}
          </span>
        </div>
      )}

      {/* Tabla de registros */}
      <AuditLogTable
        logs={filteredLogs}
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
