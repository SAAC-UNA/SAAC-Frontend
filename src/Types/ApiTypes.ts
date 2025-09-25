/**
 * Tipos relacionados con las APIs y respuestas del servidor
 */

// Respuesta estándar de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Estados de carga
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Filtros
export interface FilterParams {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  createdFrom?: string;
  createdTo?: string;
}