import type { Notification } from "@/Types/NotificationTypes";

const ASSIGNMENT_EVENTS = new Set([
  "asignacion_evidencia",
  "asignacion_elemento",
  "devolucion_observacion",
  "rechazo_elemento",
]);

const LEGACY_ASSIGNMENT_LINK_PATTERNS: RegExp[] = [
  /\/evidencias\/\d+\/asignar$/,
  /\/elementos\/\d+\/aprobaciones$/,
];

const parsePositiveInt = (value: unknown): number | null => {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
};

const shouldRouteToAssignments = (notification: Notification): boolean => {
  if (ASSIGNMENT_EVENTS.has(notification.tipo_evento)) {
    return true;
  }

  const link = notification.enlace ?? "";
  return (
    link.startsWith("/Elements/") ||
    LEGACY_ASSIGNMENT_LINK_PATTERNS.some((pattern) => pattern.test(link))
  );
};

export const buildNotificationTargetRoute = (
  notification: Notification,
): string | null => {
  if (!shouldRouteToAssignments(notification)) {
    return notification.enlace;
  }

  const metadata = notification.metadatos ?? {};
  const processId = parsePositiveInt(
    metadata.proceso_id ?? metadata.process_id,
  );
  const cycleId = parsePositiveInt(
    metadata.ciclo_acreditacion_id ?? metadata.ciclo_id,
  );

  const query = new URLSearchParams();

  if (cycleId !== null) {
    query.set("ciclo_acreditacion_id", String(cycleId));
  }

  if (processId !== null) {
    query.set("proceso_id", String(processId));
  }

  const serialized = query.toString();
  return serialized
    ? `/mis-evidencias-asignadas?${serialized}`
    : "/mis-evidencias-asignadas";
};
