/**
 * MyExtensionRequestsPage - Página para ver mis solicitudes de ampliación
 * HU-016 - Vista para usuarios normales
 */

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader, ScreenContainer } from "@/Components/Ui/Index";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import {
  FilterButton,
  type FilterOption,
} from "@/Components/Ui/Buttons/FilterButton";
import { extensionRequestService } from "@/Services/ExtensionRequestService";
import { flexibleExtensionRequestService } from "@/Services/FlexibleExtensionRequestService";
import { useToast } from "@/Context/ToastContext";
import { getContextualInfo } from "@/Constants/ModuleInfo";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { ExtensionRequestsTable } from "../MyExtensionRequest/Components/ExtensionRequestsTable";
import { ExtensionRequestDetailsModal } from "../MyExtensionRequest/Components/ExtensionRequestDetailsModal";
import type {
  ExtensionRequest,
  ExtensionRequestStatus,
} from "@/Types/ExtensionRequestTypes";

export const MyExtensionRequestsPage: React.FC = () => {
  const { showToast } = useToast();

  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo("extension_requests", "my");

  const [pageState, setPageState] = useState<{
    solicitudes: ExtensionRequest[];
    loading: boolean;
    error: string | null;
  }>({ solicitudes: [], loading: true, error: null });
  const solicitudes = pageState.solicitudes;
  const loading = pageState.loading;
  const error = pageState.error;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<{
    filtroEstado: ExtensionRequestStatus | "todos";
  }>({ filtroEstado: "todos" });
  const filtroEstado = filterState.filtroEstado;

  // Estado para el modal de detalles
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<ExtensionRequest | null>(null);

  // Opciones para el filtro de estado
  const estadoOptions: FilterOption<ExtensionRequestStatus | "todos">[] = [
    { value: "todos", label: "Todos" },
    { value: "pendiente", label: "Pendiente" },
    { value: "aprobada", label: "Aprobada" },
    { value: "rechazada", label: "Rechazada" },
  ];

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    try {
      setPageState((prev) => ({ ...prev, loading: true, error: null }));

      const [tradRes, flexRes] = await Promise.allSettled([
        extensionRequestService.getMyRequests({ per_page: 100 }),
        flexibleExtensionRequestService.getMyRequests({ per_page: 100 }),
      ]);

      const trad = tradRes.status === "fulfilled" ? tradRes.value.data : [];
      const flex = flexRes.status === "fulfilled" ? flexRes.value.data : [];

      const errorMsg =
        tradRes.status === "rejected" && flexRes.status === "rejected"
          ? "No se pudieron cargar las solicitudes"
          : null;

      setPageState({
        solicitudes: [...trad, ...flex],
        loading: false,
        error: errorMsg,
      });

      if (errorMsg) {
        showToast({
          type: "error",
          title: "Error al Cargar",
          message: errorMsg,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "No se pudieron cargar las solicitudes";
      setPageState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      showToast({
        type: "error",
        title: "Error al Cargar",
        message: errorMessage,
      });
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
        breadcrumbMode="none"
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
                setFilterState({ filtroEstado: value });
              }}
            />
          </div>
        }
      ></PageHeader>

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
