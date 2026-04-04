/**
 * CreationStep - Paso 1 del wizard de creación de compromisos
 * Permite seleccionar ciclo y criterios con sus evidencias
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { DataTable } from '@/components/index';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type {
  CompromisoFormData,
  CicloAcreditacion,
  Criterio,
  CriterioSeleccionado,
  ValidationErrors
} from '@/Types/ImprovementCommitmentTypes';
import { CriterionModal } from '@/Pages/ImprovementCommitments/Components/CriterionModal';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { TABLE_ACTION_BUTTON, TABLE_COLUMN_WIDTHS } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { truncateText } from '@/Utils';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { CRITERIO_SELECTION_STATUS_BADGE } from '@/Constants/StatusBadges';
import { Card } from '@/Components/Ui/Layout/Card';

interface CreationStepProps {
  formData: CompromisoFormData;
  updateFormData: (updates: Partial<CompromisoFormData>) => void;
  agregarCriterio: (criterio: CriterioSeleccionado) => void;
  eliminarCriterio: (criterioId: number) => void;
  actualizarCriterio: (criterio: CriterioSeleccionado) => void;
  errors: ValidationErrors;
  searchTerm: string;
  statusFilter: StatusFilter;
}

export type StatusFilter = 'todos' | 'seleccionados' | 'pendientes';

export const CreationStep: React.FC<CreationStepProps> = ({
  formData,
  updateFormData,
  agregarCriterio: addCriterion,
  eliminarCriterio: deleteCriterion,
  actualizarCriterio: updateCriterion,
  errors,
  searchTerm,
  statusFilter,
}) => {
  const [catalogState, setCatalogState] = useState<{ ciclos: CicloAcreditacion[]; criterios: Criterio[]; loading: boolean }>({ ciclos: [], criterios: [], loading: true });
  const ciclos = catalogState.ciclos;
  const criterios = catalogState.criterios;
  const loading = catalogState.loading;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const firstColumn = useFirstColumnConfig();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);
  
  // Modal state
  const [modalState, setModalState] = useState<{ showModal: boolean; selectedCriterion: Criterio | null; editMode: boolean }>({ showModal: false, selectedCriterion: null, editMode: false });
  const showModal = modalState.showModal;
  const selectedCriterion = modalState.selectedCriterion;
  const editMode = modalState.editMode;
  const [criterionToDelete, setCriterionToDelete] = useState<{ id: number; nombre: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setCatalogState(prev => ({ ...prev, loading: true }));
      const [ciclosData, criteriosData] = await Promise.all([
        improvementCommitmentService.obtenerCiclosAcreditacion(),
        improvementCommitmentService.obtenerCriterios({ activo: true })
      ]);

      setCatalogState({ ciclos: ciclosData, criterios: criteriosData, loading: false });
    } catch (error) {
      console.error('Error cargando datos:', error);
      setCatalogState(prev => ({ ...prev, loading: false }));
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
    if (statusFilter === 'seleccionados') {
      const idsSeleccionados = formData.criterios_seleccionados.map(c => c.criterio_id);
      filtered = filtered.filter(c => idsSeleccionados.includes(c.criterio_id));
    } else if (statusFilter === 'pendientes') {
      const idsSeleccionados = formData.criterios_seleccionados.map(c => c.criterio_id);
      filtered = filtered.filter(c => !idsSeleccionados.includes(c.criterio_id));
    }

    return filtered;
  }, [criterios, searchTerm, statusFilter, formData.criterios_seleccionados]);

  // Paginación
  const totalPages = Math.ceil(criteriosFiltrados.length / itemsPerPage);
  const paginatedCriterios = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return criteriosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [criteriosFiltrados, currentPage, itemsPerPage]);

  const handleCicloChange = (value: string) => {
    updateFormData({ ciclo_acreditacion_id: parseInt(value) });
  };

  const handleCriterioClick = (criterio: Criterio) => {
    // Verificar si ya está seleccionado
    const yaSeleccionado = formData.criterios_seleccionados.find(
      c => c.criterio_id === criterio.criterio_id
    );

    setModalState({ showModal: true, selectedCriterion: criterio, editMode: !!yaSeleccionado });
  };

  const handleSaveCriterion = (criterioConfig: CriterioSeleccionado) => {
    console.log('Guardando criterio:', criterioConfig);
    console.log('Modo edición:', editMode);
    
    if (editMode) {
      updateCriterion(criterioConfig);
    } else {
      addCriterion(criterioConfig);
    }
    setModalState({ showModal: false, selectedCriterion: null, editMode: false });
  };

  const handleDeleteCriterion = (criterioId: number, criterioNombre: string) => {
    setCriterionToDelete({ id: criterioId, nombre: criterioNombre });
  };

  const confirmDeleteCriterion = () => {
    if (criterionToDelete) {
      deleteCriterion(criterionToDelete.id);
      setCriterionToDelete(null);
    }
  };

  const columns: DataTableColumn<Criterio>[] = useMemo(() => [
    {
      key: 'nomenclatura',
      header: 'Criterio',
      align: 'left',
      width: firstColumn.width,
      render: (_, criterio) => (
        <div className="flex flex-col pl-2">
          <p
            className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
            title={criterio.nomenclatura}
          >
            {truncateText(criterio.nomenclatura, firstColumn.maxLength)}
          </p>
          <p
            className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`}
            title={criterio.descripcion}
          >
            {truncateText(criterio.descripcion, firstColumn.maxLength)}
          </p>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, criterio) => {
        const seleccionado = formData.criterios_seleccionados.some(
          c => c.criterio_id === criterio.criterio_id
        );
        return (
          <div className="flex justify-center">
            <StatusBadge
              label={seleccionado ? CRITERIO_SELECTION_STATUS_BADGE.seleccionado.label : CRITERIO_SELECTION_STATUS_BADGE.pendiente.label}
              colorClasses={
                seleccionado
                  ? CRITERIO_SELECTION_STATUS_BADGE.seleccionado.colorClasses
                  : CRITERIO_SELECTION_STATUS_BADGE.pendiente.colorClasses
              }
            />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.actionsLarge,
      render: (_, criterio) => {
        const seleccionado = formData.criterios_seleccionados.some(
          c => c.criterio_id === criterio.criterio_id
        );
        return (
          <div className="flex items-center justify-center gap-2 pr-2">
            <ButtonWithTooltip
              variant="tableView"
              size="sm"
              tooltip={seleccionado ? "Ya configurado" : "Configurar criterio"}
              tooltipPosition="right"
              onClick={() => !seleccionado && handleCriterioClick(criterio)}
              disabled={seleccionado}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.structure.nut size="md" />
            </ButtonWithTooltip>

            <ButtonWithTooltip
              variant="tableEdit"
              size="sm"
              tooltip={seleccionado ? "Editar configuración" : "Debe configurar primero"}
              tooltipPosition="top"
              onClick={() => seleccionado && handleCriterioClick(criterio)}
              disabled={!seleccionado}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.actions.edit className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>

            <ButtonWithTooltip
              variant="tableDelete"
              size="sm"
              tooltip={seleccionado ? "Eliminar criterio" : "No hay nada que eliminar"}
              tooltipPosition="top"
              onClick={(e) => {
                if (seleccionado) {
                  e.stopPropagation();
                  handleDeleteCriterion(criterio.criterio_id, criterio.nomenclatura);
                }
              }}
              disabled={!seleccionado}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.actions.delete className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>
          </div>
        );
      },
    },
  ], [firstColumn, formData.criterios_seleccionados]);

  if (loading) {
    return (
      <div className="relative py-12 min-h-[400px]">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Select de Ciclo */}
        <Card className="w-80">
          <CustomSelect
            label="Ciclo de Acreditación"
            value={formData.ciclo_acreditacion_id?.toString() || ''}
            options={cicloOptions}
            placeholder="Seleccione un ciclo..."
            onChange={handleCicloChange}
            required
            error={errors.ciclo_acreditacion_id}
            size="sm"
          />
        </Card>

        {/* Tabla de Criterios o Mensaje de Sin Ciclo */}
        {!formData.ciclo_acreditacion_id ? (
          <div className="bg-white rounded-lg border border-gray-200 py-16">
            <div className="text-center">
              <SystemIcons.modal.document size="lg" className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-negro-una mb-1">No hay datos disponibles</p>
              <p className="text-sm text-gris-una">Seleccione un ciclo de acreditación</p>
            </div>
          </div>
        ) : (
          <DataTable
            title=""
            data={paginatedCriterios as unknown as Record<string, unknown>[]}
            columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
            emptyMessage={searchTerm ? 'No se encontraron criterios' : 'No hay criterios disponibles'}
            searchable={false}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            }}
          />
        )}
      </div>

      {/* Modal de Configuración de Criterio */}
      {showModal && selectedCriterion && (
        <CriterionModal
          isOpen={showModal}
          onClose={() => {
            setModalState({ showModal: false, selectedCriterion: null, editMode: false });
          }}
          criterio={selectedCriterion}
          configuracionExistente={
            editMode
              ? formData.criterios_seleccionados.find(c => c.criterio_id === selectedCriterion.criterio_id)
              : undefined
          }
          onGuardar={handleSaveCriterion}
          modoEdicion={editMode}
        />
      )}

      {/* Modal de Confirmación para Eliminar */}
      <DeleteConfirmationModal
        isOpen={!!criterionToDelete}
        onClose={() => setCriterionToDelete(null)}
        onConfirm={confirmDeleteCriterion}
        title="Eliminar criterio"
        itemName={criterionToDelete?.nombre}
        message="¿Está seguro de que desea eliminar este criterio del compromiso?"
      />
    </>
  );
};
