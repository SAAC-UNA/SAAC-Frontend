/**
 * LoadingDemo - Demostración del componente LoadingSpinner unificado
 * 
 * Este componente muestra todas las variantes del LoadingSpinner
 * para verificar la consistencia visual en todo el sistema.
 */

import React from 'react';
import { LoadingSpinner } from '../Ui/Loading';

export const LoadingDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Demostración de LoadingSpinner Unificado
      </h1>

      {/* Sección de tamaños */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Tamaños</h2>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <LoadingSpinner size="xs" />
            <p className="mt-2 text-sm text-gray-600">XS (12px)</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="sm" />
            <p className="mt-2 text-sm text-gray-600">SM (16px)</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="md" />
            <p className="mt-2 text-sm text-gray-600">MD (24px)</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-gray-600">LG (32px)</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="xl" />
            <p className="mt-2 text-sm text-gray-600">XL (48px)</p>
          </div>
        </div>
      </div>

      {/* Sección de colores */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Colores</h2>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <LoadingSpinner color="primary" />
            <p className="mt-2 text-sm text-gray-600">Primary (Azul UNA)</p>
          </div>
          <div className="text-center">
            <LoadingSpinner color="secondary" />
            <p className="mt-2 text-sm text-gray-600">Secondary (Rojo UNA)</p>
          </div>
          <div className="text-center bg-gray-800 p-4 rounded">
            <LoadingSpinner color="white" />
            <p className="mt-2 text-sm text-white">White</p>
          </div>
          <div className="text-center">
            <LoadingSpinner color="gray" />
            <p className="mt-2 text-sm text-gray-600">Gray</p>
          </div>
          <div className="text-center">
            <LoadingSpinner color="current" />
            <p className="mt-2 text-sm text-gray-600">Current</p>
          </div>
        </div>
      </div>

      {/* Sección de grosores */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Grosores</h2>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <LoadingSpinner size="lg" thickness="thin" />
            <p className="mt-2 text-sm text-gray-600">Thin</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" thickness="normal" />
            <p className="mt-2 text-sm text-gray-600">Normal</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" thickness="thick" />
            <p className="mt-2 text-sm text-gray-600">Thick</p>
          </div>
        </div>
      </div>

      {/* Ejemplos de uso común */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Casos de Uso Comunes</h2>
        
        {/* Carga de página completa */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-4">Carga de página completa</h3>
          <div className="flex items-center justify-center py-12 bg-gray-50 rounded">
            <div className="text-center">
              <LoadingSpinner size="xl" color="secondary" className="mx-auto mb-4" />
              <p className="text-gray-600">Cargando estructura del repositorio...</p>
            </div>
          </div>
        </div>

        {/* Carga en tabla */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-4">Carga en tabla/lista</h3>
          <div className="flex items-center justify-center py-8 bg-gray-50 rounded">
            <LoadingSpinner size="lg" color="secondary" />
            <span className="ml-3 text-gray-600">Cargando datos...</span>
          </div>
        </div>

        {/* Carga en botón */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-4">Carga en botón</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <LoadingSpinner size="sm" color="current" className="mr-2" />
            Guardando...
          </button>
        </div>
      </div>
    </div>
  );
};