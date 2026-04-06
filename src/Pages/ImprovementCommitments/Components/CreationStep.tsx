/**
 * CreationStep - Paso 1 del wizard de creación de compromisos
 * Permite seleccionar ciclo y criterios/elementos con sus asignaciones
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LoadingSpinner } from '@/Components/Ui/Index';
import type { SelectOption } from '@/Components/Ui/Forms/SingleSelect';
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
  ElementoSeleccionado,
  ValidationErrors
} from '@/Types/ImprovementCommitmentTypes';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import { CriterionModal } from '@/Pages/ImprovementCommitments/Components/CriterionModal';
import { ElementoModal } from '@/Pages/ImprovementCommitments/Components/ElementoModal';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { TABLE_ACTION_BUTTON, TABLE_COLUMN_WIDTHS } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { truncateText } from '@/Utils';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { CRITERIO_SELECTION_STATUS_BADGE } from '@/Constants/StatusBadges';
import { UserAvatars } from '@/Components/Ui/UserAvatars/UserAvatars';
import type { UserAvatarsUser } from '@/Components/Ui/UserAvatars/UserAvatars';

interface CreationStepProps {
  formData: CompromisoFormData;
  updateFormData: (updates: Partial<CompromisoFormData>) => void;
  agregarCriterio: (criterio: CriterioSeleccionado) => void;
  eliminarCriterio: (criterioId: number) => void;
  actualizarCriterio: (criterio: CriterioSeleccionado) => void;
  agregarElemento?: (elemento: ElementoSeleccionado) => void;
  eliminarElemento?: (elementoId: number) => void;
  actualizarElemento?: (elemento: ElementoSeleccionado) => void;
  errors: ValidationErrors;
  /** Cuando viene desde Procesos, el ciclo ya viene definido y no se puede cambiar */
  cicloFijo?: boolean;
  searchTerm: string;
  statusFilter: StatusFilter;
  /** Tipo de modelo del ciclo: 'tradicional' | 'elemento_flexible' */
  modeloTipo?: string;
  /** ID del modelo de estructura (para cargar elementos en modo flexible) */
  modeloId?: number;
  /** Callback para notificar al padre cuando las opciones del ciclo estén disponibles */
  onCiclosLoaded?: (options: SelectOption[]) => void;
}

export type StatusFilter = 'todos' | 'seleccionados' | 'pendientes';

export const CreationStep: React.FC<CreationStepProps> = ({
  formData,
  updateFormData,
  agregarCriterio: addCriterion,
  eliminarCriterio: deleteCriterion,
  actualizarCriterio: updateCriterion,
  agregarElemento,
  eliminarElemento,
  actualizarElemento,
  errors,
  cicloFijo = false,
  searchTerm,
  statusFilter,
  modeloTipo,
  modeloId,
  onCiclosLoaded,
}) => {
  const isFlexible = modeloTipo === 'elemento_flexible';

  const [catalogState, setCatalogState] = useState<{ ciclos: CicloAcreditacion[]; criterios: Criterio[]; elementos: FlexibleElement[]; loading: boolean }>({ ciclos: [], criterios: [], elementos: [], loading: true });
  const criterios = catalogState.criterios;
  const elementos = catalogState.elementos;
  const loading = catalogState.loading;

  // Detectar hojas (fuentes): elementos que nadie referencia como padre_id
  const leafElementIds = useMemo(() => {
    const parentIds = new Set(
      elementos.map(e => e.padre_id).filter((id): id is number => id !== null)
    );
    return new Set(elementos.filter(e => !parentIds.has(e.elemento_id)).map(e => e.elemento_id));
  }, [elementos]);

  // Pautas: padres directos de las hojas. Si no hay jerarquía (modelo plano), mostrar las hojas directamente.
  const listedElementos = useMemo(() => {
    const pautaIds = new Set(
      elementos
        .filter(e => leafElementIds.has(e.elemento_id) && e.padre_id !== null)
        .map(e => e.padre_id as number)
    );
    if (pautaIds.size > 0) {
      return elementos.filter(e => pautaIds.has(e.elemento_id));
    }
    return elementos.filter(e => leafElementIds.has(e.elemento_id));
  }, [elementos, leafElementIds]);

  // Hijos (fuentes) por pauta — solo cuando hay jerarquía
  const hijosDeElemento = useMemo(() => {
    const map = new Map<number, FlexibleElement[]>();
    for (const e of elementos) {
      if (e.padre_id !== null && leafElementIds.has(e.elemento_id)) {
        if (!map.has(e.padre_id)) map.set(e.padre_id, []);
        map.get(e.padre_id)!.push(e);
      }
    }
    return map;
  }, [elementos, leafElementIds]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const firstColumn = useFirstColumnConfig();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);
  
  // Modal state — criterios
  const [modalState, setModalState] = useState<{ showModal: boolean; selectedCriterion: Criterio | null; editMode: boolean }>({ showModal: false, selectedCriterion: null, editMode: false });
  const showModal = modalState.showModal;
  const selectedCriterion = modalState.selectedCriterion;
  const editMode = modalState.editMode;
  const [criterionToDelete, setCriterionToDelete] = useState<{ id: number; nombre: string } | null>(null);

  // Modal state — elementos (modelo flexible)
  const [elementoModalState, setElementoModalState] = useState<{ showModal: boolean; selectedElemento: FlexibleElement | null; selectedHijos: FlexibleElement[]; editMode: boolean }>({ showModal: false, selectedElemento: null, selectedHijos: [], editMode: false });
  const showElementoModal = elementoModalState.showModal;
  const selectedElemento = elementoModalState.selectedElemento;
  const selectedHijos = elementoModalState.selectedHijos;
  const elementoEditMode = elementoModalState.editMode;
  const [elementoToDelete, setElementoToDelete] = useState<{ id: number; nombre: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const onCiclosLoadedRef = useRef(onCiclosLoaded);
  onCiclosLoadedRef.current = onCiclosLoaded;

  const loadData = async () => {
    try {
      setCatalogState(prev => ({ ...prev, loading: true }));

      if (isFlexible && modeloId) {
        const [ciclosData, elementosData] = await Promise.all([
          improvementCommitmentService.obtenerCiclosAcreditacion(),
          improvementCommitmentService.obtenerElementosPorModelo(modeloId),
        ]);
        setCatalogState({ ciclos: ciclosData, criterios: [], elementos: elementosData, loading: false });
        const opts = ciclosData.map(c => ({
          value: c.ciclo_acreditacion_id.toString(),
          label: `${c.nombre || (c.anio ? `Ciclo ${c.anio}` : `Ciclo ${c.ciclo_acreditacion_id}`)}${c.careerCampus?.career?.nombre ? ` - ${c.careerCampus.career.nombre}` : ''}${c.careerCampus?.campus?.nombre ? ` (${c.careerCampus.campus.nombre})` : ''}`,
        }));
        onCiclosLoadedRef.current?.(opts);
      } else {
        const [ciclosData, criteriosData] = await Promise.all([
          improvementCommitmentService.obtenerCiclosAcreditacion(),
          improvementCommitmentService.obtenerCriterios({ activo: true }),
        ]);
        setCatalogState({ ciclos: ciclosData, criterios: criteriosData, elementos: [], loading: false });
        const opts = ciclosData.map(c => ({
          value: c.ciclo_acreditacion_id.toString(),
          label: `${c.nombre || (c.anio ? `Ciclo ${c.anio}` : `Ciclo ${c.ciclo_acreditacion_id}`)}${c.careerCampus?.career?.nombre ? ` - ${c.careerCampus.career.nombre}` : ''}${c.careerCampus?.campus?.nombre ? ` (${c.careerCampus.campus.nombre})` : ''}`,
        }));
        onCiclosLoadedRef.current?.(opts);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setCatalogState(prev => ({ ...prev, loading: false }));
    }
  };

  // Criterios filtrados (modelo tradicional)
  const criteriosFiltrados = useMemo(() => {
    let filtered = criterios;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nomenclatura.toLowerCase().includes(term) ||
        c.descripcion.toLowerCase().includes(term)
      );
    }
    if (statusFilter === 'seleccionados') {
      const ids = formData.criterios_seleccionados.map(c => c.criterio_id);
      filtered = filtered.filter(c => ids.includes(c.criterio_id));
    } else if (statusFilter === 'pendientes') {
      const ids = formData.criterios_seleccionados.map(c => c.criterio_id);
      filtered = filtered.filter(c => !ids.includes(c.criterio_id));
    }
    return filtered;
  }, [criterios, searchTerm, statusFilter, formData.criterios_seleccionados]);

  // Elementos filtrados (modelo flexible) — pautas o leaves en modelo plano
  const elementosFiltrados = useMemo(() => {
    let filtered = listedElementos;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        (e.nombre ?? '').toLowerCase().includes(term) ||
        (e.nomenclatura ?? '').toLowerCase().includes(term) ||
        (e.descripcion ?? '').toLowerCase().includes(term) ||
        e.tipo.toLowerCase().includes(term)
      );
    }
    const elementosSeleccionados = formData.elementos_seleccionados ?? [];
    if (statusFilter === 'seleccionados') {
      const ids = elementosSeleccionados.map(e => e.elemento_id);
      filtered = filtered.filter(e => ids.includes(e.elemento_id));
    } else if (statusFilter === 'pendientes') {
      const ids = elementosSeleccionados.map(e => e.elemento_id);
      filtered = filtered.filter(e => !ids.includes(e.elemento_id));
    }
    return filtered;
  }, [listedElementos, searchTerm, statusFilter, formData.elementos_seleccionados]);

  // Paginación — igual en ambos modelos
  const totalPages = Math.max(1, Math.ceil((isFlexible ? elementosFiltrados : criteriosFiltrados).length / itemsPerPage));
  const paginatedCriterios = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return criteriosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [criteriosFiltrados, currentPage, itemsPerPage]);
  const paginatedElementos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return elementosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [elementosFiltrados, currentPage, itemsPerPage]);

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

  // Handlers for flexible elements
  const handleElementoClick = (elemento: FlexibleElement) => {
    const yaSeleccionado = (formData.elementos_seleccionados ?? []).find(
      e => e.elemento_id === elemento.elemento_id
    );
    const hijos = hijosDeElemento.get(elemento.elemento_id) ?? [];
    setElementoModalState({ showModal: true, selectedElemento: elemento, selectedHijos: hijos, editMode: !!yaSeleccionado });
  };

  const handleSaveElemento = (config: ElementoSeleccionado) => {
    if (elementoEditMode) {
      actualizarElemento?.(config);
    } else {
      agregarElemento?.(config);
    }
    setElementoModalState({ showModal: false, selectedElemento: null, selectedHijos: [], editMode: false });
  };

  const handleDeleteElemento = (elementoId: number, nombre: string) => {
    setElementoToDelete({ id: elementoId, nombre });
  };

  const confirmDeleteElemento = () => {
    if (elementoToDelete) {
      eliminarElemento?.(elementoToDelete.id);
      setElementoToDelete(null);
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
      key: 'destinatarios',
      header: 'Destinatarios',
      align: 'center',
      width: '18%',
      render: (_, criterio) => {
        const config = formData.criterios_seleccionados.find(
          c => c.criterio_id === criterio.criterio_id
        );
        const avatars: UserAvatarsUser[] = [
          ...(config?.encargados_usuarios_info ?? config?.encargados_usuarios.map(id => ({ id, name: undefined })) ?? []),
          ...(config?.encargados_roles_info?.map(r => ({ id: `role-${r.id}`, name: r.name })) ?? config?.encargados_roles.map(id => ({ id: `role-${id}`, name: undefined })) ?? []),
        ];
        return avatars.length > 0 ? (
          <div className="flex justify-center">
            <UserAvatars users={avatars} size={28} maxVisible={5} tooltipPlacement="top" />
          </div>
        ) : (
          <span className={`${TYPOGRAPHY.table.helper} text-gris-una/50`}>Sin destinatarios</span>
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
              <SystemIcons.structure.nut className={TABLE_ACTION_BUTTON.icon} />
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

  // Columnas para tabla de elementos (modelo flexible) — misma estructura que criterios
  const columnsElementos: DataTableColumn<FlexibleElement>[] = useMemo(() => [
    {
      key: 'nomenclatura',
      header: 'Elemento',
      align: 'left',
      width: firstColumn.width,
      render: (_, elemento) => (
        <div className="flex flex-col pl-2">
          <p
            className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
            title={elemento.nomenclatura ?? elemento.nombre ?? elemento.tipo}
          >
            {truncateText(elemento.nomenclatura ?? elemento.nombre ?? elemento.tipo, firstColumn.maxLength)}
          </p>
          {(elemento.nombre || elemento.descripcion) && (
            <p
              className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`}
              title={elemento.nombre ?? elemento.descripcion ?? ''}
            >
              {truncateText(elemento.nombre ?? elemento.descripcion ?? '', firstColumn.maxLength)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, elemento) => {
        const seleccionado = (formData.elementos_seleccionados ?? []).some(
          e => e.elemento_id === elemento.elemento_id
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
      key: 'destinatarios',
      header: 'Destinatarios',
      align: 'center',
      width: '18%',
      render: (_, elemento) => {
        const config = (formData.elementos_seleccionados ?? []).find(
          e => e.elemento_id === elemento.elemento_id
        );
        const avatars: UserAvatarsUser[] = [
          ...(config?.encargados_usuarios_info ?? config?.encargados_usuarios.map(id => ({ id, name: undefined })) ?? []),
          ...(config?.encargados_roles_info?.map(r => ({ id: `role-${r.id}`, name: r.name })) ?? config?.encargados_roles.map(id => ({ id: `role-${id}`, name: undefined })) ?? []),
        ];
        return avatars.length > 0 ? (
          <div className="flex justify-center">
            <UserAvatars users={avatars} size={28} maxVisible={5} tooltipPlacement="top" />
          </div>
        ) : (
          <span className={`${TYPOGRAPHY.table.helper} text-gris-una/50`}>Sin destinatarios</span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.actionsLarge,
      render: (_, elemento) => {
        const seleccionado = (formData.elementos_seleccionados ?? []).some(
          e => e.elemento_id === elemento.elemento_id
        );
        const elementoNombre = elemento.nombre ?? elemento.nomenclatura ?? elemento.tipo;
        return (
          <div className="flex items-center justify-center gap-2 pr-2">
            <ButtonWithTooltip
              variant="tableView"
              size="sm"
              tooltip={seleccionado ? 'Ya configurado' : 'Configurar elemento'}
              tooltipPosition="right"
              onClick={() => !seleccionado && handleElementoClick(elemento)}
              disabled={seleccionado}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.structure.nut className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              variant="tableEdit"
              size="sm"
              tooltip={seleccionado ? 'Editar configuración' : 'Debe configurar primero'}
              tooltipPosition="top"
              onClick={() => seleccionado && handleElementoClick(elemento)}
              disabled={!seleccionado}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.actions.edit className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              variant="tableDelete"
              size="sm"
              tooltip={seleccionado ? 'Eliminar elemento' : 'No hay nada que eliminar'}
              tooltipPosition="top"
              onClick={(e) => {
                if (seleccionado) {
                  e.stopPropagation();
                  handleDeleteElemento(elemento.elemento_id, elementoNombre);
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
  ], [firstColumn, formData.elementos_seleccionados, hijosDeElemento]);

  if (loading) {
    return (
      <div className="relative py-12 min-h-100">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Tabla o Mensaje de Sin Ciclo */}
        {!formData.ciclo_acreditacion_id ? (
          <div className="bg-white rounded-lg border border-gray-200 py-16">
            <div className="text-center">
              <SystemIcons.modal.document size="lg" className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-negro-una mb-1">No hay datos disponibles</p>
              <p className="text-sm text-gris-una">Seleccione un ciclo de acreditación</p>
            </div>
          </div>
        ) : isFlexible ? (
          <DataTable
            title=""
            data={paginatedElementos as unknown as Record<string, unknown>[]}
            columns={columnsElementos as unknown as DataTableColumn<Record<string, unknown>>[]}
            emptyMessage={searchTerm ? 'No se encontraron elementos' : 'No hay elementos disponibles para este modelo'}
            searchable={false}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }}
          />
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
              onPageChange: setCurrentPage,
            }}
          />
        )}
      </div>

      {/* Modal de Configuración de Criterio (modelo tradicional) */}
      {showModal && selectedCriterion && (
        <CriterionModal
          isOpen={showModal}
          onClose={() => setModalState({ showModal: false, selectedCriterion: null, editMode: false })}
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

      {/* Modal de Configuración de Elemento (modelo flexible) */}
      {showElementoModal && selectedElemento && (
        <ElementoModal
          isOpen={showElementoModal}
          onClose={() => setElementoModalState({ showModal: false, selectedElemento: null, selectedHijos: [], editMode: false })}
          elemento={selectedElemento}
          hijos={selectedHijos}
          configuracionExistente={
            elementoEditMode
              ? (formData.elementos_seleccionados ?? []).find(e => e.elemento_id === selectedElemento.elemento_id)
              : undefined
          }
          onGuardar={handleSaveElemento}
          modoEdicion={elementoEditMode}
        />
      )}

      {/* Modal de Confirmación para Eliminar Criterio */}
      <DeleteConfirmationModal
        isOpen={!!criterionToDelete}
        onClose={() => setCriterionToDelete(null)}
        onConfirm={confirmDeleteCriterion}
        title="Eliminar criterio"
        itemName={criterionToDelete?.nombre}
        message="¿Está seguro de que desea eliminar este criterio del compromiso?"
      />

      {/* Modal de Confirmación para Eliminar Elemento */}
      <DeleteConfirmationModal
        isOpen={!!elementoToDelete}
        onClose={() => setElementoToDelete(null)}
        onConfirm={confirmDeleteElemento}
        title="Eliminar elemento"
        itemName={elementoToDelete?.nombre}
        message="¿Está seguro de que desea eliminar este elemento del compromiso?"
      />
    </>
  );
};
