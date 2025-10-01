/**
 * Sistema de validación de formularios reutilizable
 * 
 * VALIDACIÓN roleName - CARACTERES NO PERMITIDOS:
 * ================================================
 * 
 * NÚMEROS: 0-9 (Ej: Admin123, Usuario1, Rol2024)
 * SÍMBOLOS: @ # $ ! % & * + = - _ | \ / ? < > " ' ` ~ ^ ( ) [ ] { } : ; , .
 * CARACTERES ESPECIALES: tabs, saltos de línea, emojis, etc.
 * 
 * SOLO SE PERMITEN:
 * - Letras: A-Z, a-z
 * - Acentos: Á É Í Ó Ú á é í ó ú
 * - Eñe: Ñ ñ
 * - Espacios simples
 * 
 * Expresión regular: /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/
 * 
 * Ejemplos válidos: "Administrador", "Médico Especialista", "Técnico en Sistemas"
 * Ejemplos inválidos: "Admin123", "Usuario@UNA", "Rol_especial"
 */

export type ValidationRule<T = any> = {
  validate: (value: T, allValues?: Record<string, any>) => boolean;
  message: string;
};

export type FieldValidation<T = any> = ValidationRule<T>[];

export type FormValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: FieldValidation<T[K]>;
};

// Reglas de validación comunes
export const validationRules = {
  // Requerido
  required: (message = 'Este campo es requerido'): ValidationRule<any> => ({
    validate: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value != null && value !== '';
    },
    message
  }),

  // Longitud mínima
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: message || `Debe tener al menos ${min} caracteres`
  }),

  // Longitud máxima
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: message || `No debe exceder ${max} caracteres`
  }),

  // Email válido
  email: (message = 'Ingresa un email válido'): ValidationRule<string> => ({
    validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  // Solo letras y espacios
  alphabetic: (message = 'Solo se permiten letras y espacios'): ValidationRule<string> => ({
    validate: (value) => !value || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value),
    message
  }),

  // Validación específica para nombres de roles
  roleName: (message = 'Solo se permiten letras, espacios y acentos'): ValidationRule<string> => ({
    validate: (value) => !value || /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(value),
    message
  }),

  // Al menos un elemento seleccionado (arrays)
  minSelected: (min: number, message?: string): ValidationRule<any[]> => ({
    validate: (value) => Array.isArray(value) && value.length >= min,
    message: message || `Selecciona al menos ${min} elemento(s)`
  }),

  // Valores únicos en un array
  unique: (message = 'No se permiten valores duplicados'): ValidationRule<any[]> => ({
    validate: (value) => {
      if (!Array.isArray(value)) return true;
      return value.length === new Set(value).size;
    },
    message
  }),

  // Validación personalizada
  custom: <T>(fn: (value: T, allValues?: Record<string, any>) => boolean, message: string): ValidationRule<T> => ({
    validate: fn,
    message
  })
};

/**
 * Hook para validación de formularios
 */
import { useState, useCallback } from 'react';

interface UseValidationOptions<T extends Record<string, any>> {
  schema: FormValidationSchema<T>;
  validateOnChange?: boolean;
}

export const useValidation = <T extends Record<string, any>>(
  options: UseValidationOptions<T>
) => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback((
    fieldName: keyof T,
    value: any,
    allValues: T
  ): string | null => {
    const fieldRules = options.schema[fieldName];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      if (!rule.validate(value, allValues)) {
        return rule.message;
      }
    }
    
    return null;
  }, [options.schema]);

  const validateForm = useCallback((values: T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    // Validar todos los campos
    Object.keys(options.schema).forEach((fieldName) => {
      const error = validateField(fieldName as keyof T, values[fieldName], values);
      if (error) {
        newErrors[fieldName as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [options.schema, validateField]);

  const validateSingleField = useCallback((
    fieldName: keyof T,
    value: any,
    allValues: T
  ) => {
    if (!options.validateOnChange) {
      console.log('⚠️ validateOnChange is disabled');
      return;
    }

    console.log(`🧪 validateSingleField called for "${String(fieldName)}" with value:`, value);
    const error = validateField(fieldName, value, allValues);
    console.log(`🧪 Validation result:`, error ? `❌ Error: ${error}` : '✅ Valid');
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || undefined
    }));
  }, [options.validateOnChange, validateField]);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: undefined
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateForm,
    validateSingleField,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.values(errors).some(error => error != null)
  };
};