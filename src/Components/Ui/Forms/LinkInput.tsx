/**
 * LinkInput - Componente para agregar enlaces/URLs como evidencias
 * Permite al usuario pegar o escribir URLs que se enviarán al backend
 */

import React, { useState } from 'react';
import { Input } from '@/Components/Ui/Forms/Input';
import { Button } from '@/Components/Ui/Buttons/Button';
import { validateUrl } from '@/Hooks/useUrlValidation';
import { MAX_LINKS_PER_UPLOAD } from '@/Types/FileTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { useToast } from '@/Context/ToastContext';

interface LinkInputProps {
  onLinksChange: (links: string[]) => void;
  maxLinks?: number;
  disabled?: boolean;
  className?: string;
}

export const LinkInput: React.FC<LinkInputProps> = ({
  onLinksChange,
  maxLinks = MAX_LINKS_PER_UPLOAD,
  disabled = false,
  className = ''
}) => {
  const [links, setLinks] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const { showToast } = useToast();

  const handleAddLink = () => {
    const trimmedUrl = currentInput.trim();
    
    if (!trimmedUrl) return;

    // Validar límite de enlaces
    if (links.length >= maxLinks) {
      showToast({ type: 'warning', title: 'Límite alcanzado', message: `Solo puede agregar hasta ${maxLinks} enlaces` });
      return;
    }

    // Validar URL
    const validation = validateUrl(trimmedUrl);
    if (!validation.isValid) {
      showToast({ type: 'error', title: 'URL inválida', message: validation.error || 'La URL no es válida' });
      return;
    }

    // Agregar enlace
    const newLinks = [...links, trimmedUrl];
    setLinks(newLinks);
    onLinksChange(newLinks);
    setCurrentInput('');
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    onLinksChange(newLinks);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Si pegan múltiples URLs separadas por saltos de línea
    const urls = pastedText.split(/[\n,]/).filter(url => url.trim());
    
    if (urls.length > 1) {
      e.preventDefault();
      
      // Validar y agregar todas las URLs válidas
      const validUrls: string[] = [];
      const invalidUrls: string[] = [];
      
      urls.forEach(url => {
        const trimmedUrl = url.trim();
        if (trimmedUrl) {
          const validation = validateUrl(trimmedUrl);
          if (validation.isValid) {
            validUrls.push(trimmedUrl);
          } else {
            invalidUrls.push(trimmedUrl);
          }
        }
      });
      
      // Verificar límite
      const remainingSlots = maxLinks - links.length;
      const urlsToAdd = validUrls.slice(0, remainingSlots);
      
      if (urlsToAdd.length > 0) {
        const newLinks = [...links, ...urlsToAdd];
        setLinks(newLinks);
        onLinksChange(newLinks);
      }
      
      if (validUrls.length > remainingSlots) {
        showToast({ type: 'warning', title: 'Límite alcanzado', message: `Solo se agregaron ${urlsToAdd.length} de ${validUrls.length} enlaces. Límite: ${maxLinks}` });
      }
      
      if (invalidUrls.length > 0) {
        showToast({ type: 'error', title: 'URLs inválidas', message: `${invalidUrls.length} URL(s) inválidas fueron ignoradas` });
      }
      
      setCurrentInput('');
    }
  };

  {/* TODO No está sirviendo el placeholder */}
  return (
    <div className={`${className}`}>
      {/* Input para agregar enlaces */}
      <div className="flex gap-3 items-start w-full">
        <div className="flex-1 w-full">
          <Input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder="https://drive.google.com/file"
            disabled={disabled || links.length >= maxLinks}
            variant="default"
            size="sm"
          />
        </div>
        <Button
          type="button"
          onClick={handleAddLink}
          disabled={disabled || links.length >= maxLinks || !currentInput.trim()}
          variant="primary"
          size="sm"
        >
          Agregar
        </Button>
      </div>

      {/* Mensaje informativo */}
      <p className={`${TYPOGRAPHY.form.helper} text-gray-500 mt-3`}>
        {links.length === 0 
          ? 'Puede pegar enlaces de Google Drive, YouTube, sitios web, etc.'
          : `${links.length} de ${maxLinks} enlaces agregados`}
      </p>

      {/* Lista de enlaces agregados */}
      {links.length > 0 && (
        <div className="space-y-2">
          <h4 className={`${TYPOGRAPHY.form.label} font-medium text-gray-700`}>Enlaces a subir:</h4>
          <ul className="space-y-2">
            {links.map((link, index) => (
              <li
                key={link}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-corner"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <SystemIcons.interface.link 
                    size="md" 
                    className="text-azul-una flex-shrink-0" 
                  />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${TYPOGRAPHY.body} text-azul-una hover:underline truncate`}
                    title={link}
                  >
                    {link}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  disabled={disabled}
                  className="ml-2 p-1 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed group"
                  aria-label="Eliminar enlace"
                >
                  <SystemIcons.actions.cancel 
                    size="md"
                    className="text-gray-400 group-hover:text-rojo-una-2 flex-shrink-0"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}


    </div>
  );
};

