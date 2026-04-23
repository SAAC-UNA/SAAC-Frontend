import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/Constants/ROUTES";
import {
  Button,
  Card,
  LoadingSpinner,
  PageHeader,
  ScreenContainer,
  StatusBadge,
} from "@/Components/Ui/Index";
import { improvementCommitmentService } from "@/Services/ImprovementCommitmentService";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import type { CompromisoMejora } from "@/Types/ImprovementCommitmentTypes";

const formatDate = (value?: string) => {
  if (!value) {
    return "Sin fecha";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
};

const getStatusBadge = (estado?: string, isOverdue?: boolean) => {
  if (isOverdue) {
    return { label: "Vencido", colorClasses: "bg-rojo-una-2 text-blanco-una" };
  }

  switch (estado) {
    case "Completado":
      return { label: "Completado", colorClasses: "bg-verde text-blanco-una" };
    case "En Progreso":
      return {
        label: "En progreso",
        colorClasses: "bg-azul-una text-blanco-una",
      };
    case "Vencido":
      return {
        label: "Vencido",
        colorClasses: "bg-rojo-una-2 text-blanco-una",
      };
    default:
      return {
        label: estado || "Pendiente",
        colorClasses: "bg-gris-una text-blanco-una",
      };
  }
};

const CompromisosList: React.FC = () => {
  const navigate = useNavigate();
  const moduleInfo = getModuleInfo("improvement_commitments_list");
  const [compromisos, setCompromisos] = useState<CompromisoMejora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCompromisos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await improvementCommitmentService.listarCompromisos({
          per_page: 50,
        });
        if (isMounted) {
          setCompromisos(response.data || []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError("No fue posible cargar los compromisos de mejora.");
          setCompromisos([]);
        }
        console.error("Error al cargar compromisos:", fetchError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchCompromisos();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="cycle-only"
        headerExtra={
          <Button onClick={() => navigate(ROUTES.COMMITMENTS_NEW)}>
            Crear compromiso
          </Button>
        }
      />

      {loading ? (
        <div className="relative min-h-64 rounded-corner border border-gray-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <Card className="p-4">
          <p className="text-sm text-rojo-una-2">{error}</p>
        </Card>
      ) : compromisos.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-negro-una">
            No hay compromisos registrados
          </h2>
          <p className="text-sm text-gris-una">
            Use el botón Crear compromiso para registrar uno nuevo.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {compromisos.map((compromiso) => {
            const badge = getStatusBadge(
              compromiso.estado,
              compromiso.is_overdue,
            );

            return (
              <Card
                key={compromiso.compromiso_mejora_id}
                className="p-5 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-negro-una">
                      {compromiso.descripcion ||
                        `Compromiso ${compromiso.compromiso_mejora_id}`}
                    </h2>
                    <p className="mt-1 text-sm text-gris-una">
                      {formatDate(compromiso.fecha_inicio)} -{" "}
                      {formatDate(compromiso.fecha_fin)}
                    </p>
                  </div>
                  <StatusBadge
                    label={badge.label}
                    colorClasses={badge.colorClasses}
                    size="sm"
                  />
                </div>

                <div className="mt-4 grid gap-2 text-sm text-negro-una-2">
                  <p>
                    <span className="font-semibold">Proceso:</span>{" "}
                    {compromiso.process?.nombre || `#${compromiso.proceso_id}`}
                  </p>
                  <p>
                    <span className="font-semibold">Criterios:</span>{" "}
                    {compromiso.selecciones?.length ?? 0}
                  </p>
                  <p>
                    <span className="font-semibold">Evidencias asignadas:</span>{" "}
                    {compromiso.assignedEvidences?.length ?? 0}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(ROUTES.COMMITMENTS_DETAIL, {
                        state: { id: compromiso.compromiso_mejora_id },
                      })
                    }
                  >
                    Ver detalle
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(ROUTES.COMMITMENTS_NEW)}
                  >
                    Nuevo compromiso
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
};
export default CompromisosList;
