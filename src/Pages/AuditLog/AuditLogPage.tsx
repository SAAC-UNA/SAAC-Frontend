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
import { PageHeader } from '@/Components/Ui/PageHeader';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ButtonWithTooltip } from '@/Components/Ui/ButtonWithTooltip';
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
   * Aplicar filtros
   */
  const handleApplyFilters = useCallback((filters: Filters) => {
    setAppliedFilters(filters);
    loadAuditLogs(filters, 1);
  }, [loadAuditLogs]);

  /**
   * Limpiar filtros
   */
  const handleClearFilters = useCallback(() => {
    setAppliedFilters({});
    loadAuditLogs({}, 1);
  }, [loadAuditLogs]);

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
   * Exportar registros (preparado para cuando backend lo implemente)
   */
  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      showToast({
        type: 'warning',
        title: 'Exportando...',
        message: `Exportando bitácora a ${format.toUpperCase()}...`,
      });

      const blob = await AuditLogService.exportAuditLogs(format, appliedFilters);
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

  return (
    <ScreenContainer>
      {/* Header de la página */}
      <PageHeader
        title="Bitácora del Sistema"
        subtitle="Consulta y monitoreo de todas las acciones realizadas en el sistema"
      />

      {/* Botones de exportación */}
      <div className="flex justify-end gap-3 mb-6">
        <ButtonWithTooltip
          variant="outline"
          onClick={() => handleExport('pdf')}
          disabled={isLoading || logs.length === 0}
          tooltip="⚠️ Funcionalidad pendiente de implementación en el backend"
          className="flex items-center gap-2"
        >
          <SystemIcons.modal.document className="w-4 h-4" />
          Exportar PDF
        </ButtonWithTooltip>
        <ButtonWithTooltip
          variant="outline"
          onClick={() => handleExport('excel')}
          disabled={isLoading || logs.length === 0}
          tooltip="⚠️ Funcionalidad pendiente de implementación en el backend"
          className="flex items-center gap-2"
        >
          <SystemIcons.repository.boxArchive className="w-4 h-4" />
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
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      {/* Información de registros */}
      {!isLoading && !error && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <SystemIcons.interface.informationCircle className="w-4 h-4" />
            <span>
              {logs.length > 0
                ? `Mostrando ${logs.length} registro(s) de la página ${currentPage} de ${totalPages}`
                : 'No se encontraron registros'}
            </span>
          </div>
          {Object.keys(appliedFilters).length > 0 && (
            <div className="flex items-center gap-2 text-sm text-primary-600">
              <SystemIcons.interface.search className="w-4 h-4" />
              <span>{Object.keys(appliedFilters).length} filtro(s) aplicado(s)</span>
            </div>
          )}
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

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <SystemIcons.interface.informationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Acerca de la Bitácora del Sistema
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los registros se muestran en orden cronológico descendente (más recientes primero)</li>
              <li>• Solo los usuarios con rol de <strong>Superusuario</strong> pueden acceder a esta sección</li>
              <li>• Los registros de la bitácora son <strong>inmutables</strong> y no pueden ser modificados ni eliminados</li>
              <li>• Use los filtros para buscar registros específicos por usuario, módulo, tipo de acción o fechas</li>
              <li>• Las funciones de exportación estarán disponibles cuando el backend las implemente</li>
            </ul>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default AuditLogPage;
