import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/Config/axios";

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
        type: response.headers["content-type"] || "application/octet-stream",
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
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Acceso público
          </span>

          <h1 className="mt-3 text-2xl font-bold text-slate-800">{title}</h1>

          {!loading && !error && contexto && (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>
                <strong>Nomenclatura:</strong>{" "}
                {contexto.nomenclatura || "No disponible"}
              </p>
              <p>
                <strong>Descripción:</strong>{" "}
                {contexto.descripcion || "No disponible"}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700">
            Archivos y enlaces disponibles
          </header>

          {loading && (
            <p className="px-6 py-5 text-slate-600">
              Cargando carpeta pública...
            </p>
          )}

          {!loading && error && (
            <p className="px-6 py-5 text-red-600">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="px-6 py-5 text-slate-600">
              No hay archivos públicos disponibles para esta carpeta.
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="divide-y divide-slate-200">
              {items.map((item) => (
                <li
                  key={item.archivo_id}
                  className="grid gap-3 px-6 py-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                >
                  <div>
                    <p className="font-medium text-slate-800 break-all">
                      {item.nombre_original || "Sin nombre"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Subido: {item.fecha_subida || "Sin fecha"}
                    </p>
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.tipo === "enlace" ? "Enlace" : "Archivo"}
                  </span>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item.archivo_id}
                  >
                    {downloadingId === item.archivo_id
                      ? "Abriendo..."
                      : item.tipo === "enlace"
                        ? "Abrir enlace"
                        : "Descargar"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
