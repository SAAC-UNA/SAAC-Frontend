import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
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

const CompromisoDetalle: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = (location.state as { id?: number } | null)?.id;

  if (!id) {
    return <Navigate to={ROUTES.COMMITMENTS} replace />;
  }
  const [compromiso, setCompromiso] = useState<CompromisoMejora | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCompromiso = async () => {
      const commitmentId = Number(id);

      if (!Number.isFinite(commitmentId)) {
        setError("El identificador del compromiso no es válido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data =
          await improvementCommitmentService.obtenerCompromiso(commitmentId);
        if (isMounted) {
          setCompromiso(data);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError("No fue posible cargar el detalle del compromiso.");
          setCompromiso(null);
        }
        console.error("Error al cargar el compromiso:", fetchError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchCompromiso();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <ScreenContainer>
      <PageHeader
        title="Detalle del compromiso"
        description="Información general, selecciones y evidencias asociadas."
        breadcrumbMode="cycle-only"
        headerExtra={
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.COMMITMENTS)}
          >
            Volver al listado
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
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.COMMITMENTS)}
            >
              Volver al listado
            </Button>
          </div>
        </Card>
      ) : compromiso ? (
        <div className="grid gap-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-negro-una">
                  {compromiso.descripcion ||
                    `Compromiso ${compromiso.compromiso_mejora_id}`}
                </h2>
                <p className="mt-1 text-sm text-gris-una">
                  {formatDate(compromiso.fecha_inicio)} -{" "}
                  {formatDate(compromiso.fecha_fin)}
                </p>
              </div>
              <StatusBadge
                label={
                  getStatusBadge(compromiso.estado, compromiso.is_overdue).label
                }
                colorClasses={
                  getStatusBadge(compromiso.estado, compromiso.is_overdue)
                    .colorClasses
                }
                size="sm"
              />
            </div>

            <div className="mt-5 grid gap-3 text-sm text-negro-una-2 md:grid-cols-2">
              <p>
                <span className="font-semibold">ID:</span>{" "}
                {compromiso.compromiso_mejora_id}
              </p>
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
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-negro-una">
              Selecciones
            </h3>
            <div className="mt-4 grid gap-3">
              {(compromiso.selecciones || []).length === 0 ? (
                <p className="text-sm text-gris-una">
                  No hay selecciones registradas.
                </p>
              ) : (
                compromiso.selecciones?.map((seleccion, index) => (
                  <div
                    key={index}
                    className="rounded-corner border border-gray-200 p-4"
                  >
                    <p className="text-sm font-semibold text-negro-una">
                      {seleccion.tipo}
                    </p>
                    <p className="text-sm text-gris-una">
                      {seleccion.criterio?.nomenclatura ||
                        seleccion.componente?.nomenclatura ||
                        seleccion.dimension?.nomenclatura ||
                        "Selección sin detalle"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-negro-una">
              Evidencias asignadas
            </h3>
            <div className="mt-4 grid gap-3">
              {(compromiso.assignedEvidences || []).length === 0 ? (
                <p className="text-sm text-gris-una">
                  No hay evidencias asignadas.
                </p>
              ) : (
                compromiso.assignedEvidences?.map((asignacion) => (
                  <div
                    key={asignacion.evidencia_asignacion_id}
                    className="rounded-corner border border-gray-200 p-4"
                  >
                    <p className="text-sm font-semibold text-negro-una">
                      {asignacion.evidencia?.nomenclatura ||
                        `Evidencia #${asignacion.evidencia_id}`}
                    </p>
                    <p className="text-sm text-gris-una">
                      Estado: {asignacion.estado}
                    </p>
                    <p className="text-sm text-gris-una">
                      Fecha límite: {formatDate(asignacion.fecha_limite)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-4">
          <p className="text-sm text-gris-una">
            No se encontró el compromiso solicitado.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.COMMITMENTS)}
            >
              Volver al listado
            </Button>
          </div>
        </Card>
      )}
    </ScreenContainer>
  );
};
export default CompromisoDetalle;
