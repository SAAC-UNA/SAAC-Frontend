/**
 * MyExtensionRequestsPage - Página para ver mis solicitudes de ampliación
 * HU-016 - Vista para usuarios normales
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { FilterButton, type FilterOption } from '@/Components/Ui/FilterButton';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
import { useToast } from '@/Context/ToastContext';
import { getContextualInfo } from '@/Constants/ModuleInfo';
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
  
  const [solicitudes, setSolicitudes] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<ExtensionRequestStatus | 'todos'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  
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
      setLoading(true);
      setError(null);
      
      const filters = {
        page: currentPage,
        per_page: 15
      };

      const response = await extensionRequestService.getMyRequests(filters);
      setSolicitudes(response.data);
    } catch (error: any) {
      const errorMessage = error.message || 'No se pudieron cargar las solicitudes';
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Error al Cargar',
        message: errorMessage
      });
    } finally {
      setLoading(false);
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
                setFiltroEstado(value);
                setCurrentPage(1);
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
        itemsPerPage={15}
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
