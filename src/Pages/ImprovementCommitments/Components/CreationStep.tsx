/**
 * CreationStep - Paso 1 del wizard de creación de compromisos
 * Permite seleccionar ciclo y criterios con sus evidencias
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { FilterButton } from '@/Components/Ui/Buttons/FilterButton';
import type { FilterOption } from '@/Components/Ui/Buttons/FilterButton';
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
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';

interface CreationStepProps {
  formData: CompromisoFormData;
  updateFormData: (updates: Partial<CompromisoFormData>) => void;
  agregarCriterio: (criterio: CriterioSeleccionado) => void;
  eliminarCriterio: (criterioId: number) => void;
  actualizarCriterio: (criterio: CriterioSeleccionado) => void;
  errors: ValidationErrors;
}

type StatusFilter = 'todos' | 'seleccionados' | 'pendientes';

export const CreationStep: React.FC<CreationStepProps> = ({
  formData,
  updateFormData,
  agregarCriterio: addCriterion,
  eliminarCriterio: deleteCriterion,
  actualizarCriterio: updateCriterion,
  errors
}) => {
  const [catalogState, setCatalogState] = useState<{ ciclos: CicloAcreditacion[]; criterios: Criterio[]; loading: boolean }>({ ciclos: [], criterios: [], loading: true });
  const ciclos = catalogState.ciclos;
  const criterios = catalogState.criterios;
  const loading = catalogState.loading;
  const [filterState, setFilterState] = useState<{ searchTerm: string; statusFilter: StatusFilter; currentPage: number }>({ searchTerm: '', statusFilter: 'todos', currentPage: 1 });
  const searchTerm = filterState.searchTerm;
  const statusFilter = filterState.statusFilter;
  const currentPage = filterState.currentPage;
  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  
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

  const isCriterionSelected = (criterioId: number) => {
    const seleccionado = formData.criterios_seleccionados.some(c => c.criterio_id === criterioId);
    return seleccionado;
  };

  // Opciones para el filtro de estado
  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'seleccionados', label: 'Seleccionados' },
    { value: 'pendientes', label: 'Pendientes' }
  ];

  if (loading) {
    return (
      <div className="relative py-12 min-h-[400px]">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  // Configuración de columnas de la tabla
  const columns: DataTableColumn<Criterio>[] = [
    {
      key: 'nomenclatura',
      header: 'Nomenclatura',
      align: 'center',
      render: (_, criterio) => (
        <p className={`block font-sans antialiased font-semibold leading-normal text-negro-una ${TYPOGRAPHY.table.cell}`}>
          {criterio.nomenclatura}
        </p>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      align: 'left',
      render: (_, criterio) => (
        <p 
          className={`block font-sans antialiased font-normal leading-normal text-gris-una max-w-md truncate ${TYPOGRAPHY.table.cell}`}
          title={criterio.descripcion}
        >
          {criterio.descripcion}
        </p>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_, criterio) => {
        const seleccionado = isCriterionSelected(criterio.criterio_id);
        return (
          <div className="w-max mx-auto">
            <div className={`relative grid items-center px-2 py-0.5 font-sans font-bold rounded-corner select-none whitespace-nowrap text-xs min-w-[92px] justify-center text-center ${
              seleccionado
                ? 'text-green-900 bg-green-500/20' 
                : 'text-yellow-800 bg-yellow-400/20'
            }`}>
              <span>{seleccionado ? 'Seleccionado' : 'Pendiente'}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_, criterio) => {
        const seleccionado = isCriterionSelected(criterio.criterio_id);
        return (
          <div className="flex items-center justify-center gap-2 pr-2">
            {/* Tuerca - Activa cuando NO está seleccionado */}
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

            {/* Lápiz (Editar) - Activo cuando SÍ está seleccionado */}
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

            {/* Basurero - Activo cuando SÍ está seleccionado */}
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
      }
    }
  ];

  return (
    <>
      <div className="space-y-2">
        {/* Fila de controles: Ciclo + Búsqueda + Filtro */}
        <div className="flex gap-3 items-end">
          {/* Select de Ciclo */}
          <div className="w-80">
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
          </div>

          {/* Búsqueda */}
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(v) => { setFilterState(prev => ({ ...prev, searchTerm: v, currentPage: 1 })); }}
              placeholder="Buscar por nomenclatura o descripción..."
            />
          </div>

          {/* Filtro por estado - Solo ícono */}
          <div className="flex-shrink-0">
            <FilterButton
              tooltipText="Filtrar por estado"
              options={filterOptions}
              value={statusFilter}
              onChange={(v) => { setFilterState(prev => ({ ...prev, statusFilter: v as StatusFilter, currentPage: 1 })); }}
            />
          </div>
        </div>

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
              onPageChange: (page: number) => setFilterState(prev => ({ ...prev, currentPage: page }))
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
