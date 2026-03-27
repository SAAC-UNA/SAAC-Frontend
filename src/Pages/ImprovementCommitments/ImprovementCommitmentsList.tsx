/**
 * CompromisosList - Página de listado de compromisos de mejora
 * Muestra todos los compromisos con filtros y acciones
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenContainer } from "@/Components/Ui/Layout/ScreenContainer";
import { Button, LoadingSpinner, PageHeader } from "@/Components/Ui/Index";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { improvementCommitmentService } from "@/Services/ImprovementCommitmentService";
import type { CompromisoMejora } from "@/Types/ImprovementCommitmentTypes";
import { DataTable } from "@/components/index";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { ButtonWithTooltip } from "@/Components/Ui/Buttons/ButtonWithTooltip";
import { TABLE_ACTION_BUTTON } from "@/Constants/Components";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { truncateText } from "@/Utils";
import { useFirstColumnConfig } from "@/Hooks/UseFirstColumnConfig";
import { ImprovementCommitmentDetailModal } from "./Components/ImprovementCommitmentDetailModal";

export const ImprovementCommitmentsList: React.FC = () => {
  const moduleInfo = getModuleInfo("improvement_commitments");
  const navigate = useNavigate();

  const [commitments, setCommitments] = useState<CompromisoMejora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCompromisos();
  }, []);

  const fetchCompromisos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await improvementCommitmentService.listarCompromisos({
        per_page: 50,
      });

      setCommitments(response.data || []);
    } catch (error: any) {
      console.error("Error al cargar compromisos:", error);

      if (error.response) {
        if (error.response.status === 500) {
          setError(
            "Error en el servidor. Por favor, contacte al administrador.",
          );
        } else if (error.response.status === 403) {
          setError("No tiene permisos para ver los compromisos de mejora.");
        } else {
          setError(
            `Error ${error.response.status}: No se pudieron cargar los compromisos`,
          );
        }
      } else {
        setError(
          "Error de conexión. Verifique que el servidor esté funcionando.",
        );
      }
      setCommitments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommitments = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return commitments;

    return commitments.filter((compromiso) => {
      const searchableText = [
        compromiso.descripcion || "",
        compromiso.fecha_inicio || "",
        compromiso.fecha_fin || "",
        compromiso.is_overdue ? "vencido" : "activo",
        String(compromiso.selecciones?.length || 0),
        String(compromiso.assignedEvidences?.length || 0),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [commitments, searchQuery]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const totalPages = Math.ceil(filteredCommitments.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCommitments.slice(start, end);
  }, [filteredCommitments, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetail = (id: number) => {
    setDetailId(id);
  };

  const firstColumn = useFirstColumnConfig();

  // Configuración de columnas de la tabla
  const columns: DataTableColumn<CompromisoMejora>[] = [
    {
      key: "descripcion",
      header: "Descripción",
      align: "left",
      width: firstColumn.width,
      render: (_, compromiso) => (
        <p
          className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell} ${
            !compromiso.descripcion ? "text-center" : "text-left"
          }`}
          title={compromiso.descripcion || "Sin descripción"}
        >
          {truncateText(compromiso.descripcion, firstColumn.maxLength) ||
            "Sin descripción"}
        </p>
      ),
    },
    {
      key: "fecha_inicio",
      header: "Fecha Inicio",
      align: "center",
      render: (_, compromiso) => (
        <p
          className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
        >
          {formatDate(compromiso.fecha_inicio)}
        </p>
      ),
    },
    {
      key: "fecha_fin",
      header: "Fecha Fin",
      align: "center",
      render: (_, compromiso) => (
        <p
          className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
        >
          {formatDate(compromiso.fecha_fin)}
        </p>
      ),
    },
    {
      key: "criterios",
      header: "Criterios",
      align: "center",
      render: (_, compromiso) => (
        <p
          className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
        >
          {compromiso.selecciones?.length || 0}
        </p>
      ),
    },
    {
      key: "asignaciones",
      header: "Asignaciones",
      align: "center",
      render: (_, compromiso) => (
        <p
          className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
        >
          {compromiso.assignedEvidences?.length || 0}
        </p>
      ),
    },
    {
      key: "status",
      header: "Estado",
      align: "center",
      render: (_, compromiso) => (
        <div className="flex justify-center">
          <StatusBadge
            label={compromiso.is_overdue ? "Vencido" : "Activo"}
            colorClasses={
              compromiso.is_overdue
                ? "text-error-dark bg-error-ring"
                : "text-verde-dark bg-verde-ring"
            }
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      render: (_, compromiso) => (
        <div className="flex items-center justify-center gap-2 pr-2">
          <ButtonWithTooltip
            variant="tableView"
            size="sm"
            tooltip="Ver detalles"
            onClick={() => handleViewDetail(compromiso.compromiso_mejora_id)}
            className={TABLE_ACTION_BUTTON.button}
          >
            <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
          </ButtonWithTooltip>
        </div>
      ),
    },
  ];

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
            <SearchInput
              placeholder="Buscar compromisos..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full sm:w-72"
            />
            <Button
              onClick={() => navigate("/compromisos/crear")}
              variant="secondary"
            >
              Crear
            </Button>
          </div>
        }
      />
      <div className="space-y-6">
        {/* Stats eliminadas de aquí */}

        {/* Loading */}
        {loading ? (
          <div className="relative py-12 min-h-[400px]">
            <LoadingSpinner variant="loader" />
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md">
              <SystemIcons.interface.alert
                size="xl"
                className="mx-auto text-red-400 mb-4"
              />
              <h3 className="text-base font-medium text-negro-una mb-2 mt-4">
                {error}
              </h3>
              <p className="text-sm text-gris-una mb-4">
                El servidor puede no estar funcionando correctamente
              </p>
              <Button onClick={fetchCompromisos} variant="secondary">
                Reintentar
              </Button>
            </div>
          </div>
        ) : filteredCommitments.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <SystemIcons.modal.document
                size="xl"
                className="mx-auto text-gray-400 mb-4"
              />
              <h3 className="text-base font-medium text-negro-una mb-2">
                {"No hay compromisos registrados"}
              </h3>
              <p className="text-sm text-gris-una">
                {
                  'Utilice el botón "Crear" para registrar un nuevo compromiso de mejora'
                }
              </p>
            </div>
          </div>
        ) : (
          /* Tabla de Compromisos */
          <DataTable<CompromisoMejora>
            columns={columns}
            data={paginatedData}
            title=""
            searchable={false}
            pagination={
              totalPages > 1
                ? {
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage,
                  }
                : undefined
            }
            loading={loading}
            emptyMessage="No hay compromisos registrados. Utilice el botón 'Crear' para registrar un nuevo compromiso de mejora"
          />
        )}
      </div>

      <ImprovementCommitmentDetailModal
        id={detailId}
        isOpen={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </ScreenContainer>
  );
};
