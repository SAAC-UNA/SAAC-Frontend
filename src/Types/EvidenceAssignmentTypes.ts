/**
 * Tipos para asignaciones de evidencias (HU-029)
 * Corresponde al modelo EvidenceAssignment del backend
 */

// Estados posibles de una asignación
export type AssignmentStatus = 'pendiente' | 'en_progreso' | 'completado' | 'vencido';

// Modelo completo de asignación de evidencia
export interface EvidenceAssignment {
  evidencia_asignacion_id: number;
  proceso_id: number;
  evidencia_id: number;
  usuario_id: number;
  estado: AssignmentStatus;
  fecha_asignacion: string; // ISO 8601
  fecha_limite: string | null; // ISO 8601
  comentario: string | null;
  created_at: string;
  updated_at: string;
  
  // HU-016: Indica si tiene una solicitud de ampliación pendiente
  has_pending_extension_request?: boolean;
  
  // Relaciones opcionales (cuando están cargadas con eager loading)
  proceso?: {
    proceso_id: number;
    ciclo_acreditacion_id: number;
  };
  
  evidencia?: {
    evidencia_id: number;
    criterio_id: number;
    estado: string; // PascalCase — valor del enum EVIDENCIA.estado
    descripcion: string;
    nomenclatura: string;
    activo: number;
    created_at: string;
    updated_at: string;
    criterion?: {
      id: number;
      componente_id: number;
      comentario_id: number;
      descripcion: string;
      nomenclatura: string;
      activo: number;
    };
    comentarios?: Array<{
      id: number;
      texto: string;
      usuario_id: number;
      autor: string | null;
      fecha: string;
    }>;
  };
  
  usuario?: {
    usuario_id: number;
    nombre: string;
    email: string;
  };
}

// Respuesta de la API para lista de asignaciones
export interface EvidenceAssignmentListResponse {
  data: EvidenceAssignment[];
}

// Respuesta de la API para una asignación individual
export interface EvidenceAssignmentResponse {
  data: EvidenceAssignment;
}

// Parámetros para actualizar una asignación
export interface UpdateAssignmentParams {
  estado?: AssignmentStatus;
  fecha_limite?: string | null;
}

// Filtros para la lista de asignaciones (uso en frontend)
export interface AssignmentFilters {
  estado?: AssignmentStatus | 'todos';
  search?: string; // Búsqueda por nombre o descripción de evidencia
  sortBy?: 'fecha_asignacion' | 'fecha_limite' | 'nombre';
  sortDirection?: 'asc' | 'desc';
}

// Estado local para gestión de asignaciones en componentes
export interface AssignmentState {
  assignments: EvidenceAssignment[];
  loading: boolean;
  error: string | null;
  filters: AssignmentFilters;
}

// Información de badge de estado
export interface StatusBadgeInfo {
  label: string;
  color: string;
  bgColor: string;
  icon?: React.ReactNode;
}

/**
 * Helpers para trabajar con estados
 */

/**
 * Calcula si una asignación está próxima a vencer (menos de 7 días)
 */
export function isNearDeadline(fechaLimite: string | null): boolean {
  if (!fechaLimite) return false;
  
  const deadline = new Date(fechaLimite);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7 && diffDays > 0;
}

/**
 * Calcula los días restantes hasta la fecha límite
 */
export function getDaysUntilDeadline(fechaLimite: string | null): number | null {
  if (!fechaLimite) return null;
  
  const deadline = new Date(fechaLimite);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Formatea la fecha límite de manera legible
 */
export function formatDeadline(fechaLimite: string | null): string {
  if (!fechaLimite) return 'Sin fecha límite';
  
  const deadline = new Date(fechaLimite);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Vence hoy';
  } else if (diffDays === 1) {
    return 'Vence mañana';
  } else if (diffDays <= 7) {
    return `Vence en ${diffDays} días`;
  } else {
    return new Intl.DateTimeFormat('es-CR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(deadline);
  }
}

/**
 * Formatea una fecha ISO a formato legible
 */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(isoDate));
}

/**
 * Verifica si una asignación está vencida
 */
export function isOverdue(assignment: EvidenceAssignment): boolean {
  if (!assignment.fecha_limite) return false;
  return new Date(assignment.fecha_limite) < new Date() && assignment.estado !== 'completado';
}

/**
 * Filtra y ordena asignaciones según criterios
 */
export function filterAndSortAssignments(
  assignments: EvidenceAssignment[],
  filters: AssignmentFilters
): EvidenceAssignment[] {
  let filtered = [...assignments];
  
  // Filtrar por estado
  if (filters.estado && filters.estado !== 'todos') {
    filtered = filtered.filter(a => a.estado === filters.estado);
  }
  
  // Filtrar por búsqueda
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();

    // Mapa de etiquetas legibles de estado para búsqueda
    const estadoLabels: Record<string, string> = {
      pendiente: 'pendiente',
      en_progreso: 'en progreso',
      completado: 'completado',
      vencido: 'vencido',
    };

    filtered = filtered.filter(a => {
      // Estado efectivo (considera vencido dinámicamente)
      const estadoEfectivo = isOverdue(a) ? 'vencido' : a.estado;
      const estadoLabel = estadoLabels[estadoEfectivo] || estadoEfectivo;

      return (
        a.evidencia?.nomenclatura?.toLowerCase().includes(searchTerm) ||
        a.evidencia?.descripcion?.toLowerCase().includes(searchTerm) ||
        a.evidencia?.criterion?.nomenclatura?.toLowerCase().includes(searchTerm) ||
        a.evidencia?.criterion?.descripcion?.toLowerCase().includes(searchTerm) ||
        estadoLabel.includes(searchTerm) ||
        estadoEfectivo.includes(searchTerm) ||
        (a.fecha_asignacion && formatDate(a.fecha_asignacion).includes(searchTerm)) ||
        (a.fecha_limite && formatDate(a.fecha_limite).includes(searchTerm))
      );
    });
  }
  
  // Ordenar
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (filters.sortBy) {
        case 'fecha_asignacion':
          valueA = new Date(a.fecha_asignacion).getTime();
          valueB = new Date(b.fecha_asignacion).getTime();
          break;
        case 'fecha_limite':
          valueA = a.fecha_limite ? new Date(a.fecha_limite).getTime() : Infinity;
          valueB = b.fecha_limite ? new Date(b.fecha_limite).getTime() : Infinity;
          break;
        case 'nombre':
          valueA = a.evidencia?.nomenclatura || '';
          valueB = b.evidencia?.nomenclatura || '';
          break;
        default:
          return 0;
      }
      
      const direction = filters.sortDirection === 'asc' ? 1 : -1;
      return valueA > valueB ? direction : valueA < valueB ? -direction : 0;
    });
  }
  
  return filtered;
}
