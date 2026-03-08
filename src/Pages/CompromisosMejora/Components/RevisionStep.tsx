/**
 * RevisionStep - Paso 2 del wizard de creación de compromisos
 * Permite revisar criterios seleccionados e ingresar descripción y fechas
 */

import React, { useState } from 'react';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Modal } from '@/Components/Ui/Modals/Modal';
import type { CompromisoFormData, CriterioSeleccionado, ValidationErrors } from '@/Types/ImprovementCommitmentTypes';

interface RevisionStepProps {
  formData: CompromisoFormData;
  updateFormData: (updates: Partial<CompromisoFormData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errors: ValidationErrors;
}

export const RevisionStep: React.FC<RevisionStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [criterioDetalle, setCriterioDetalle] = useState<CriterioSeleccionado | null>(null);

  const handleVerDetalle = (criterio: CriterioSeleccionado) => {
    setCriterioDetalle(criterio);
    setShowDetalleModal(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Información del Compromiso */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-negro-una mb-4">
            Información General del Compromiso
          </h3>

          <div className="space-y-4">
            {/* Descripción */}
            <div>
              <Textarea
                label="Descripción del Compromiso"
                value={formData.descripcion}
                onChange={(e) => updateFormData({ descripcion: e.target.value })}
                placeholder="Descripción general del compromiso de mejora (opcional)..."
                rows={3}
                maxLength={100}
                characterCount={true}
                error={errors.descripcion}
                helperText="Descripción opcional del compromiso (máximo 100 caracteres)"
              />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Fecha de Inicio"
                value={formData.fecha_inicio}
                onChange={(value) => updateFormData({ fecha_inicio: value })}
                placeholder="Seleccione fecha de inicio..."
                minDate={new Date().toISOString().split('T')[0]}
                error={errors.fecha_inicio}
                required
                helperText="Fecha de inicio del compromiso"
              />

              <DatePicker
                label="Fecha de Fin"
                value={formData.fecha_fin}
                onChange={(value) => updateFormData({ fecha_fin: value })}
                placeholder="Seleccione fecha de fin..."
                minDate={formData.fecha_inicio || new Date().toISOString().split('T')[0]}
                error={errors.fecha_fin}
                required
                helperText="Fecha límite del compromiso"
              />
            </div>
          </div>
        </div>

        {/* Resumen de Criterios Seleccionados */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-negro-una">
              Criterios Incluidos
            </h3>
            <span className="text-sm text-gris-una">
              {formData.criterios_seleccionados.length} {formData.criterios_seleccionados.length === 1 ? 'criterio' : 'criterios'}
            </span>
          </div>

          {formData.criterios_seleccionados.length === 0 ? (
            <div className="text-center py-8">
              <SystemIcons.interface.alert size="lg" className="mx-auto text-yellow-400 mb-2" />
              <p className="text-sm text-gris-una">
                No hay criterios seleccionados. Regrese al paso anterior para agregar criterios.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.criterios_seleccionados.map((criterio, index) => (
                <div
                  key={criterio.criterio_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => handleVerDetalle(criterio)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gris-una">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-sm text-negro-una">
                          {criterio.criterio.nomenclatura}
                        </span>
                      </div>
                      <p className="text-sm text-gris-una mb-3">
                        {criterio.criterio.descripcion}
                      </p>

                      {/* Metadata del criterio */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                          <SystemIcons.modal.document size="sm" className="text-gris-una" />
                          <div>
                            <p className="text-xs text-gris-una">Evidencias</p>
                            <p className="text-sm font-medium text-negro-una">
                              {criterio.evidencias_seleccionadas.length}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <SystemIcons.interface.user size="sm" className="text-gris-una" />
                          <div>
                            <p className="text-xs text-gris-una">Encargados</p>
                            <p className="text-sm font-medium text-negro-una">
                              {criterio.encargados_usuarios.length}
                            </p>
                          </div>
                        </div>

                        {criterio.fecha_limite && (
                          <div className="flex items-center gap-2">
                            <SystemIcons.interface.calendar size="sm" className="text-gris-una" />
                            <div>
                              <p className="text-xs text-gris-una">Fecha límite</p>
                              <p className="text-sm font-medium text-negro-una">
                                {new Date(criterio.fecha_limite).toLocaleDateString('es-CR', {
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                        )}

                        {criterio.comentario && (
                          <div className="flex items-center gap-2">
                            <SystemIcons.interface.informationCircle size="sm" className="text-gris-una" />
                            <div>
                              <p className="text-xs text-gris-una">Comentario</p>
                              <p className="text-sm font-medium text-negro-una truncate">
                                Sí
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <SystemIcons.interface.chevronRight size="md" className="text-gris-una" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <SystemIcons.interface.informationCircle size="md" className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Información importante
              </p>
              <p className="text-sm text-blue-800">
                Una vez creado el compromiso, se asignarán automáticamente todas las evidencias
                seleccionadas a los usuarios y roles indicados. Las notificaciones serán enviadas
                a los encargados correspondientes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Criterio */}
      {showDetalleModal && criterioDetalle && (
        <Modal
          isOpen={showDetalleModal}
          onClose={() => {
            setShowDetalleModal(false);
            setCriterioDetalle(null);
          }}
          title={`Detalle: ${criterioDetalle.criterio.nomenclatura}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gris-una mb-1">Descripción</p>
              <p className="text-sm text-negro-una">{criterioDetalle.criterio.descripcion}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gris-una mb-2">
                Evidencias seleccionadas ({criterioDetalle.evidencias_seleccionadas.length})
              </p>
              <p className="text-sm text-negro-una">
                {criterioDetalle.evidencias_seleccionadas.length} evidencias serán asignadas
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gris-una mb-2">Encargados</p>
              <p className="text-sm text-negro-una">
                {criterioDetalle.encargados_usuarios.length} usuario(s) asignado(s)
              </p>
            </div>

            {criterioDetalle.fecha_limite && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gris-una mb-1">Fecha límite</p>
                <p className="text-sm text-negro-una">
                  {new Date(criterioDetalle.fecha_limite).toLocaleDateString('es-CR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {criterioDetalle.comentario && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gris-una mb-1">Comentario</p>
                <p className="text-sm text-negro-una whitespace-pre-wrap">
                  {criterioDetalle.comentario}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
