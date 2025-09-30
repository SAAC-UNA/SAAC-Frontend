/**
 * RingLoadingDemo - Demostración del nuevo ring loader
 */

import React from 'react';
import { LoadingSpinner } from '../Ui/Loading';

export const RingLoadingDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Ring Loader - Nueva Variante
      </h1>

      {/* Comparación entre spinner y ring */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Comparación</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center p-6 border rounded-lg">
            <LoadingSpinner variant="spinner" size="lg" color="secondary" />
            <p className="mt-4 text-sm text-gray-600">Spinner Clásico</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <LoadingSpinner variant="ring" size="lg" color="secondary" />
            <p className="mt-4 text-sm text-gray-600">Ring Loader (Nuevo)</p>
          </div>
        </div>
      </div>

      {/* Diferentes tamaños del ring */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Tamaños Ring</h2>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <LoadingSpinner variant="ring" size="xs" />
            <p className="mt-2 text-sm text-gray-600">XS</p>
          </div>
          <div className="text-center">
            <LoadingSpinner variant="ring" size="sm" />
            <p className="mt-2 text-sm text-gray-600">SM</p>
          </div>
          <div className="text-center">
            <LoadingSpinner variant="ring" size="md" />
            <p className="mt-2 text-sm text-gray-600">MD</p>
          </div>
          <div className="text-center">
            <LoadingSpinner variant="ring" size="lg" />
            <p className="mt-2 text-sm text-gray-600">LG</p>
          </div>
          <div className="text-center">
            <LoadingSpinner variant="ring" size="xl" />
            <p className="mt-2 text-sm text-gray-600">XL</p>
          </div>
        </div>
      </div>

      {/* Diferentes colores */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Colores Ring</h2>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <LoadingSpinner variant="ring" color="primary" />
            <p className="mt-2 text-sm text-gray-600">Primary</p>
          </div>
          <div className="text-center">
            <LoadingSpinner variant="ring" color="secondary" />
            <p className="mt-2 text-sm text-gray-600">Secondary</p>
          </div>
          <div className="text-center bg-gray-800 p-4 rounded">
            <LoadingSpinner variant="ring" color="white" />
            <p className="mt-2 text-sm text-white">White</p>
          </div>
          <div className="text-center">
            <LoadingSpinner variant="ring" color="gray" />
            <p className="mt-2 text-sm text-gray-600">Gray</p>
          </div>
        </div>
      </div>

      {/* Diferentes grosores */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Grosores Ring</h2>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <LoadingSpinner variant="ring" size="lg" thickness="thin" />
            <p className="mt-2 text-sm text-gray-600">Thin</p>
          </div>
          <div className="text-center">
            <LoadingSpinner variant="ring" size="lg" thickness="normal" />
            <p className="mt-2 text-sm text-gray-600">Normal</p>
          </div>
          <div className="text-center">
            <LoadingSpinner variant="ring" size="lg" thickness="thick" />
            <p className="mt-2 text-sm text-gray-600">Thick</p>
          </div>
        </div>
      </div>

      {/* Casos de uso sugeridos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Casos de Uso Sugeridos</h2>
        
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-4">Carga de página moderna</h3>
          <div className="flex items-center justify-center py-8 bg-gray-50 rounded">
            <div className="text-center">
              <LoadingSpinner variant="ring" size="xl" color="secondary" className="mx-auto mb-4" />
              <p className="text-gray-600">Cargando aplicación...</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-4">Botón con ring loader</h3>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center">
            <LoadingSpinner variant="ring" size="sm" color="current" className="mr-3" />
            Procesando...
          </button>
        </div>
      </div>
    </div>
  );
};