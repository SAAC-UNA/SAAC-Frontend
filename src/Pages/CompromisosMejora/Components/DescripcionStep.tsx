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
  const maxLength = 250;
  const remainingChars = maxLength - descripcion.length;

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-0.5">
          Descripción del Compromiso
        </h3>
        <p className="text-xs text-gray-600 mb-1">
          Describa detalladamente las acciones necesarias para cumplir con las observaciones de los entes evaluadores
        </p>
      </div>

      <div>
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
    </div>
  );
};

export default DescripcionStep;
