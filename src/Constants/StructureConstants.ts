import { ElementType, type CreateElementForm } from '@/Types/StructureTypes';

/**
   Labels para tipos de elementos (se muestran en la interfaz de usuario)
   Se usan en dropdowns, títulos y mensajes para el usuario final
 */

export const ELEMENT_TYPE_LABELS = {
  [ElementType.UNIVERSITY]: 'Universidad',
  [ElementType.CAMPUS]: 'Sede',
  [ElementType.FACULTY]: 'Facultad',
  [ElementType.CAREER]: 'Carrera',
  [ElementType.DIMENSION]: 'Dimensión',
  [ElementType.COMPONENT]: 'Componente',
  [ElementType.CRITERIA]: 'Criterio',
  [ElementType.STANDARD]: 'Estándar',
  [ElementType.EVIDENCE]: 'Evidencia'
} as const;

/**
   Reglas de jerarquía para la estructura del repositorio
   Define qué elementos pueden ser hijos de otros elementos
 */

export const HIERARCHY_RULES = {
  [ElementType.UNIVERSITY]: { 
    canHaveChildren: [ElementType.CAMPUS],
    mustHaveParent: null,
    level: 1,
    description: 'Universidad'
  },
  [ElementType.CAMPUS]: { 
    canHaveChildren: [ElementType.FACULTY], 
    mustHaveParent: ElementType.UNIVERSITY,
    level: 2,
    description: 'Sede o campus universitario'
  },
  [ElementType.FACULTY]: { 
    canHaveChildren: [ElementType.CAREER], 
    mustHaveParent: ElementType.CAMPUS,
    level: 3,
    description: 'Facultad o centro académico'
  },
  [ElementType.CAREER]: { 
    canHaveChildren: [], 
    mustHaveParent: ElementType.FACULTY,
    level: 4,
    description: 'Carrera académica'
  },
  [ElementType.DIMENSION]: { 
    canHaveChildren: [ElementType.COMPONENT], 
    mustHaveParent: null,
    level: 1,
    description: 'Dimensión de evaluación'
  },
  [ElementType.COMPONENT]: { 
    canHaveChildren: [ElementType.CRITERIA], 
    mustHaveParent: ElementType.DIMENSION,
    level: 2,
    description: 'Componente de la dimensión'
  },
  [ElementType.CRITERIA]: { 
    canHaveChildren: [ElementType.STANDARD, ElementType.EVIDENCE], 
    mustHaveParent: ElementType.COMPONENT,
    level: 3,
    description: 'Criterio de evaluación'
  },
  [ElementType.STANDARD]: { 
    canHaveChildren: [], 
    mustHaveParent: ElementType.CRITERIA,
    level: 4,
    description: 'Estándar de criterio (opcional)'
  },
  [ElementType.EVIDENCE]: { 
    canHaveChildren: [], 
    mustHaveParent: ElementType.CRITERIA,
    level: 4,
    description: 'Evidencia documental'
  }
} as const satisfies Record<ElementType, {
  canHaveChildren: ElementType[];
  mustHaveParent: ElementType | null;
  level: number;
  description: string;
}>;

/**
   Reglas de validación para formularios
   Define límites y patrones para campos de entrada
 */

export const VALIDATION_RULES = {

  /** Longitud máxima para código de elemento */
  NOMENCLATURE_MAX_LENGTH: 20,

  /** Longitud máxima para nombre de elemento */
  NAME_MAX_LENGTH: 80,

  /** Longitud máxima para descripción */
  DESCRIPTION_MAX_LENGTH: 250,

  /** Patrón permitido para códigos (letras, números, guiones y guiones bajos) */
  NOMENCLATURE_PATTERN: /^[A-Z0-9\-_]+$/i,

  /** Patrón permitido para nombres (letras con acentos, números, espacios y puntuación básica) */
  NAME_PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-_.,()]+$/
} as const;

/**
 * Configuración de interfaz de usuario
 * Define comportamientos y límites de la UI
 */

export const UI_CONFIG = {

  /** Duración por defecto de toasts/notificaciones (ms) */
  TOAST_DURATION: 5000,

  /** Número máximo de toasts simultáneos */
  TOAST_MAX_COUNT: 5,

  /** Tiempo de espera para auto-guardado de formularios (ms) */
  FORM_AUTO_SAVE_DELAY: 2000,

  /** Retraso para búsqueda con debounce (ms) */
  SEARCH_DEBOUNCE_DELAY: 300,

  /** Tiempo límite para peticiones API (ms) */
  API_TIMEOUT: 30000,

  /** Número de elementos por página en listados */
  ITEMS_PER_PAGE: 20,

  /** Número máximo de niveles a mostrar en árbol expandido */
  MAX_TREE_DEPTH: 5
} as const;

/**
   Mensajes de usuario para operaciones CRUD
   Mensajes estandarizados para mostrar al usuario
 */

export const USER_MESSAGES = {
  SUCCESS: {
    CREATE: 'Elemento creado exitosamente',
    UPDATE: 'Elemento actualizado exitosamente', 
    DELETE: 'Elemento eliminado exitosamente',
    DEACTIVATE: 'Elemento desactivado exitosamente'
  },
  ERROR: {
    CREATE: 'Error al crear el elemento',
    UPDATE: 'Error al actualizar el elemento',
    DELETE: 'Error al eliminar el elemento',
    DEACTIVATE: 'Error al desactivar el elemento',
    FETCH: 'Error al cargar los datos',
    VALIDATION: 'Por favor corrige los errores en el formulario',
    NETWORK: 'Error de conexión. Verifica tu conexión a internet',
    PERMISSION: 'No tienes permisos para realizar esta acción'
  },
  CONFIRMATION: {
    DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
    DEACTIVATE: '¿Estás seguro de que deseas desactivar este elemento?',
    UNSAVED_CHANGES: 'Tienes cambios sin guardar. ¿Deseas continuar?'
  },
  WARNING: {
    HAS_CHILDREN: 'Este elemento tiene elementos dependientes',
    CANNOT_DELETE: 'No se puede eliminar un elemento con dependencias',
    DUPLICATE_NAME: 'Ya existe un elemento con este nombre en este nivel',
    DUPLICATE_NOMENCLATURE: 'Ya existe un elemento con este código'
  }
} as const;

/**
 * Define la estructura de configuración para un formulario de un tipo de elemento.
 */
type FormConfig = {
  readonly requiredFields: ReadonlyArray<keyof CreateElementForm>;
  readonly optionalFields: ReadonlyArray<keyof CreateElementForm>;
  readonly showParentSelector: boolean;
};

/**
 * Configuración de formularios por tipo de elemento
 * Define qué campos son obligatorios para cada tipo
 */

export const FORM_CONFIG: Record<ElementType, FormConfig> = {
  [ElementType.UNIVERSITY]: {
    requiredFields: ['name'],
    optionalFields: [],
    showParentSelector: false
  },
  [ElementType.CAMPUS]: {
    requiredFields: ['name', 'parentElementId'],
    optionalFields: [],
    showParentSelector: true
  },
  [ElementType.FACULTY]: {
    requiredFields: ['name', 'parentElementId'],
    optionalFields: [],
    showParentSelector: true
  },
  [ElementType.CAREER]: {
    requiredFields: ['name', 'parentElementId'],
    optionalFields: [],
    showParentSelector: true
  },
  [ElementType.DIMENSION]: {
    requiredFields: ['nomenclature', 'name'],
    optionalFields: [],
    showParentSelector: false
  },
  [ElementType.COMPONENT]: {
    requiredFields: ['nomenclature', 'name', 'parentElementId'],
    optionalFields: [],
    showParentSelector: true
  },
  [ElementType.CRITERIA]: {
    requiredFields: ['nomenclature', 'description', 'parentElementId'],
    optionalFields: [],
    showParentSelector: true
  },
  [ElementType.STANDARD]: {
    requiredFields: ['nomenclature','description', 'parentElementId'],
    optionalFields: [],
    showParentSelector: true
  },
  [ElementType.EVIDENCE]: {
    requiredFields: ['nomenclature', 'description', 'parentElementId'],
    optionalFields: [],
    showParentSelector: true
  }
};

/**
 * Utilidad para obtener tipos de elementos que pueden ser hijos de un padre específico
   @param parentType Tipo del elemento padre
   @returns Array de tipos que pueden ser hijos
 */

export const getChildrenTypes = (parentType: ElementType): ElementType[] => {
  const children = HIERARCHY_RULES[parentType]?.canHaveChildren;
  return children ? [...children] : [];
};

/**
 * Utilidad para obtener el tipo de elemento padre requerido
   @param childType Tipo del elemento hijo
   @returns Tipo del elemento padre o null si no requiere padre
 */

export const getRequiredParentType = (childType: ElementType): ElementType | null => {
  return HIERARCHY_RULES[childType]?.mustHaveParent || null;
};

/**
 * Utilidad para validar si una relación padre-hijo es válida
   @param parentType Tipo del elemento padre
   @param childType Tipo del elemento hijo
   @returns true si la relación es válida
 */

export const isValidParentChildRelation = (parentType: ElementType, childType: ElementType): boolean => {
  const rules = HIERARCHY_RULES[parentType];
  return rules?.canHaveChildren ? 
  (rules.canHaveChildren as ElementType[]).includes(childType) : 
  false;
};