import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/Config/axios";
import { Button, Card, LoadingSpinner } from "@/Components/Ui/Index";
import { EmptyState } from "@/Components/Ui/Feedback/EmptyState";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { Grainient } from "@/Components/Ui/Backgrounds/Grainient";
import { cn } from "@/Utils/ClassNames";

type PublicItem = {
  archivo_id: number;
  nombre_original: string;
  tipo: "archivo" | "enlace";
  token_publico?: string | null;
  fecha_subida?: string | null;
  url?: string | null;
};

type PublicFolderResponse = {
  success: boolean;
  data: {
    contexto: {
      tipo: string;
      titulo: string;
      nomenclatura?: string | null;
      descripcion?: string | null;
    };
    items: PublicItem[];
  };
};

export default function PublicFolderPage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contexto, setContexto] = useState<
    PublicFolderResponse["data"]["contexto"] | null
  >(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFolder = async () => {
      if (!token) {
        setError("Token de acceso inválido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get<PublicFolderResponse>(
          `/p/${token}/carpeta`,
          {
            headers: {
              Accept: "application/json",
              "X-Skip-Session-Redirect": "true",
            },
          },
        );

        if (!response.data?.success) {
          throw new Error("No fue posible cargar la carpeta pública.");
        }

        const data = response.data;

        if (!cancelled) {
          setContexto(data.data.contexto);
          setItems(data.data.items || []);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Error inesperado al cargar la carpeta.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFolder();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const title = useMemo(() => {
    if (!contexto) {
      return "Carpeta pública";
    }

    return `Carpeta de ${contexto.titulo || contexto.tipo || "documentos"}`;
  }, [contexto]);

  const stats = useMemo(() => {
    const files = items.filter((item) => item.tipo !== "enlace").length;
    const links = items.filter((item) => item.tipo === "enlace").length;
    return {
      total: items.length,
      files,
      links,
    };
  }, [items]);

  const handleDownload = async (item: PublicItem) => {
    if (item.tipo === "enlace") {
      if (item.url) {
        window.open(item.url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (!item.token_publico) {
      setError("No se encontró el token público del archivo.");
      return;
    }

    setDownloadingId(item.archivo_id);
    setError(null);

    try {
      const response = await axiosInstance.get(`/p/${item.token_publico}`, {
        responseType: "blob",
        headers: {
          Accept: "application/octet-stream",
          "X-Skip-Session-Redirect": "true",
        },
      });

      const blob = new Blob([response.data], {
        type: (response.headers["content-type"] as string) || "application/octet-stream",
      });
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = item.nombre_original || "archivo";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setError("No fue posible descargar el archivo.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <Grainient
          color1="#f8f9fa"
          color2="#dfe9f5"
          color3="#fce9ea"
          timeSpeed={0.12}
          grainAmount={0.02}
          grainScale={2.8}
          grainAnimated={false}
          contrast={1.15}
          saturation={0.95}
          zoom={1.05}
        />
      </div>
      <div className="absolute inset-0 bg-white/70" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <Card className="mb-5 overflow-hidden border border-gris-light/40 shadow-xl">
          <div className="bg-gradient-to-r from-azul-una to-rojo-una p-0.5">
            <div className="bg-blanco-una px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-corner-md bg-blanco-una border border-gris-light/50 p-3 shadow-sm">
                    <img
                      src="/Images/IsotipoSAAC.svg"
                      alt="Logo SAAC"
                      className="h-12 w-auto sm:h-14 object-contain"
                    />
                  </div>
                  <div className="rounded-corner-md bg-blanco-una border border-gris-light/50 px-4 py-3 shadow-sm flex items-center gap-3 min-h-[72px]">
                    <img
                      src="/Images/SINAES.png"
                      alt="Logo institucional"
                      className="h-10 w-auto object-contain"
                    />
                    <div className="border-l border-gris-light pl-3">
                      <p className="text-[11px] tracking-wide uppercase text-gris-una-2 font-semibold">
                        Universidad Nacional
                      </p>
                      <p className="text-sm font-bold text-negro-una-2">
                        Sistema SAAC-UNA
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-verde-ring px-3 py-1 text-xs font-semibold text-verde-dark">
                    Acceso publico
                  </span>
                  {!!contexto?.tipo && (
                    <span className="inline-flex items-center rounded-full bg-azul-light px-3 py-1 text-xs font-semibold text-azul-una">
                      {contexto.tipo}
                    </span>
                  )}
                </div>
              </div>

              <h1 className="mt-5 text-2xl sm:text-3xl font-bold text-negro-una-2">
                {title}
              </h1>

              {!loading && !error && contexto && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="p-3 border border-gris-light/60 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gris-una-2 font-semibold">
                      Nomenclatura
                    </p>
                    <p className="mt-1 text-sm font-semibold text-negro-una-2 break-words">
                      {contexto.nomenclatura || "No disponible"}
                    </p>
                  </Card>
                  <Card className="p-3 border border-gris-light/60 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gris-una-2 font-semibold">
                      Total elementos
                    </p>
                    <p className="mt-1 text-sm font-semibold text-negro-una-2">
                      {stats.total}
                    </p>
                  </Card>
                  <Card className="p-3 border border-gris-light/60 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gris-una-2 font-semibold">
                      Archivos y enlaces
                    </p>
                    <p className="mt-1 text-sm font-semibold text-negro-una-2">
                      {stats.files} archivos · {stats.links} enlaces
                    </p>
                  </Card>
                </div>
              )}

              {!loading && !error && !!contexto?.descripcion && (
                <p className="mt-4 text-sm text-gris-una-3 leading-relaxed">
                  {contexto.descripcion}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="border border-gris-light/40 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-gris-light/50 px-5 py-4 bg-blanco-una-2/80">
            <div className="flex items-center gap-2">
              <SystemIcons.actions.list className="w-5 h-5 text-azul-una" />
              <h2 className="text-sm sm:text-base font-bold text-negro-una-2">
                Documentos disponibles
              </h2>
            </div>
            <span className="text-xs text-gris-una-2 font-semibold uppercase tracking-wide">
              {stats.total} registros
            </span>
          </div>

          <div className="relative min-h-[260px] p-4 sm:p-5">
            {loading && <LoadingSpinner variant="loader" />}

            {!loading && !!error && (
              <EmptyState
                variant="noPermission"
                title="No se pudo abrir la carpeta publica"
                description={error}
              />
            )}

            {!loading && !error && items.length === 0 && (
              <EmptyState
                variant="document"
                title="Sin archivos publicados"
                description="Esta carpeta publica no tiene archivos o enlaces disponibles en este momento."
              />
            )}

            {!loading && !error && items.length > 0 && (
              <ul className="space-y-3">
                {items.map((item) => {
                  const isDownloading = downloadingId === item.archivo_id;
                  const isLink = item.tipo === "enlace";

                  return (
                    <li key={item.archivo_id}>
                      <Card className="p-4 border border-gris-light/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  "mt-0.5 rounded-corner-md p-2",
                                  isLink
                                    ? "bg-azul-light/40"
                                    : "bg-verde-ring/50",
                                )}
                              >
                                {isLink ? (
                                  <SystemIcons.actions.linkIcon className="w-4 h-4 text-azul-una" />
                                ) : (
                                  <SystemIcons.modal.document className="w-4 h-4 text-verde-dark" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-negro-una-2 break-all">
                                  {item.nombre_original || "Sin nombre"}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gris-una-2">
                                  <span className="inline-flex items-center rounded-full bg-blanco-una-2 px-2 py-0.5 border border-gris-light/50">
                                    {isLink ? "Enlace" : "Archivo"}
                                  </span>
                                  <span>
                                    Subido: {item.fecha_subida || "Sin fecha"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="sm:pl-3">
                            <Button
                              variant={isLink ? "primary" : "outline"}
                              size="sm"
                              onClick={() => handleDownload(item)}
                              disabled={isDownloading}
                              leftIcon={
                                isLink ? (
                                  <SystemIcons.actions.linkIcon className="w-4 h-4" />
                                ) : (
                                  <SystemIcons.actions.download className="w-4 h-4" />
                                )
                              }
                            >
                              {isDownloading
                                ? "Abriendo..."
                                : isLink
                                  ? "Abrir enlace"
                                  : "Descargar"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
