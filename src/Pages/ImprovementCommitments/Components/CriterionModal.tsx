/**
 * CriterionModal - Modal para configurar un criterio del compromiso
 * Permite seleccionar evidencias, encargados, fecha límite y comentario
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Button, LoadingSpinner, MultiSelect } from '@/Components/Ui/Index';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import { userService, type User } from '@/Services/UserService';
import type { Criterio, Evidencia, CriterioSeleccionado } from '@/Types/ImprovementCommitmentTypes';
import type { MultiSelectOption } from '@/Components/Ui/Forms/MultiSelect';

interface CriterionModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterio: Criterio;
  configuracionExistente?: CriterioSeleccionado;
  onGuardar: (config: CriterioSeleccionado) => void;
  modoEdicion: boolean;
}

export const CriterionModal: React.FC<CriterionModalProps> = ({
  isOpen,
  onClose,
  criterio,
  configuracionExistente,
  onGuardar,
  modoEdicion
}) => {
  const [loading, setLoading] = useState(true);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  
  // Form state
  const [selectedEvidences, setSelectedEvidences] = useState<number[]>(
    configuracionExistente?.evidencias_seleccionadas || []
  );
  const [assignedUsers, setAssignedUsers] = useState<number[]>(
    configuracionExistente?.encargados_usuarios || []
  );
  const [fechaLimite, setFechaLimite] = useState(
    configuracionExistente?.fecha_limite || ''
  );
  const [comentario, setComentario] = useState(
    configuracionExistente?.comentario || ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, criterio.criterio_id]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!criterio?.criterio_id) {
        setEvidencias([]);
        setLoading(false);
        return;
      }

      const [evidenciasData, usuariosData] = await Promise.all([
        improvementCommitmentService.obtenerEvidenciasPorCriterio(criterio.criterio_id),
        userService.listUsers()
      ]);

      setEvidencias(evidenciasData);
      
      const transformedUsers: User[] = usuariosData.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status === 'active' ? 'active' : 'inactive',
        role: user.roles?.[0]?.name
      }));
      setUsuarios(transformedUsers);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Opciones para MultiSelect de evidencias
  const evidenciaOptions = useMemo((): MultiSelectOption[] => {
    return evidencias.map(e => ({
      value: e.evidencia_id.toString(),
      label: `${e.nomenclatura} - ${e.descripcion}`,
      disabled: false
    }));
  }, [evidencias]);

  // Opciones para MultiSelect de usuarios
  const usuarioOptions = useMemo(() => {
    return usuarios
      .filter(u => u.status === 'active')
      .map(u => ({
        id: u.id,
        label: `${u.name} (${u.email})`,
        value: u.id.toString()
      }));
  }, [usuarios]);

  const handleSelectAllEvidences = () => {
    if (selectedEvidences.length === evidencias.length) {
      setSelectedEvidences([]);
    } else {
      setSelectedEvidences(evidencias.map(e => e.evidencia_id));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedEvidences.length === 0) {
      newErrors.evidencias = 'Debe seleccionar al menos una evidencia';
    }

    if (assignedUsers.length === 0) {
      newErrors.encargados = 'Debe seleccionar al menos un usuario';
    }

    if (comentario && comentario.length > 500) {
      newErrors.comentario = 'El comentario no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = () => {
    if (!validate()) {
      return;
    }

    const config: CriterioSeleccionado = {
      criterio_id: criterio.criterio_id,
      criterio: criterio,
      evidencias_seleccionadas: selectedEvidences,
      encargados_usuarios: assignedUsers,
      encargados_roles: [],
      fecha_limite: fechaLimite || undefined,
      comentario: comentario || undefined
    };

    console.log('Config a guardar:', config);
    console.log('Criterio verificación final:', criterio);
    onGuardar(config);
  };

  const allSelected = selectedEvidences.length === evidencias.length && evidencias.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modoEdicion ? `Editar Criterio: ${criterio.nomenclatura}` : `Configurar Criterio: ${criterio.nomenclatura}`}
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Descripción del criterio */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gris-una">{criterio.descripcion}</p>
          </div>

          {/* Selección de Evidencias */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-negro-una">
                Evidencias a incluir <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSelectAllEvidences}
                className="text-xs text-rojo-una-2 hover:underline flex items-center gap-1"
              >
                <SystemIcons.interface.checkCircle size="xs" />
                {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>
            
            <MultiSelect
              label=""
              options={evidenciaOptions}
              value={selectedEvidences.map(id => id.toString())}
              onChange={(values) => setSelectedEvidences(values.map(v => parseInt(v)))}
              placeholder="Seleccione evidencias..."
              required
              showSelectAll={false}
            />
            
            {errors.evidencias && (
              <p className="mt-1 text-sm text-red-600">{errors.evidencias}</p>
            )}
            
            <p className="mt-1 text-xs text-gris-una">
              {selectedEvidences.length} de {evidencias.length} evidencias seleccionadas
            </p>
          </div>

          {/* Encargados - Usuarios */}
          <div>
            <label className="block text-sm font-medium text-negro-una mb-2">
              Usuarios encargados <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              label=""
              options={usuarioOptions}
              value={assignedUsers.map(id => id.toString())}
              onChange={(values) => setAssignedUsers(values.map(v => Number(v)))}
              placeholder="Seleccione usuarios..."
              selectAllText="Seleccionar todos"
              deselectAllText="Deseleccionar todos"
              showSelectAll={true}
              required
            />
            
            {errors.encargados && (
              <p className="mt-1 text-sm text-red-600">{errors.encargados}</p>
            )}
            
            <p className="mt-1 text-xs text-gris-una">
              {assignedUsers.length} usuario(s) seleccionado(s)
            </p>
          </div>

          {/* Fecha Límite */}
          <div>
            <DatePicker
              label="Fecha Límite"
              value={fechaLimite}
              onChange={setFechaLimite}
              placeholder="Seleccione una fecha límite..."
              minDate={new Date().toISOString().split('T')[0]}
              helperText="Fecha límite para completar este criterio"
            />
          </div>

          {/* Comentario */}
          <div>
            <Textarea
              label="Comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Instrucciones especiales o notas sobre este criterio..."
              rows={4}
              maxLength={500}
              characterCount={true}
              error={errors.comentario}
              helperText="Comentario opcional sobre este criterio"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="error"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleGuardar}
            >
              {modoEdicion ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
