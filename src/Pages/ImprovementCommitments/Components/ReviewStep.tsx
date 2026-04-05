/**
 * ReviewStep - Paso 2 del wizard de creación de compromisos
 * Permite revisar criterios seleccionados e ingresar descripción y fechas
 */

import React, { useState } from 'react';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { DateRangePicker, type DateRange } from '@/Components/Ui/Calendar/DateRangePicker';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { CompromisoFormData, CriterioSeleccionado, ElementoSeleccionado, ValidationErrors } from '@/Types/ImprovementCommitmentTypes';
import { formatDateShort, formatDateLong } from '@/Utils/DateUtils';

interface ReviewStepProps {
  formData: CompromisoFormData;
  updateFormData: (updates: Partial<CompromisoFormData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errors: ValidationErrors;
  /** Cuando viene desde Procesos, las fechas ya están definidas en el proceso */
  fromProcess?: boolean;
  /** Tipo de modelo del ciclo: 'tradicional' | 'elemento_flexible' */
  modeloTipo?: string;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  updateFormData,
  errors,
  fromProcess = false,
  modeloTipo,
}) => {
  const isFlexible = modeloTipo === 'elemento_flexible';
  const [detailModal, setDetailModal] = useState<{ open: boolean; criterion: CriterioSeleccionado | null }>({ open: false, criterion: null });
  const [elementoDetailModal, setElementoDetailModal] = useState<{ open: boolean; elemento: ElementoSeleccionado | null }>({ open: false, elemento: null });

  const handleViewDetail = (criterio: CriterioSeleccionado) => {
    setDetailModal({ open: true, criterion: criterio });
  };

  const handleViewElementoDetail = (elemento: ElementoSeleccionado) => {
    setElementoDetailModal({ open: true, elemento });
  };

  // Columnas para la tabla de elementos
  const columnsElementos: DataTableColumn<ElementoSeleccionado>[] = [
    {
      key: 'identificador',
      header: 'Identificador',
      align: 'left',
      render: (_, item) => (
        <div className="flex flex-col">
          <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {item.elemento.nombre ?? item.elemento.tipo}
          </p>
          {item.elemento.nomenclatura && (
            <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`}>
              {item.elemento.nomenclatura}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      align: 'center',
      render: (_, item) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-negro-una ${TYPOGRAPHY.table.cell}`}>
          {item.elemento.tipo}
        </p>
      ),
    },
    {
      key: 'encargados',
      header: 'Encargados',
      align: 'center',
      render: (_, item) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-negro-una ${TYPOGRAPHY.table.cell}`}>
          {item.encargados_usuarios.length + item.encargados_roles.length}
        </p>
      ),
    },
    {
      key: 'fecha_limite',
      header: 'Fecha Límite',
      align: 'center',
      render: (_, item) => (
        item.fecha_limite ? (
          <p className={`block font-sans antialiased font-normal leading-normal text-negro-una ${TYPOGRAPHY.table.cell}`}>
            {formatDateShort(item.fecha_limite)}
          </p>
        ) : (
          <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>-</p>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center">
          <ButtonWithTooltip
            variant="tableView"
            size="sm"
            tooltip="Ver detalles"
            onClick={() => handleViewElementoDetail(item)}
            className="relative h-10 max-h-[40px] w-10 max-w-[40px]"
          >
            <SystemIcons.actions.view className="h-5 w-5" />
          </ButtonWithTooltip>
        </div>
      ),
    },
  ];

  // Columnas para la tabla de criterios
  const columns: DataTableColumn<CriterioSeleccionado>[] = [
    {
      key: 'nomenclatura',
      header: 'Nomenclatura',
      align: 'center',
      render: (_, item) => (
        <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {item.criterio.nomenclatura}
        </p>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      align: 'left',
      render: (_, item) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-gris-una max-w-md truncate ${TYPOGRAPHY.table.cell}`} title={item.criterio.descripcion}>
          {item.criterio.descripcion}
        </p>
      )
    },
    {
      key: 'encargados',
      header: 'Encargados',
      align: 'center',
      render: (_, item) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-negro-una ${TYPOGRAPHY.table.cell}`}>
          {item.encargados_usuarios.length + item.encargados_roles.length}
        </p>
      )
    },
    {
      key: 'fecha_limite',
      header: 'Fecha Límite',
      align: 'center',
      render: (_, item) => (
        item.fecha_limite ? (
          <p className={`block font-sans antialiased font-normal leading-normal text-negro-una ${TYPOGRAPHY.table.cell}`}>
            {formatDateShort(item.fecha_limite)}
          </p>
        ) : (
          <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>-</p>
        )
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center">
          <ButtonWithTooltip
            variant="tableView"
            size="sm"
            tooltip="Ver detalles"
            onClick={() => handleViewDetail(item)}
            className="relative h-10 max-h-[40px] w-10 max-w-[40px]"
          >
            <SystemIcons.actions.view className="h-5 w-5" />
          </ButtonWithTooltip>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Información General del Compromiso */}
        <div>
          <h3 className="text-sm font-medium text-negro-una mb-3">
            Información General del Compromiso
          </h3>

          <div className="flex gap-4">
            {/* Descripción */}
            <div className="flex-1">
              <Textarea
                label="Descripción del Compromiso"
                value={formData.descripcion}
                onChange={(e) => updateFormData({ descripcion: e.target.value })}
                placeholder="Descripción general del compromiso de mejora (opcional)..."
                rows={5}
                maxLength={100}
                characterCount={true}
                error={errors.descripcion}
                helperText="Descripción opcional del compromiso (máximo 100 caracteres)"
              />
            </div>

            {/* Fechas — solo se muestran si no vienen del proceso */}
            {!fromProcess && (
              <div className="w-80">
                <DateRangePicker
                  label="Periodo del Compromiso"
                  value={{ from: formData.fecha_inicio, to: formData.fecha_fin }}
                  onChange={(range: DateRange) => {
                    updateFormData({
                      fecha_inicio: range?.from ?? '',
                      fecha_fin: range?.to ?? '',
                    });
                  }}
                  error={errors.fecha_inicio || errors.fecha_fin}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Elementos/Criterios Incluidos */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-negro-una">
              {isFlexible ? 'Elementos Incluidos' : 'Criterios Incluidos'}
            </h3>
            <span className="text-sm text-gris-una">
              {isFlexible
                ? `${formData.elementos_seleccionados?.length ?? 0} ${(formData.elementos_seleccionados?.length ?? 0) === 1 ? 'elemento' : 'elementos'}`
                : `${formData.criterios_seleccionados.length} ${formData.criterios_seleccionados.length === 1 ? 'criterio' : 'criterios'}`
              }
            </span>
          </div>

          {isFlexible ? (
            <DataTable
              title=""
              data={(formData.elementos_seleccionados ?? []) as unknown as Record<string, unknown>[]}
              columns={columnsElementos as unknown as import('@/Components/Ui/Table/DataTable').DataTableColumn<Record<string, unknown>>[]}
              emptyMessage="No hay elementos seleccionados. Regrese al paso anterior para agregar elementos."
              searchable={false}
            />
          ) : (
            <DataTable
              title=""
              data={formData.criterios_seleccionados as unknown as Record<string, unknown>[]}
              columns={columns as unknown as import('@/Components/Ui/Table/DataTable').DataTableColumn<Record<string, unknown>>[]}
              emptyMessage="No hay criterios seleccionados. Regrese al paso anterior para agregar criterios."
              searchable={false}
            />
          )}
        </div>
      </div>

      {/* Modal de Detalle de Criterio */}
      {detailModal.criterion && (
        <Modal
          isOpen={detailModal.open}
          onClose={() => setDetailModal({ open: false, criterion: null })}
          title={`Detalle: ${detailModal.criterion.criterio.nomenclatura}`}
          size="md"
          variant="info"
          showCancel
          cancelLabel="Cerrar"
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gris-una mb-1">Descripción</p>
              <p className="text-sm text-negro-una">{detailModal.criterion.criterio.descripcion}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gris-una mb-2">
                Evidencias seleccionadas ({detailModal.criterion.evidencias_seleccionadas.length})
              </p>
              <p className="text-sm text-gris-una">
                {detailModal.criterion.evidencias_seleccionadas.length} evidencias serán asignadas
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gris-una mb-2">Encargados</p>
              <p className="text-sm text-negro-una">
                {detailModal.criterion.encargados_usuarios.length} usuario(s) asignado(s)
              </p>
              <p className="text-sm text-negro-una mt-1">
                {detailModal.criterion.encargados_roles.length} rol(es) asignado(s)
              </p>
            </div>

            {detailModal.criterion.fecha_limite && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gris-una mb-1">Fecha límite</p>
                <p className="text-sm text-negro-una">
                  {formatDateLong(detailModal.criterion.fecha_limite)}
                </p>
              </div>
            )}

            {detailModal.criterion.comentario && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gris-una mb-1">Comentario</p>
                <p className="text-sm text-negro-una whitespace-pre-wrap">
                  {detailModal.criterion.comentario}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal de Detalle de Elemento */}
      {elementoDetailModal.elemento && (
        <Modal
          isOpen={elementoDetailModal.open}
          onClose={() => setElementoDetailModal({ open: false, elemento: null })}
          title={`Detalle: ${elementoDetailModal.elemento.elemento.nombre ?? elementoDetailModal.elemento.elemento.tipo}`}
          size="md"
          variant="info"
          showCancel
          cancelLabel="Cerrar"
        >
          <div className="space-y-4">
            {elementoDetailModal.elemento.elemento.descripcion && (
              <div>
                <p className="text-xs font-medium text-gris-una mb-1">Descripción</p>
                <p className="text-sm text-negro-una">{elementoDetailModal.elemento.elemento.descripcion}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gris-una mb-2">Encargados</p>
              <p className="text-sm text-negro-una">
                {elementoDetailModal.elemento.encargados_usuarios.length} usuario(s) asignado(s)
              </p>
              <p className="text-sm text-negro-una mt-1">
                {elementoDetailModal.elemento.encargados_roles.length} rol(es) asignado(s)
              </p>
            </div>

            {elementoDetailModal.elemento.fecha_limite && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gris-una mb-1">Fecha límite</p>
                <p className="text-sm text-negro-una">
                  {formatDateLong(elementoDetailModal.elemento.fecha_limite)}
                </p>
              </div>
            )}

            {elementoDetailModal.elemento.comentario && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gris-una mb-1">Comentario</p>
                <p className="text-sm text-negro-una whitespace-pre-wrap">
                  {elementoDetailModal.elemento.comentario}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
