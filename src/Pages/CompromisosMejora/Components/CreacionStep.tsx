/**
 * CreacionStep - Paso 1 del wizard de creación de compromisos
 * Permite seleccionar ciclo y criterios con sus evidencias
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type {
  CompromisoFormData,
  CicloAcreditacion,
  Criterio,
  CriterioSeleccionado,
  ValidationErrors
} from '@/Types/ImprovementCommitmentTypes';
import { CriterioModal } from '@/Pages/CompromisosMejora/Components/CriterioModal';
import { DeleteConfirmationModal } from '@/Components/Ui/DeleteConfirmationModal';

interface CreacionStepProps {
  formData: CompromisoFormData;
  updateFormData: (updates: Partial<CompromisoFormData>) => void;
  agregarCriterio: (criterio: CriterioSeleccionado) => void;
  eliminarCriterio: (criterioId: number) => void;
  actualizarCriterio: (criterio: CriterioSeleccionado) => void;
  errors: ValidationErrors;
}

type FiltroEstado = 'todos' | 'seleccionados' | 'pendientes';

export const CreacionStep: React.FC<CreacionStepProps> = ({
  formData,
  updateFormData,
  agregarCriterio,
  eliminarCriterio,
  actualizarCriterio,
  errors
}) => {
  const [ciclos, setCiclos] = useState<CicloAcreditacion[]>([]);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [criterioSeleccionado, setCriterioSeleccionado] = useState<Criterio | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [criterioAEliminar, setCriterioAEliminar] = useState<{ id: number; nombre: string } | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ciclosData, criteriosData] = await Promise.all([
        improvementCommitmentService.obtenerCiclosAcreditacion(),
        improvementCommitmentService.obtenerCriterios({ activo: true })
      ]);

      setCiclos(ciclosData);
      setCriterios(criteriosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Opciones para selector de ciclos
  const cicloOptions = useMemo(() => {
    return ciclos.map(ciclo => ({
      value: ciclo.ciclo_acreditacion_id.toString(),
      label: `${ciclo.nombre || (ciclo.anio ? `Ciclo ${ciclo.anio}` : `Ciclo ${ciclo.ciclo_acreditacion_id}`)}${ciclo.careerCampus?.career?.nombre ? ` - ${ciclo.careerCampus.career.nombre}` : ''}${ciclo.careerCampus?.campus?.nombre ? ` (${ciclo.careerCampus.campus.nombre})` : ''}`
    }));
  }, [ciclos]);

  // Criterios filtrados
  const criteriosFiltrados = useMemo(() => {
    let filtered = criterios;

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nomenclatura.toLowerCase().includes(term) ||
        c.descripcion.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (filtroEstado === 'seleccionados') {
      const idsSeleccionados = formData.criterios_seleccionados.map(c => c.criterio_id);
      filtered = filtered.filter(c => idsSeleccionados.includes(c.criterio_id));
    } else if (filtroEstado === 'pendientes') {
      const idsSeleccionados = formData.criterios_seleccionados.map(c => c.criterio_id);
      filtered = filtered.filter(c => !idsSeleccionados.includes(c.criterio_id));
    }

    return filtered;
  }, [criterios, searchTerm, filtroEstado, formData.criterios_seleccionados]);

  const handleCicloChange = (value: string) => {
    updateFormData({ ciclo_acreditacion_id: parseInt(value) });
  };

  const handleCriterioClick = (criterio: Criterio) => {
    // Verificar si ya está seleccionado
    const yaSeleccionado = formData.criterios_seleccionados.find(
      c => c.criterio_id === criterio.criterio_id
    );

    setCriterioSeleccionado(criterio);
    setModoEdicion(!!yaSeleccionado);
    setShowModal(true);
  };

  const handleGuardarCriterio = (criterioConfig: CriterioSeleccionado) => {
    console.log('Guardando criterio:', criterioConfig);
    console.log('Modo edición:', modoEdicion);
    
    if (modoEdicion) {
      actualizarCriterio(criterioConfig);
    } else {
      agregarCriterio(criterioConfig);
    }
    setShowModal(false);
    setCriterioSeleccionado(null);
    setModoEdicion(false);
  };

  const handleEliminarCriterio = (criterioId: number, criterioNombre: string) => {
    setCriterioAEliminar({ id: criterioId, nombre: criterioNombre });
  };

  const confirmarEliminarCriterio = () => {
    if (criterioAEliminar) {
      eliminarCriterio(criterioAEliminar.id);
      setCriterioAEliminar(null);
    }
  };

  const criterioEstaSeleccionado = (criterioId: number) => {
    const seleccionado = formData.criterios_seleccionados.some(c => c.criterio_id === criterioId);
    return seleccionado;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gris-una">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Selector de Ciclo */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-negro-una mb-4">
            Seleccionar Ciclo de Acreditación
          </h3>
          <CustomSelect
            label="Ciclo de Acreditación"
            value={formData.ciclo_acreditacion_id?.toString() || ''}
            options={cicloOptions}
            placeholder="Seleccione un ciclo..."
            onChange={handleCicloChange}
            required
            error={errors.ciclo_acreditacion_id}
          />
        </div>

        {/* Selección de Criterios */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-negro-una">
              Criterios del Compromiso
              {formData.criterios_seleccionados.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gris-una">
                  ({formData.criterios_seleccionados.length} {formData.criterios_seleccionados.length === 1 ? 'seleccionado' : 'seleccionados'})
                </span>
              )}
            </h3>
          </div>

          {errors.criterios && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <SystemIcons.interface.alert size="sm" className="text-red-600" />
              <span className="text-sm text-red-800">{errors.criterios}</span>
            </div>
          )}

          {/* Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nomenclatura o descripción..."
              />
            </div>
            <div className="flex gap-2">
              {(['todos', 'seleccionados', 'pendientes'] as const).map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    filtroEstado === estado
                      ? 'bg-rojo-una-2 text-white'
                      : 'bg-gray-100 text-gris-una hover:bg-gray-200'
                  }`}
                >
                  {estado === 'todos' ? 'Todos' : estado === 'seleccionados' ? 'Seleccionados' : 'Pendientes'}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Criterios */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {criteriosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <SystemIcons.modal.document size="lg" className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gris-una">
                  {searchTerm ? 'No se encontraron criterios' : 'No hay criterios disponibles'}
                </p>
              </div>
            ) : (
              criteriosFiltrados.map((criterio) => {
                // Validación crucial: verificar que criterio_id existe
                if (!criterio || !criterio.criterio_id) {
                  return null; // No renderizar criterios inválidos
                }
                
                const seleccionado = criterioEstaSeleccionado(criterio.criterio_id);
                const config = formData.criterios_seleccionados.find(
                  c => c.criterio_id === criterio.criterio_id
                );

                return (
                  <div
                    key={criterio.criterio_id}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      seleccionado
                        ? 'bg-green-50 border-green-200 hover:border-green-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCriterioClick(criterio)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-negro-una">
                            {criterio.nomenclatura}
                          </span>
                          {seleccionado && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 border border-green-200 rounded text-xs text-green-800 font-medium">
                              <SystemIcons.interface.checkCircle size="xs" className="w-3 h-3" />
                              Incluido
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gris-una mb-2">{criterio.descripcion}</p>
                        
                        {seleccionado && config && (
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <div className="flex flex-wrap gap-3 text-xs">
                              {config.evidencias_seleccionadas.length > 0 && (
                                <div className="flex items-center gap-1 text-gris-una">
                                  <SystemIcons.modal.document size="xs" />
                                  <span>{config.evidencias_seleccionadas.length} evidencias</span>
                                </div>
                              )}
                              {config.encargados_usuarios.length > 0 && (
                                <div className="flex items-center gap-1 text-gris-una">
                                  <SystemIcons.interface.user size="xs" />
                                  <span>{config.encargados_usuarios.length} encargado(s)</span>
                                </div>
                              )}
                              {config.fecha_limite && (
                                <div className="flex items-center gap-1 text-gris-una">
                                  <SystemIcons.interface.calendar size="xs" />
                                  <span>{new Date(config.fecha_limite).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {seleccionado && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarCriterio(criterio.criterio_id, criterio.nomenclatura);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar criterio"
                          >
                            <SystemIcons.actions.delete size="sm" />
                          </button>
                        )}
                        <SystemIcons.interface.chevronRight size="md" className="text-gris-una" />
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean) // Filtrar nulls
            )}
          </div>
        </div>
      </div>

      {/* Modal de Configuración de Criterio */}
      {showModal && criterioSeleccionado && (
        <CriterioModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setCriterioSeleccionado(null);
            setModoEdicion(false);
          }}
          criterio={criterioSeleccionado}
          configuracionExistente={
            modoEdicion
              ? formData.criterios_seleccionados.find(c => c.criterio_id === criterioSeleccionado.criterio_id)
              : undefined
          }
          onGuardar={handleGuardarCriterio}
          modoEdicion={modoEdicion}
        />
      )}

      {/* Modal de Confirmación para Eliminar */}
      <DeleteConfirmationModal
        isOpen={!!criterioAEliminar}
        onClose={() => setCriterioAEliminar(null)}
        onConfirm={confirmarEliminarCriterio}
        title="Eliminar criterio"
        itemName={criterioAEliminar?.nombre}
        message="¿Está seguro de que desea eliminar este criterio del compromiso?"
      />
    </>
  );
};
