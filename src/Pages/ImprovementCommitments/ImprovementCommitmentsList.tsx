/**
 * CompromisosList - Página de listado de compromisos de mejora
 * Muestra todos los compromisos con filtros y acciones
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenContainer } from "@/Components/Ui/Layout/ScreenContainer";
import { Button, PageHeader } from "@/Components/Ui/Index";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { improvementCommitmentService } from "@/Services/ImprovementCommitmentService";
import type { CompromisoMejora } from "@/Types/ImprovementCommitmentTypes";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { ImprovementCommitmentDetailModal } from "./Components/ImprovementCommitmentDetailModal";
import { ImprovementCommitmentsTable } from "./Components/ImprovementCommitmentsTable";

export const ImprovementCommitmentsList: React.FC = () => {
  const moduleInfo = getModuleInfo("improvement_commitments");
  const navigate = useNavigate();

  const [commitments, setCommitments] = useState<CompromisoMejora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = TABLE_PAGE_SIZE.standard;

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
          setError("Error en el servidor. Por favor, contacte al administrador.");
        } else if (error.response.status === 403) {
          setError("No tiene permisos para ver los compromisos de mejora.");
        } else {
          setError(`Error ${error.response.status}: No se pudieron cargar los compromisos`);
        }
      } else {
        setError("Error de conexión. Verifique que el servidor esté funcionando.");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCommitments.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCommitments.slice(start, start + itemsPerPage);
  }, [filteredCommitments, currentPage, itemsPerPage]);

  const handleViewDetail = useCallback((id: number) => {
    setDetailId(id);
  }, []);

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

      {error ? (
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
      ) : (
        <ImprovementCommitmentsTable
          commitments={paginatedData}
          isLoading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onView={handleViewDetail}
        />
      )}

      <ImprovementCommitmentDetailModal
        id={detailId}
        isOpen={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </ScreenContainer>
  );
};
