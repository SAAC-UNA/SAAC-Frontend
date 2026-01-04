/**
 * DescripcionStep - Segundo paso del wizard
 * Ingreso de la descripción del compromiso
 */

import React from 'react';

interface DescripcionStepProps {
  descripcion: string;
  onChange: (descripcion: string) => void;
  error?: string;
}

export const DescripcionStep: React.FC<DescripcionStepProps> = ({
  descripcion,
  onChange,
  error
}) => {
  const maxLength = 100;
  const remainingChars = maxLength - descripcion.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Descripción del Compromiso
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Describa detalladamente las acciones necesarias para cumplir con las observaciones de los entes evaluadores
        </p>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Sistema de seguimiento de egresados..."
          rows={4}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent resize-none ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        
        <div className="flex justify-between items-center mt-2">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-gray-500">
              Descripción breve del compromiso
            </p>
          )}
          <p className={`text-sm ${remainingChars < 20 ? 'text-orange-600' : 'text-gray-500'}`}>
            {remainingChars} caracteres restantes
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Recomendaciones
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sea específico y conciso (máximo 100 caracteres)</li>
          <li>• Describa el objetivo principal del compromiso</li>
          <li>• Evite tecnicismos innecesarios</li>
        </ul>
      </div>
    </div>
  );
};

export default DescripcionStep;
