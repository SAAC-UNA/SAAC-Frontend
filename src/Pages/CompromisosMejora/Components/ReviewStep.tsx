/**
 * ReviewStep - Sexto y último paso del wizard
 * Revisión final antes de crear el compromiso
 */

import React from 'react';

interface Seleccion {
  entidad_tipo: 'ESTANDAR' | 'DIMENSION' | 'COMPONENTE' | 'CRITERIO' | 'EVIDENCIA';
  entidad_id: number;
  nombre?: string;
}

interface ReviewStepProps {
  procesoId?: number;
  cicloAcreditacionId?: number;
  procesoNombre?: string;
  selecciones: Seleccion[];
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  evidenciasAsignadas: number[];
  evidenciasNombres?: Array<{ id: number; nombre: string }>;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  procesoId,
  cicloAcreditacionId,
  procesoNombre,
  selecciones,
  descripcion,
  fechaInicio,
  fechaFin,
  evidenciasAsignadas,
  evidenciasNombres
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-CR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuracion = () => {
    if (!fechaInicio || !fechaFin) return '';
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    if (months > 0) {
      return `${months} mes${months > 1 ? 'es' : ''} y ${days} día${days !== 1 ? 's' : ''}`;
    }
    return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'ESTANDAR': 'Estándar',
      'DIMENSION': 'Dimensión',
      'COMPONENTE': 'Componente',
      'CRITERIO': 'Criterio',
      'EVIDENCIA': 'Evidencia'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revisar Compromiso de Mejora
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Verifique que toda la información sea correcta antes de crear el compromiso
        </p>
      </div>

      {/* Proceso/Ciclo */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {procesoId ? 'Proceso' : 'Ciclo de Acreditación'}
        </h4>
        <p className="text-sm text-gray-700">
          {procesoNombre || (cicloAcreditacionId ? `Ciclo ${cicloAcreditacionId}` : 'No especificado')}
        </p>
      </div>

      {/* Selecciones */}
      {selecciones.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Criterios y Evidencias Seleccionados
          </h4>
          <div className="space-y-2">
            {selecciones.map((sel, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {getTipoLabel(sel.entidad_tipo)}
                </span>
                <span className="text-gray-700">
                  {sel.nombre || `ID: ${sel.entidad_id}`}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Total: {selecciones.length} elemento{selecciones.length !== 1 ? 's' : ''} seleccionado{selecciones.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Descripción */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Descripción del Compromiso
        </h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{descripcion}</p>
        <p className="text-xs text-gray-500 mt-2">
          {descripcion.length} / 100 caracteres
        </p>
      </div>

      {/* Fechas */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Período del Compromiso
        </h4>
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-gray-600 uppercase">Fecha de inicio:</span>
            <p className="text-sm text-gray-900 mt-1">{formatDate(fechaInicio)}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-600 uppercase">Fecha de finalización:</span>
            <p className="text-sm text-gray-900 mt-1">{formatDate(fechaFin)}</p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-600 uppercase">Duración:</span>
            <p className="text-sm text-blue-700 font-medium mt-1">{getDuracion()}</p>
          </div>
        </div>
      </div>

      {/* Evidencias Asignadas */}
      {evidenciasAsignadas.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-rojo-una" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Evidencias Asignadas
          </h4>
          <div className="space-y-1">
            {evidenciasNombres && evidenciasNombres.length > 0 ? (
              evidenciasNombres.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ev.nombre}
                </div>
              ))
            ) : (
              evidenciasAsignadas.map((id) => (
                <div key={id} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Evidencia ID: {id}
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {evidenciasAsignadas.length} evidencia{evidenciasAsignadas.length !== 1 ? 's' : ''} vinculada{evidenciasAsignadas.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Estado */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-1">
              Estado Inicial: Pendiente
            </h4>
            <p className="text-sm text-yellow-800">
              El compromiso se creará con estado "Pendiente". Podrá actualizar el estado a "En Progreso" o "Completado" posteriormente.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmación */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              ¿Todo listo?
            </h4>
            <p className="text-sm text-blue-800">
              Al hacer clic en "Crear Compromiso", se guardará esta información y se registrará en la bitácora del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
