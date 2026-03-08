/**
 * ProcesoStep - Primer paso del wizard
 * Selección del proceso o ciclo de acreditación
 */

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { config } from '@/Config/app.config';

interface Proceso {
  proceso_id: number;
  accreditation_cycle: {
    ciclo_acreditacion_id: number;
    nombre: string;
    career_campus: {
      career: {
        nombre: string;
      };
      campus: {
        nombre: string;
      };
    };
  };
}

interface ProcesoStepProps {
  procesoId: number | null;
  cicloId: number | null;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  onSelectProceso: (procesoId: number) => void;
  onSelectCiclo: (cicloId: number) => void;
  onChangeFechaInicio: (fecha: string) => void;
  onChangeFechaFin: (fecha: string) => void;
  onChangeDescripcion: (descripcion: string) => void;
  error?: string;
  errorInicio?: string;
  errorFin?: string;
  errorDescripcion?: string;
}

export const ProcesoStep: React.FC<ProcesoStepProps> = ({
  procesoId,
  fechaInicio,
  fechaFin,
  descripcion,
  onSelectProceso,
  onChangeFechaInicio,
  onChangeFechaFin,
  onChangeDescripcion,
  error,
  errorInicio,
  errorFin,
  errorDescripcion
}) => {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadProcesos();
  }, []);

  const loadProcesos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/estructura/procesos`);
      if (!response.ok) {
        throw new Error('Error al cargar procesos');
      }
      const data = await response.json();
      setProcesos(data);
    } catch (error) {
      console.error('Error al cargar procesos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-0.5">
          Proceso y Periodo
        </h3>
        <p className="text-xs text-gray-600 mb-2">
          Seleccione el proceso de acreditación y establezca las fechas del compromiso
        </p>
      </div>

      {/* Proceso Select */}
      <CustomSelect
        label="Proceso de Acreditación"
        value={procesoId?.toString() || ''}
        placeholder="Seleccione un proceso"
        size="sm"
        onChange={(value) => onSelectProceso(Number(value))}
        options={procesos.filter(proceso => 
          proceso.accreditation_cycle?.career_campus?.career?.nombre && 
          proceso.accreditation_cycle?.career_campus?.campus?.nombre
        ).map((proceso) => ({
          value: proceso.proceso_id.toString(),
          label: `${proceso.accreditation_cycle.career_campus.career.nombre} - ${proceso.accreditation_cycle.career_campus.campus.nombre} (${proceso.accreditation_cycle.nombre})`
        }))}
        maxVisibleItems={3}
      />

      {/* Fechas lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fecha_inicio" className="block text-xs font-medium text-gray-700 mb-1.5">
            Fecha de Inicio *
          </label>
          <input
            type="date"
            id="fecha_inicio"
            value={fechaInicio}
            onChange={(e) => onChangeFechaInicio(e.target.value)}
            min={today}
            className={`w-full px-3 py-2 text-sm border rounded-corner focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent ${
              errorInicio ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errorInicio && (
            <p className="text-xs text-red-600 mt-1">{errorInicio}</p>
          )}
        </div>

        <div>
          <label htmlFor="fecha_fin" className="block text-xs font-medium text-gray-700 mb-1.5">
            Fecha de Finalización *
          </label>
          <input
            type="date"
            id="fecha_fin"
            value={fechaFin}
            onChange={(e) => onChangeFechaFin(e.target.value)}
            min={fechaInicio || today}
            className={`w-full px-3 py-2 text-sm border rounded-corner focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent ${
              errorFin ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errorFin && (
            <p className="text-xs text-red-600 mt-1">{errorFin}</p>
          )}
        </div>
      </div>

      {/* Descripción del Compromiso */}
      <div>
        <label htmlFor="descripcion" className="block text-xs font-medium text-gray-700 mb-1.5">
          Descripción del compromiso (opcional)
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => onChangeDescripcion(e.target.value)}
          placeholder="Describa las acciones necesarias para cumplir con el compromiso de mejora"
          rows={3}
          maxLength={250}
          className={`w-full px-3 py-2 text-sm border rounded-corner focus:outline-none focus:ring-2 focus:ring-rojo-una focus:border-transparent resize-none ${
            errorDescripcion ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1.5">
          {errorDescripcion ? (
            <p className="text-xs text-red-600">{errorDescripcion}</p>
          ) : (
            <p className="text-xs text-gray-500">Descripción breve del compromiso</p>
          )}
          <p className={`text-xs ${
            250 - descripcion.length < 50 ? 'text-orange-600' : 'text-gray-500'
          }`}>
            {250 - descripcion.length} caracteres restantes
          </p>
        </div>
      </div>

      {procesos.length === 0 && (
        <p className="text-xs text-gray-500 mt-2">No hay procesos disponibles</p>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};

export default ProcesoStep;
