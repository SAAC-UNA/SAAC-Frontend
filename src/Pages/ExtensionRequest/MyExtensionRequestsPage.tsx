/**
 * MyExtensionRequestsPage - Página para ver mis solicitudes de ampliación
 * HU-016 - Vista para usuarios normales
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { FilterButton, type FilterOption } from '@/Components/Ui/Buttons/FilterButton';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
import { useToast } from '@/Context/ToastContext';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { ExtensionRequestsTable } from './Components/ExtensionRequestsTable';
import { ExtensionRequestDetailsModal } from './Components/ExtensionRequestDetailsModal';
import type { 
  ExtensionRequest, 
  ExtensionRequestStatus 
} from '@/Types/ExtensionRequestTypes';

export const MyExtensionRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('extension_requests', 'my');
  
  const [pageState, setPageState] = useState<{ solicitudes: ExtensionRequest[]; loading: boolean; error: string | null }>({ solicitudes: [], loading: true, error: null });
  const solicitudes = pageState.solicitudes;
  const loading = pageState.loading;
  const error = pageState.error;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<{ filtroEstado: ExtensionRequestStatus | 'todos'; currentPage: number }>({ filtroEstado: 'todos', currentPage: 1 });
  const filtroEstado = filterState.filtroEstado;
  const currentPage = filterState.currentPage;

  // Estado para el modal de detalles
  const [selectedSolicitud, setSelectedSolicitud] = useState<ExtensionRequest | null>(null);

  // Opciones para el filtro de estado
  const estadoOptions: FilterOption<ExtensionRequestStatus | 'todos'>[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' }
  ];

  useEffect(() => {
    loadSolicitudes();
  }, [currentPage]);

  const loadSolicitudes = async () => {
    try {
      setPageState(prev => ({...prev, loading: true, error: null}));
      
      const filters = {
        page: currentPage,
        per_page: 15
      };

      const response = await extensionRequestService.getMyRequests(filters);
      setPageState(prev => ({...prev, solicitudes: response.data}));
    } catch (error: any) {
      const errorMessage = error.message || 'No se pudieron cargar las solicitudes';
      setPageState(prev => ({...prev, error: errorMessage}));
      showToast({
        type: 'error',
        title: 'Error al Cargar',
        message: errorMessage
      });
    } finally {
      setPageState(prev => ({...prev, loading: false}));
    }
  };

  // Handlers
  const handleViewDetails = useCallback((solicitud: ExtensionRequest) => {
    setSelectedSolicitud(solicitud);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedSolicitud(null);
  }, []);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
            <SearchInput
              placeholder="Buscar solicitudes..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full sm:w-72"
            />
            <FilterButton
              tooltipText="Filtrar por estado"
              options={estadoOptions}
              value={filtroEstado}
              onChange={(value) => {
                setFilterState({ filtroEstado: value, currentPage: 1 });
              }}
            />
          </div>
        }
      >
      </PageHeader>

      <ExtensionRequestsTable
        requests={solicitudes}
        isLoading={loading}
        error={error}
        searchQuery={searchQuery}
        filterEstado={filtroEstado}
        itemsPerPage={TABLE_PAGE_SIZE.standard}
        onRetry={loadSolicitudes}
        onViewDetails={handleViewDetails}
      />
      
      {/* Modal de detalles */}
      <ExtensionRequestDetailsModal
        isOpen={!!selectedSolicitud}
        onClose={handleCloseDetails}
        solicitud={selectedSolicitud}
      />
    </ScreenContainer>
  );
};
