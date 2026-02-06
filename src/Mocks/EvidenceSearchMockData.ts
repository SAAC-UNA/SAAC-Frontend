/**
 * Datos mock para la búsqueda avanzada de evidencias
 * Utilizados en el mockup funcional para demostración
 */

import type { 
  EvidenceSearchResult, 
  EvidencePublicationStatus,
  FilterOption
} from '@/Types/EvidenceSearchTypes';

// Datos mock de evidencias
export const mockEvidenceResults: EvidenceSearchResult[] = [
  {
    evidencia_id: 1,
    criterio_nomenclatura: 'CRI-1.1.1',
    criterio_descripcion: 'Planificación estratégica institucional',
    descripcion: 'Plan Estratégico Institucional 2024-2028',
    fecha_publicacion: '2024-01-15T10:30:00Z',
    estado: 'aprobado' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 101,
      nombre: 'María González Rodríguez',
      email: 'maria.gonzalez@una.cr'
    },
    archivos_count: 3,
    enlaces_count: 1,
    roles_acceso: ['Coordinador', 'Auditor', 'Administrador'],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    evidencia_id: 2,
    criterio_nomenclatura: 'CRI-1.2.3',
    criterio_descripcion: 'Políticas de calidad académica',
    descripcion: 'Política de Evaluación Docente 2024',
    fecha_publicacion: '2024-02-20T14:15:00Z',
    estado: 'completado' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 102,
      nombre: 'Carlos Jiménez Mora',
      email: 'carlos.jimenez@una.cr'
    },
    archivos_count: 2,
    enlaces_count: 0,
    roles_acceso: ['Coordinador', 'Docente', 'Administrador'],
    created_at: '2024-02-18T09:00:00Z',
    updated_at: '2024-02-20T14:15:00Z'
  },
  {
    evidencia_id: 3,
    criterio_nomenclatura: 'CRI-2.1.1',
    criterio_descripcion: 'Programas de formación continua',
    descripcion: 'Informe de Capacitaciones Docentes 2023',
    fecha_publicacion: '2024-03-10T11:00:00Z',
    estado: 'pendiente' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 103,
      nombre: 'Ana Patricia Solís',
      email: 'ana.solis@una.cr'
    },
    archivos_count: 5,
    enlaces_count: 2,
    roles_acceso: ['Coordinador', 'Administrador'],
    created_at: '2024-03-05T10:00:00Z',
    updated_at: '2024-03-10T11:00:00Z'
  },
  {
    evidencia_id: 4,
    criterio_nomenclatura: 'CRI-2.3.2',
    criterio_descripcion: 'Sistemas de evaluación estudiantil',
    descripcion: 'Reglamento de Evaluación de Aprendizajes',
    fecha_publicacion: '2024-01-25T16:45:00Z',
    estado: 'aprobado' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 101,
      nombre: 'María González Rodríguez',
      email: 'maria.gonzalez@una.cr'
    },
    archivos_count: 1,
    enlaces_count: 3,
    roles_acceso: ['Coordinador', 'Docente', 'Auditor', 'Administrador'],
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-01-25T16:45:00Z'
  },
  {
    evidencia_id: 5,
    criterio_nomenclatura: 'CRI-3.1.4',
    criterio_descripcion: 'Infraestructura tecnológica',
    descripcion: 'Inventario de Equipos de Cómputo 2024',
    fecha_publicacion: '2024-04-05T09:30:00Z',
    estado: 'en_proceso' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 104,
      nombre: 'Roberto Vargas Castro',
      email: 'roberto.vargas@una.cr'
    },
    archivos_count: 4,
    enlaces_count: 0,
    roles_acceso: ['Coordinador', 'Administrador'],
    created_at: '2024-04-01T08:00:00Z',
    updated_at: '2024-04-05T09:30:00Z'
  },
  {
    evidencia_id: 6,
    criterio_nomenclatura: 'CRI-1.1.2',
    criterio_descripcion: 'Misión y visión institucional',
    descripcion: 'Documento de Misión y Visión Actualizados',
    fecha_publicacion: '2024-02-10T13:20:00Z',
    estado: 'vencido' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 102,
      nombre: 'Carlos Jiménez Mora',
      email: 'carlos.jimenez@una.cr'
    },
    archivos_count: 1,
    enlaces_count: 1,
    roles_acceso: ['Coordinador', 'Auditor', 'Docente', 'Administrador'],
    created_at: '2024-02-05T10:00:00Z',
    updated_at: '2024-02-10T13:20:00Z'
  },
  {
    evidencia_id: 7,
    criterio_nomenclatura: 'CRI-2.2.1',
    criterio_descripcion: 'Programas de investigación',
    descripcion: 'Catálogo de Proyectos de Investigación 2024',
    fecha_publicacion: '2024-03-18T15:00:00Z',
    estado: 'rechazado' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 105,
      nombre: 'Luisa Fernández Pérez',
      email: 'luisa.fernandez@una.cr'
    },
    archivos_count: 0,
    enlaces_count: 1,
    roles_acceso: ['Coordinador'],
    created_at: '2024-03-15T09:00:00Z',
    updated_at: '2024-03-18T15:00:00Z'
  },
  {
    evidencia_id: 8,
    criterio_nomenclatura: 'CRI-3.2.1',
    criterio_descripcion: 'Gestión de recursos bibliotecarios',
    descripcion: 'Informe de Adquisiciones Bibliográficas 2023',
    fecha_publicacion: '2024-01-30T10:00:00Z',
    estado: 'completado' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 103,
      nombre: 'Ana Patricia Solís',
      email: 'ana.solis@una.cr'
    },
    archivos_count: 2,
    enlaces_count: 2,
    roles_acceso: ['Coordinador', 'Auditor', 'Administrador'],
    created_at: '2024-01-28T08:00:00Z',
    updated_at: '2024-01-30T10:00:00Z'
  },
  {
    evidencia_id: 9,
    criterio_nomenclatura: 'CRI-1.3.1',
    criterio_descripcion: 'Estructura organizacional',
    descripcion: 'Organigrama Institucional 2024',
    fecha_publicacion: '2024-04-12T11:30:00Z',
    estado: 'pendiente' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 101,
      nombre: 'María González Rodríguez',
      email: 'maria.gonzalez@una.cr'
    },
    archivos_count: 1,
    enlaces_count: 0,
    roles_acceso: ['Coordinador', 'Administrador'],
    created_at: '2024-04-10T09:00:00Z',
    updated_at: '2024-04-12T11:30:00Z'
  },
  {
    evidencia_id: 10,
    criterio_nomenclatura: 'CRI-2.1.3',
    criterio_descripcion: 'Mecanismos de seguimiento académico',
    descripcion: 'Sistema de Tutoría Académica',
    fecha_publicacion: '2024-03-25T14:45:00Z',
    estado: 'en_proceso' as EvidencePublicationStatus,
    responsable: {
      usuario_id: 104,
      nombre: 'Roberto Vargas Castro',
      email: 'roberto.vargas@una.cr'
    },
    archivos_count: 3,
    enlaces_count: 4,
    roles_acceso: ['Coordinador', 'Docente', 'Auditor', 'Administrador'],
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-25T14:45:00Z'
  }
];

// Opciones para filtro de criterios
export const mockCriteriaOptions: FilterOption<string>[] = [
  { value: 'CRI-1.1.1', label: 'CRI-1.1.1 - Planificación estratégica' },
  { value: 'CRI-1.1.2', label: 'CRI-1.1.2 - Misión y visión' },
  { value: 'CRI-1.2.3', label: 'CRI-1.2.3 - Políticas de calidad' },
  { value: 'CRI-1.3.1', label: 'CRI-1.3.1 - Estructura organizacional' },
  { value: 'CRI-2.1.1', label: 'CRI-2.1.1 - Formación continua' },
  { value: 'CRI-2.1.3', label: 'CRI-2.1.3 - Seguimiento académico' },
  { value: 'CRI-2.2.1', label: 'CRI-2.2.1 - Programas de investigación' },
  { value: 'CRI-2.3.2', label: 'CRI-2.3.2 - Evaluación estudiantil' },
  { value: 'CRI-3.1.4', label: 'CRI-3.1.4 - Infraestructura tecnológica' },
  { value: 'CRI-3.2.1', label: 'CRI-3.2.1 - Recursos bibliotecarios' }
];

// Opciones para filtro de responsables
export const mockResponsibleOptions: FilterOption<number>[] = [
  { value: 101, label: 'María González Rodríguez' },
  { value: 102, label: 'Carlos Jiménez Mora' },
  { value: 103, label: 'Ana Patricia Solís' },
  { value: 104, label: 'Roberto Vargas Castro' },
  { value: 105, label: 'Luisa Fernández Pérez' }
];

// Opciones para filtro de roles
export const mockRoleOptions: FilterOption<number>[] = [
  { value: 1, label: 'Administrador' },
  { value: 2, label: 'Coordinador' },
  { value: 3, label: 'Auditor' },
  { value: 4, label: 'Docente' },
  { value: 5, label: 'Estudiante' }
];

// Opciones para filtro de estado (coinciden con ESTADO_EVIDENCIA del backend)
export const mockStatusOptions: FilterOption<EvidencePublicationStatus | 'todos'>[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'completado', label: 'Completado' },
  { value: 'vencido', label: 'Vencido' }
];
