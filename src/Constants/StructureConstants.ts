{/** Este no debería de ser eliminado? */}

import { ElementType, type CreateElementForm } from '@/Types/StructureTypes';

/**
   Labels para tipos de elementos (se muestran en la interfaz de usuario)
   Se usan en dropdowns, títulos y mensajes para el usuario final
 */

export const ELEMENT_TYPE_LABELS = {
  [ElementType.UNIVERSITY]: 'Universidad',
  [ElementType.CAMPUS]: 'Sede',
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

const HIERARCHY_RULES = {
  [ElementType.UNIVERSITY]: { 
    canHaveChildren: [ElementType.CAMPUS],
    mustHaveParent: null,
    level: 1,
    description: 'Universidad'
  },
  [ElementType.CAMPUS]: { 
    canHaveChildren: [ElementType.CAREER], 
    mustHaveParent: ElementType.UNIVERSITY,
    level: 2,
    description: 'Sede o campus universitario'
  },
  [ElementType.CAREER]: { 
    canHaveChildren: [], 
    mustHaveParent: ElementType.CAMPUS,
    level: 3,
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

  /** Límites específicos de descripción por tipo de elemento */
  DESCRIPTION_MAX_LENGTH_BY_TYPE: {
    [ElementType.UNIVERSITY]: 250,
    [ElementType.CAMPUS]: 250,
    [ElementType.CAREER]: 250,
    [ElementType.DIMENSION]: 250,
    [ElementType.COMPONENT]: 250,
    [ElementType.CRITERIA]: 300,
    [ElementType.STANDARD]: 250,
    [ElementType.EVIDENCE]: 80
  } as const,

  /** Patrón permitido para códigos (letras, números, guiones y guiones bajos) */
  NOMENCLATURE_PATTERN: /^[A-Z0-9\-_.]+$/i,

  /** Patrón permitido para nombres (letras con acentos, números, espacios y puntuación básica) */
  NAME_PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-_.,()]+$/
} as const;

/**
 * Función helper para obtener el límite de descripción según el tipo
 */
export const getDescriptionMaxLength = (type: ElementType): number => {
  return VALIDATION_RULES.DESCRIPTION_MAX_LENGTH_BY_TYPE[type];
};

/**
 * Configuración de interfaz de usuario
 * Define comportamientos y límites de la UI
 */

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
    requiredFields: ['description', 'parentElementId'],
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
 * Utilidad para obtener el tipo de elemento padre requerido
   @param childType Tipo del elemento hijo
   @returns Tipo del elemento padre o null si no requiere padre
 */

export const getRequiredParentType = (childType: ElementType): ElementType | null => {
  return HIERARCHY_RULES[childType]?.mustHaveParent || null;
};