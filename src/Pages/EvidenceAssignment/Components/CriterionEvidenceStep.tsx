/**
 * CriterionEvidenceStep - Primer paso del wizard
 * Permite seleccionar criterio y evidencias a asignar
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import { LoadingSpinner, MultiSelect } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import type { 
  EvidenceAssignmentFormData, 
  ValidationErrors, 
  Criterion, 
  Evidence,
  Process 
} from '@/Types/EvidenceAssignment';
import evidenceAssignmentService from '@/Services/EvidenceAssignmentService';
import type { MultiSelectOption } from '@/Components/Ui/MultiSelect';

interface CriterionEvidenceStepProps {
  formData: EvidenceAssignmentFormData;
  updateFormData: (updates: Partial<EvidenceAssignmentFormData>) => void;
  errors: ValidationErrors;
}

export const CriterionEvidenceStep: React.FC<CriterionEvidenceStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Evitar múltiples cargas

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (dataLoaded) return; // Evitar múltiples llamadas
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [processesData, criteriaData, evidencesData] = await Promise.all([
          evidenceAssignmentService.getAllProcessesWithFallback(),
          evidenceAssignmentService.getAllCriteriaWithFallback(),
          evidenceAssignmentService.getAllEvidencesWithFallback()
        ]);
        
        setProcesses(processesData);
        setCriteria(criteriaData);
        setEvidences(evidencesData);
        setDataLoaded(true);
        
        // Auto-seleccionar el primer proceso disponible (proceso activo)
        if (processesData.length > 0 && !formData.proceso_id) {
          updateFormData({
            proceso_id: processesData[0].proceso_id
          });
        }
      } catch (error) {
        console.error('Error crítico cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dataLoaded]); // Solo depender de dataLoaded

  // Opciones para el selector de criterios
  const criterionOptions = useMemo(() => {
    return criteria.map(criterion => ({
      value: criterion.id.toString(),
      label: `${criterion.nomenclatura} - ${criterion.descripcion}`
    }));
  }, [criteria]);

  // Evidencias filtradas por criterio seleccionado
  const availableEvidences = useMemo(() => {
    if (!formData.criterio_id) return [];
    return evidences.filter(evidence => evidence.criterio_id === formData.criterio_id);
  }, [evidences, formData.criterio_id]);

  // Opciones para el MultiSelect de evidencias
  const evidenceOptions = useMemo((): MultiSelectOption[] => {
    return availableEvidences.map(evidence => ({
      value: evidence.evidencia_id.toString(),
      label: `${evidence.nomenclatura} - ${evidence.descripcion}`,
      disabled: false
    }));
  }, [availableEvidences]);

  // Manejar selección de criterio
  const handleCriterionChange = (value: string) => {
    updateFormData({
      criterio_id: parseInt(value),
      selectedEvidences: []
    });
  };

  // Manejar selección de evidencias con MultiSelect
  const handleEvidenceChange = (selectedValues: string[]) => {
    const selectedIds = selectedValues.map(val => parseInt(val));
    updateFormData({ selectedEvidences: selectedIds });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-negro-una mb-3">
          Seleccione criterios y evidencias
        </h2>
        <p className="text-gris-una">
          Elija el criterio de evaluación y las evidencias específicas que desea asignar
        </p>
      </div>

      {/* Error Messages */}
      {errors.proceso && (
        <div className="p-4 bg-rojo-una-2/10 border border-rojo-una-2/20 rounded-lg flex items-center gap-3">
          <SystemIcons.interface.alert size="md" className="text-rojo-una-2" />
          <span className="text-rojo-una-2">{errors.proceso}</span>
        </div>
      )}

      {errors.evidences && (
        <div className="p-4 bg-rojo-una-2/10 border border-rojo-una-2/20 rounded-lg flex items-center gap-3">
          <SystemIcons.interface.alert size="md" className="text-rojo-una-2" />
          <span className="text-rojo-una-2">{errors.evidences}</span>
        </div>
      )}

      {/* Información del Proceso (automático) */}
      {formData.proceso_id && (
        <div className="p-3 bg-azul-una/5 border-l-4 border-azul-una rounded-r-lg">
          <div className="flex items-center gap-2">
            <SystemIcons.interface.checkCircle size="sm" className="text-azul-una" />
            <div>
              <span className="text-sm font-medium text-azul-una">Proceso activo:</span>
              <span className="ml-2 text-sm text-negro-una">
                Proceso {formData.proceso_id} - Ciclo {processes.find(p => p.proceso_id === formData.proceso_id)?.ciclo_acreditacion_id || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Criterio */}
      {formData.proceso_id && (
        <div>
          <CustomSelect
            label="Criterio de Evaluación"
            value={formData.criterio_id?.toString() || ''}
            options={criterionOptions}
            placeholder="Seleccione un criterio..."
            onChange={handleCriterionChange}
          />
        </div>
      )}

      {/* Selección de Evidencias */}
      {formData.criterio_id && (
        <div>
          <MultiSelect
            label="Evidencias a asignar"
            options={evidenceOptions}
            value={formData.selectedEvidences.map(id => id.toString())}
            onChange={handleEvidenceChange}
            placeholder="Seleccione evidencias..."
            required
            selectAllText="Seleccionar todas"
            deselectAllText="Deseleccionar todas"
            showSelectAll={true}
          />
        </div>
      )}
    </div>
  );
};