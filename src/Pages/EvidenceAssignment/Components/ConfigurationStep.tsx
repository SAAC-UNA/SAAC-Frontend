/**
 * ConfigurationStep - Tercer paso del wizard
 * Permite configurar fecha límite y comentarios adicionales
 */

import React, { useState } from 'react';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { validationRules } from '@/utils/Validation';
import type { 
  EvidenceAssignmentFormData, 
  ValidationErrors 
} from '@/Types/EvidenceAssignment';

interface ConfigurationStepProps {
  formData: EvidenceAssignmentFormData;
  updateFormData: (updates: Partial<EvidenceAssignmentFormData>) => void;
  errors: ValidationErrors;
}

export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  // Estado para errores de validación en tiempo real
  const [realtimeErrors, setRealtimeErrors] = useState<Record<string, string | undefined>>({});

  // Manejar cambio de fecha límite
  const handleDateChange = (date: string) => {
    updateFormData({ fecha_limite: date });
  };

  // Manejar cambio de comentario
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    updateFormData({ comentario: value });
  };

  // Validación en tiempo real para comentarios
  const handleCommentValidation = (value: string) => {
    const validation = validationRules.commentImmediate();
    if (!validation.validate(value)) {
      setRealtimeErrors(prev => ({
        ...prev,
        comentario: validation.message
      }));
    } else {
      setRealtimeErrors(prev => ({
        ...prev,
        comentario: undefined
      }));
    }
  };

  // Fecha mínima (hoy)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="space-y-6">

      <div className="space-y-6">
        {/* Fecha Límite */}
        <div>
          <DatePicker
            label="Fecha Límite de Entrega"
            value={formData.fecha_limite}
            onChange={handleDateChange}
            placeholder="Selecciona una fecha límite..."
            minDate={minDate}
            error={errors.fecha_limite}
            helperText="Esta fecha será informada a los destinatarios como fecha límite de entrega"
            className="max-w-md"
          />
          {/** Establecer estos mensajes en un ícono de información celeste en una esquina
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-corner">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <SystemIcons.interface.alert size="sm" className="text-amber-600 mt-0.5 flex-shrink-0" />
              <span>
                Si no estableces una fecha límite, la asignación se marcará como "sin fecha límite" 
                y los destinatarios podrán gestionar la evidencia según sus propios cronogramas.
              </span>
            </p>
          </div>
          */}
        </div>
        {/* Comentario */}
        <div>
          <Textarea
            label="Comentario sobre la Asignación"
            value={formData.comentario || ''}
            onChange={handleCommentChange}
            placeholder="Añada instrucciones especiales, contexto o notas sobre esta asignación..."
            rows={5}
            maxLength={500}
            characterCount={true}
            error={realtimeErrors.comentario || errors.comentario}
            helperText="Instrucciones opcionales para los destinatarios"
            validateOnChange={true}
            onValidateChange={handleCommentValidation}
          />
        </div>
      </div>
    </div>
  );
};