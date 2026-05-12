import type { Notification, TipoEvento } from "@/Types/NotificationTypes";

export interface NotificationCopyModel {
  summary: string;
  evaluatorComment: string | null;
  deadlineText: string | null;
  isReviewCorrectionMessage: boolean;
}

const REVIEW_CORRECTION_EVENTS = new Set<TipoEvento>([
  "rechazo_evidencia",
  "rechazo_elemento",
]);

const IMPORTANT_EVENT_TYPES = new Set<string>([
  "asignacion_evidencia",
  "asignacion_elemento",
  "vencimiento_plazo",
  "devolucion_observacion",
  "solicitud_ampliacion",
  "rechazo_criterio",
  "rechazo_evidencia",
  "rechazo_elemento",
  "publicacion_informe",
]);

const OBSERVATION_REGEX =
  /Observaci[oó]n del evaluador:\s*(.*?)(?=Nueva fecha l[ií]mite:|Por favor revisa y reenv[ií]a\.?$|$)/i;
const DEADLINE_REGEX =
  /Nueva fecha l[ií]mite:\s*(.*?)(?=Por favor revisa y reenv[ií]a\.?$|$)/i;
const PROCESS_ID_REGEX = /\s*para el proceso\s*#?\d+\.?/gi;
const RESEND_REMINDER_REGEX = /\s*Por favor revisa y reenv[ií]a\.?/gi;

const normalizeSpaces = (value: string): string => value.replace(/\s+/g, " ").trim();

const getRegexCapture = (message: string, expression: RegExp): string | null => {
  const match = message.match(expression);
  if (!match?.[1]) {
    return null;
  }

  const cleaned = normalizeSpaces(match[1]);
  return cleaned.length > 0 ? cleaned : null;
};

const cleanSummaryText = (message: string): string =>
  normalizeSpaces(
    message
      .replace(OBSERVATION_REGEX, "")
      .replace(DEADLINE_REGEX, "")
      .replace(PROCESS_ID_REGEX, "")
      .replace(RESEND_REMINDER_REGEX, ""),
  );

const getSummaryFromTitle = (title: string): string => {
  const titleHead = title.split("—")[0] ?? title;
  return normalizeSpaces(titleHead);
};

export const buildNotificationCopy = (
  notification: Notification,
): NotificationCopyModel => {
  const rawMessage = normalizeSpaces(notification.mensaje ?? "");
  if (!rawMessage) {
    return {
      summary: normalizeSpaces(notification.titulo),
      evaluatorComment: null,
      deadlineText: null,
      isReviewCorrectionMessage: false,
    };
  }

  const evaluatorComment = getRegexCapture(rawMessage, OBSERVATION_REGEX);
  const deadlineText = getRegexCapture(rawMessage, DEADLINE_REGEX);
  const cleanedSummary = cleanSummaryText(rawMessage);

  const isReviewCorrectionMessage = REVIEW_CORRECTION_EVENTS.has(
    notification.tipo_evento,
  );
  const summary = isReviewCorrectionMessage
    ? getSummaryFromTitle(notification.titulo) || cleanedSummary || rawMessage
    : cleanedSummary || rawMessage;

  return {
    summary,
    evaluatorComment,
    deadlineText,
    isReviewCorrectionMessage,
  };
};

export const isNotificationImportant = (notification: Notification): boolean =>
  notification.es_critica === true
  || notification.canal === "ambos"
  || IMPORTANT_EVENT_TYPES.has(String(notification.tipo_evento));
