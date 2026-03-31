import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '../Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Buscar...",
  value = "",
  onChange,
  className,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={cn("w-full sm:w-72", className)}>
      <div className="relative w-full">
        {/* Search Icon */}
        <div className="absolute top-2/4 right-3 -translate-y-2/4 text-gris-una">
          <SystemIcons.interface.search className={ICON_SIZES.sm} />
        </div>
        
        {/* Input */}
        <input
          className={cn(
            "h-10 w-full rounded-corner bg-blanco-una px-3 py-2 !pr-9 shadow-sm",
            `${TYPOGRAPHY.form.input} font-normal text-negro-una outline-0 transition-all duration-200`,
            "placeholder:text-gris-una/60",
            "focus:outline-none focus:border-gris-una hover:border-gris-una/50",
            disabled && "bg-blanco-una-2 border-blanco-una-2 text-gris-una cursor-not-allowed"
          )}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
