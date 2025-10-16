import React from 'react';
import { useSidebar } from '@/Context/SidebarContext';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { cn } from '@/utils/ClassNames';

interface AppHeaderProps {
  className?: string;
  title?: string;
  logo?: string;
  logoAlt?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  className,
  title = "Sistema SAAC",
  logo = "/Images/SAAC.png",
  logoAlt = "SAAC Logo"
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 bg-white px-4 shadow-sm">
      {/* Botón hamburguesa */}
      <button
        type="button"
        onClick={() => toggleSidebar()}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 w-10 p-2.5"
      >
        <SystemIcons.navigation.menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <img src={logo} alt={logoAlt} className="h-8 w-8" />

      {/* Título */}
      <h1 className="text-lg text-negro-una font-semibold">
        {title}
      </h1>
    </header>
  );
};