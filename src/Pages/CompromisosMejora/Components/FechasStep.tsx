/**
 * FechasStep - Cuarto paso del wizard
 * Selección de fechas de inicio y fin
 */

import React from 'react';

interface FechasStepProps {
  fechaInicio: string;
  fechaFin: string;
  onChangeFechaInicio: (fecha: string) => void;
  onChangeFechaFin: (fecha: string) => void;
  errorInicio?: string;
  errorFin?: string;
}

export const FechasStep: React.FC<FechasStepProps> = ({
  fechaInicio,
  fechaFin,
  onChangeFechaInicio,
  onChangeFechaFin,
  errorInicio,
  errorFin
}) => {
  const today = new Date().toISOString().split('T')[0];

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Período del Compromiso
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Establezca las fechas de inicio y finalización para este compromiso de mejora
        </p>
      </div>

      {/* Fecha Inicio */}
      <div>
        <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-2">
          Fecha de Inicio *
        </label>
        <input
          type="date"
          id="fecha_inicio"
          value={fechaInicio}
          onChange={(e) => onChangeFechaInicio(e.target.value)}
          min={today}
          className={`w-full px-4 py-3 border rounded-corner focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent ${
            errorInicio ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errorInicio && (
          <p className="text-sm text-red-600 mt-2">{errorInicio}</p>
        )}
        {fechaInicio && !errorInicio && (
          <p className="text-sm text-gray-600 mt-2">
            📅 {formatDate(fechaInicio)}
          </p>
        )}
      </div>

      {/* Fecha Fin */}
      <div>
        <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-2">
          Fecha de Finalización *
        </label>
        <input
          type="date"
          id="fecha_fin"
          value={fechaFin}
          onChange={(e) => onChangeFechaFin(e.target.value)}
          min={fechaInicio || today}
          className={`w-full px-4 py-3 border rounded-corner focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent ${
            errorFin ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errorFin && (
          <p className="text-sm text-red-600 mt-2">{errorFin}</p>
        )}
        {fechaFin && !errorFin && (
          <p className="text-sm text-gray-600 mt-2">
            📅 {formatDate(fechaFin)}
          </p>
        )}
      </div>

      {/* Duration */}
      {fechaInicio && fechaFin && !errorInicio && !errorFin && (
        <div className="bg-blue-50 border border-blue-200 rounded-corner p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Duración del compromiso
              </h4>
              <p className="text-sm text-blue-800">
                {(() => {
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
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-corner p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-1">
              Importante
            </h4>
            <p className="text-sm text-yellow-800">
              La fecha de finalización debe ser posterior a la fecha de inicio. Ambas fechas deben ser realistas considerando el alcance del compromiso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FechasStep;
