/**
 * FechaStep - Tercer paso del wizard
 * Selección de la fecha objetivo
 */

import React from 'react';

interface FechaStepProps {
  fecha: string;
  onChange: (fecha: string) => void;
  error?: string;
}

export const FechaStep: React.FC<FechaStepProps> = ({
  fecha,
  onChange,
  error
}) => {
  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];
  
  // Calcular fechas sugeridas
  const getSuggestedDates = () => {
    const dates = [];
    const baseDate = new Date();
    
    // 1 mes
    const oneMonth = new Date(baseDate);
    oneMonth.setMonth(oneMonth.getMonth() + 1);
    dates.push({ label: '1 mes', value: oneMonth.toISOString().split('T')[0] });
    
    // 3 meses
    const threeMonths = new Date(baseDate);
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    dates.push({ label: '3 meses', value: threeMonths.toISOString().split('T')[0] });
    
    // 6 meses
    const sixMonths = new Date(baseDate);
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    dates.push({ label: '6 meses', value: sixMonths.toISOString().split('T')[0] });
    
    // 1 año
    const oneYear = new Date(baseDate);
    oneYear.setFullYear(oneYear.getFullYear() + 1);
    dates.push({ label: '1 año', value: oneYear.toISOString().split('T')[0] });
    
    return dates;
  };

  const suggestedDates = getSuggestedDates();

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
          Fecha Objetivo
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Establezca la fecha límite para cumplir con este compromiso de mejora
        </p>
      </div>

      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
          Fecha Objetivo *
        </label>
        <input
          type="date"
          id="fecha"
          value={fecha}
          onChange={(e) => onChange(e.target.value)}
          min={today}
          className={`w-full px-4 py-3 border rounded-corner focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
        {fecha && !error && (
          <p className="text-sm text-gray-600 mt-2">
            📅 {formatDate(fecha)}
          </p>
        )}
      </div>

      {/* Suggested Dates */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Fechas sugeridas:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {suggestedDates.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange(item.value)}
              className={`px-4 py-3 rounded-corner border-2 transition-all text-sm font-medium ${
                fecha === item.value
                  ? 'border-rojo-una bg-rojo-una/5 text-rojo-una'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

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
              La fecha objetivo debe ser realista y considerar el tiempo necesario para implementar las acciones del compromiso.
              Esta fecha será visible para todos los involucrados en el proceso de acreditación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
