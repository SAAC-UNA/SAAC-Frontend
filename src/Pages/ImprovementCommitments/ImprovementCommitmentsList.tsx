/**
 * CompromisosList - Página de listado de compromisos de mejora
 * Muestra todos los compromisos con filtros y acciones
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { Button, LoadingSpinner, PageHeader, Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Index';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type { CompromisoMejora } from '@/Types/ImprovementCommitmentTypes';
import { DataTable } from '@/components/index';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';

export const ImprovementCommitmentsList: React.FC = () => {
  const moduleInfo = getModuleInfo('improvement_commitments');
  const navigate = useNavigate();
  
  const [commitments, setCommitments] = useState<CompromisoMejora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompromisos();
  }, []);

  const fetchCompromisos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await improvementCommitmentService.listarCompromisos({
        per_page: 50
      });
      
      setCommitments(response.data || []);
    } catch (error: any) {
      console.error('Error al cargar compromisos:', error);
      
      if (error.response) {
        if (error.response.status === 500) {
          setError('Error en el servidor. Por favor, contacte al administrador.');
        } else if (error.response.status === 403) {
          setError('No tiene permisos para ver los compromisos de mejora.');
        } else {
          setError(`Error ${error.response.status}: No se pudieron cargar los compromisos`);
        }
      } else {
        setError('Error de conexión. Verifique que el servidor esté funcionando.');
      }
      setCommitments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommitments = commitments;
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCommitments.length / itemsPerPage);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCommitments.slice(start, end);
  }, [filteredCommitments, currentPage]);
  
  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetail = (id: number) => {
    navigate(`/compromisos/ver/${id}`);
  };
  
  // Configuración de columnas de la tabla
  const columns: DataTableColumn<CompromisoMejora>[] = [
    {
      key: 'descripcion',
      header: 'Descripción',
      align: 'left',
      render: (_, compromiso) => (
        <p 
          className={`block font-sans antialiased font-normal leading-normal text-gris-una max-w-md truncate ${TYPOGRAPHY.table.cell}`}
          title={compromiso.descripcion || 'Sin descripción'}
        >
          {compromiso.descripcion || 'Sin descripción'}
        </p>
      )
    },
    {
      key: 'fecha_inicio',
      header: 'Fecha Inicio',
      align: 'center',
      render: (_, compromiso) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>
          {formatDate(compromiso.fecha_inicio)}
        </p>
      )
    },
    {
      key: 'fecha_fin',
      header: 'Fecha Fin',
      align: 'center',
      render: (_, compromiso) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>
          {formatDate(compromiso.fecha_fin)}
        </p>
      )
    },
    {
      key: 'criterios',
      header: 'Criterios',
      align: 'center',
      render: (_, compromiso) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>
          {compromiso.selecciones?.length || 0}
        </p>
      )
    },
    {
      key: 'asignaciones',
      header: 'Asignaciones',
      align: 'center',
      render: (_, compromiso) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.cell}`}>
          {compromiso.assignedEvidences?.length || 0}
        </p>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (_, compromiso) => (
        <div className="w-max mx-auto">
          <div className={`relative grid items-center px-2 py-1 font-sans font-bold rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.badge} ${
            compromiso.is_overdue 
              ? 'text-red-900 bg-red-500/20' 
              : 'text-green-900 bg-green-500/20'
          }`}>
            <span>{compromiso.is_overdue ? 'Vencido' : 'Activo'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_, compromiso) => (
        <div className="flex items-center justify-center gap-2 pr-2">
          <ButtonWithTooltip
            variant="tableView"
            size="sm"
            tooltip="Ver detalles"
            onClick={() => handleViewDetail(compromiso.compromiso_mejora_id)}
            className={TABLE_ACTION_BUTTON.button}
          >
            <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
          </ButtonWithTooltip>
        </div>
      )
    }
  ];

  return (
    <ScreenContainer>
      <PageHeader 
        title={moduleInfo.title} 
        description={moduleInfo.description}
        headerExtra={
          <div className="flex items-center gap-3">
            {/* Stats compactas */}
            {!loading && filteredCommitments.length > 0 && (
              <div className="inline-flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-700">
                  <SystemIcons.modal.document size="xs" className="w-3 h-3" />
                  {filteredCommitments.length}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border cursor-default ${
                      filteredCommitments.filter((c) => c.is_overdue).length > 0
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-200 text-green-700'
                    }`}>
                      <SystemIcons.interface.clock size="xs" className="w-3 h-3" />
                      {filteredCommitments.filter((c) => c.is_overdue).length} vencidos
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {filteredCommitments.filter((c) => c.is_overdue).length === 0
                      ? 'No hay compromisos vencidos'
                      : `${filteredCommitments.filter((c) => c.is_overdue).length} compromiso${filteredCommitments.filter((c) => c.is_overdue).length > 1 ? 's' : ''} ha${filteredCommitments.filter((c) => c.is_overdue).length > 1 ? 'n' : ''} superado su fecha límite`}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            <Button
              onClick={() => navigate('/compromisos/crear')}
              variant="secondary"
              className="gap-2"
            >
              <SystemIcons.actions.add size="sm" />
              Crear
            </Button>
          </div>
        }
      />
      <div className="space-y-6">
        {/* Stats eliminadas de aquí */}

        {/* Loading */}
        {loading ? (
          <div className="relative py-12 min-h-[400px]">
            <LoadingSpinner variant="paging" />
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md">
              <SystemIcons.interface.alert size="xl" className="mx-auto text-red-400 mb-4" />
              <h3 className="text-base font-medium text-negro-una mb-2 mt-4">{error}</h3>
              <p className="text-sm text-gris-una mb-4">
                El servidor puede no estar funcionando correctamente
              </p>
              <Button
                onClick={fetchCompromisos}
                variant="secondary"
              >
                Reintentar
              </Button>
            </div>
          </div>
        ) : filteredCommitments.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <SystemIcons.modal.document size="xl" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-base font-medium text-negro-una mb-2">
                {'No hay compromisos registrados'}
              </h3>
              <p className="text-sm text-gris-una">
                {'Utilice el botón "Crear" para registrar un nuevo compromiso de mejora'}
              </p>
            </div>
          </div>
        ) : (
          /* Tabla de Compromisos */
          <DataTable<CompromisoMejora>
            columns={columns}
            data={paginatedData}
            title=""
            searchable={false}
            pagination={totalPages > 1 ? {
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            } : undefined}
            loading={loading}
            emptyMessage="No hay compromisos registrados. Utilice el botón 'Crear' para registrar un nuevo compromiso de mejora"
            unstyled={true}
          />
        )}
      </div>
    </ScreenContainer>
  );
};
