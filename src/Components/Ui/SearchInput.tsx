import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from './Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';

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
        <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-gris-una">
          <SystemIcons.interface.search className="w-5 h-5" size="sm" />
        </div>
        
        {/* Input */}
        <input
          className={cn(
            "h-10 w-full rounded-corner border border-gris-una/5 bg-gris-una/10 px-3 py-2 !pr-9",
            `${TYPOGRAPHY.form.input} font-normal text-negro-una outline-0 transition-all duration-200`,
            "placeholder:text-gris-una/60",
            "focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent",
            disabled && "bg-gris-una/5 text-gray-400 cursor-not-allowed"
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

export default SearchInput;