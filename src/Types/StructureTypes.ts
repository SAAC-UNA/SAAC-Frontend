/**
   Enumeración de tipos de elementos en la jerarquía del repositorio
   Representa los 9 niveles jerárquicos del sistema SAAC
 */
export const ElementType = {
  UNIVERSITY: 'university',
  CAMPUS: 'campus',
  FACULTY: 'faculty', 
  CAREER: 'career',
  DIMENSION: 'dimension',
  COMPONENT: 'component',
  CRITERIA: 'criteria',
  STANDARD: 'standard',
  EVIDENCE: 'evidence'
} as const;

/**
 * Tipo derivado de ElementType para uso en interfaces
 */

export type ElementType = typeof ElementType[keyof typeof ElementType];

/**
   Interface principal para elementos de la estructura jerárquica
   Contiene toda la información de un elemento del repositorio
 */

export interface StructureElement {

  id: string;
  nomenclature?: string;
  name?: string;
  description?: string;
  type: ElementType;
  parentElementId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
  updatedBy?: string;
  
  /** Datos relacionales calculados (se llenan dinámicamente)*/
  
  /** Referencia al elemento padre */
  parentElement?: StructureElement;

  /** Lista de elementos hijos directos */
  childElements?: StructureElement[];

  /** Indica si el elemento tiene elementos hijos */
  hasChildren: boolean;

  /** Indica si el elemento se puede eliminar (no tiene dependencias) */
  canDelete: boolean;
}

/**
   Interface para representar un nodo en el árbol de estructura
   Usado para la visualización jerárquica
 */

export interface StructureTreeNode {
  /** El elemento de estructura */
  element: StructureElement;

  /** Lista de nodos hijos */
  children: StructureTreeNode[];

  /** Nivel en la jerarquía (0 = raíz) */
  level: number;

  /** Indica si el nodo está expandido en la UI */
  expanded: boolean;
}

/**
   Interface para el formulario de creación de elementos
   Contiene los datos mínimos necesarios para crear un elemento
 */

export interface CreateElementForm {
  type: ElementType;
  nomenclature?: string;
  name?: string;
  description?: string;
  parentElementId?: string;
}

/**
   Interface para el formulario de edición de elementos
   Permite modificar datos básicos manteniendo integridad referencial
 */

export interface EditElementForm {
  nomenclature?: string;
  name?: string;
  description?: string;
  active: boolean;
}

/**
   Interface para criterios de búsqueda en la estructura
   Permite filtrar elementos por diversos campos
 */

export interface StructureSearchCriteria {
  query?: string;           // Búsqueda general en código, nombre y descripción
  type?: ElementType;       // Filtrar por tipo de elemento
  parentElementId?: string; // Filtrar elementos hijos de un padre específico
  activeOnly?: boolean;     // Solo elementos activos
  hasChildren?: boolean;    // Solo elementos con/sin hijos
}

/**
   Interface para resultados de búsqueda paginados
   Proporciona metadatos útiles para la paginación en UI
 */

export interface StructureSearchResult {
  elements: StructureElement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
   Interface para opciones en dropdowns y selects
   Reutilizable en toda la aplicación
 */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}



/**
   Interface para operaciones en batch
   Permite realizar múltiples operaciones en una sola llamada
 */

export interface BatchOperation {
  elementIds: string[];
  operation: 'activate' | 'deactivate' | 'delete';
}