/**
 * ReviewStep - Paso 2 del wizard de creación de compromisos
 * Permite revisar criterios seleccionados e ingresar descripción y fechas
 */

import React, { useState } from 'react';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { CompromisoFormData, CriterioSeleccionado, ValidationErrors } from '@/Types/ImprovementCommitmentTypes';
import { formatDateShort, formatDateLong } from '@/Utils/DateUtils';

interface ReviewStepProps {
  formData: CompromisoFormData;
  updateFormData: (updates: Partial<CompromisoFormData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errors: ValidationErrors;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [detailModal, setDetailModal] = useState<{ open: boolean; criterion: CriterioSeleccionado | null }>({ open: false, criterion: null });

  const handleViewDetail = (criterio: CriterioSeleccionado) => {
    setDetailModal({ open: true, criterion: criterio });
  };

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

            {/* Fechas */}
            <div className="w-80 space-y-4">
              <DatePicker
                label="Fecha de Inicio"
                value={formData.fecha_inicio}
                onChange={(value) => updateFormData({ fecha_inicio: value })}
                placeholder="Seleccione fecha de inicio..."
                minDate={new Date().toISOString().split('T')[0]}
                error={errors.fecha_inicio}
                required
                helperText={!formData.fecha_inicio ? "Fecha de inicio del compromiso" : undefined}
              />

              <DatePicker
                label="Fecha de Fin"
                value={formData.fecha_fin}
                onChange={(value) => updateFormData({ fecha_fin: value })}
                placeholder="Seleccione fecha de fin..."
                minDate={formData.fecha_inicio || new Date().toISOString().split('T')[0]}
                error={errors.fecha_fin}
                required
                helperText={!formData.fecha_fin ? "Fecha límite del compromiso" : undefined}
              />
            </div>
          </div>
        </div>

        {/* Criterios Incluidos */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-negro-una">
              Criterios Incluidos
            </h3>
            <span className="text-sm text-gris-una">
              {formData.criterios_seleccionados.length} {formData.criterios_seleccionados.length === 1 ? 'criterio' : 'criterios'}
            </span>
          </div>

          <DataTable
            title=""
            data={formData.criterios_seleccionados as unknown as Record<string, unknown>[]}
            columns={columns as unknown as import('@/Components/Ui/Table/DataTable').DataTableColumn<Record<string, unknown>>[]}
            emptyMessage="No hay criterios seleccionados. Regrese al paso anterior para agregar criterios."
            searchable={false}
          />
        </div>
      </div>

      {/* Modal de Detalle de Criterio */}
      {detailModal.open && detailModal.criterion && (
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
    </>
  );
};
