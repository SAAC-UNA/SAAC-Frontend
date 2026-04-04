import React from "react";
import { useSidebar } from "@/Context/SidebarContext";
import IsotipoSAAC from "@/Assets/IsotipoSAAC.svg?react";
import { SidebarItem } from "./SidebarItem";
import { getNavigationItems } from "@/Navigation";
import { SidebarNavProvider } from "./SidebarNavProvider";
import { cn } from "@/Utils/ClassNames";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/Components/Ui/Layout/Sheet";
import { TooltipProvider } from "@/Components/Ui/Feedback/Tooltip";
import { useAuth } from "@/Context/AuthContext";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { UserWidget } from "./UserBar";

interface SidebarProps {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  className?: string;
  title?: string;
}

export const ModernSidebar: React.FC<SidebarProps> = ({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  title = "SAAC",
  className,
}) => {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const { user } = useAuth();

  const navItems = getNavigationItems({
    roles: user?.roles?.map((r) => r.name),
    permissions: user?.all_permissions?.map((p) => p.name),
  });

  // Contenido completo para mobile (Sheet expandido)
  const mobileContent = (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 h-20 flex justify-center items-center overflow-hidden px-3">
        <a
          href="https://www.una.ac.cr/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 min-w-0"
        >
          <IsotipoSAAC
            aria-label="Universidad Nacional de Costa Rica"
            className="flex-shrink-0 size-icon-logo cursor-pointer text-rojo-una-2"
          />
          <h1
            className={cn(
              `${TYPOGRAPHY.pageTitle} text-rojo-una-2 font-semibold whitespace-nowrap`,
            )}
          >
            {title}
          </h1>
        </a>
      </div>
      <nav className="flex-1 py-15 overflow-hidden">
        <SidebarNavProvider isCollapsed={false}>
          <div className="space-y-2 flex flex-col px-2">
            {navItems.map((item) => (
              <SidebarItem key={item.id} item={item} isCollapsed={false} />
            ))}
          </div>
        </SidebarNavProvider>
      </nav>
    </div>
  );

  // Contenido desktop: siempre icon-only, sin contenedor
  const desktopContent = (
    <div className="flex flex-col h-full">
      {/* Logo — solo ícono */}
      <div className="flex-shrink-0 h-20 flex justify-center items-center">
        <a
          href="https://www.una.ac.cr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IsotipoSAAC
            aria-label="Universidad Nacional de Costa Rica"
            className="flex-shrink-0 size-icon-logo cursor-pointer text-rojo-una-2"
          />
        </a>
      </div>

      {/* Navegación — siempre colapsada */}
      <nav className="flex-1 py-2 overflow-hidden">
        <SidebarNavProvider isCollapsed={true}>
          <div className="space-y-2 flex flex-col items-center">
            {navItems.map((item) => (
              <SidebarItem key={item.id} item={item} isCollapsed={true} />
            ))}
          </div>
        </SidebarNavProvider>
      </nav>

      {/* Botones de usuario — al fondo */}
      <div className="flex-shrink-0 pb-6 flex flex-col items-center">
        <UserWidget collapsed showNotifications />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="bg-rojo-una-2 text-blanco-una w-[var(--sidebar-width-mobile)] p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>
              Navegación lateral del sistema SAAC.
            </SheetDescription>
          </SheetHeader>
          {mobileContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <TooltipProvider>
      <div
        className="group peer hidden md:block"
        data-state="collapsed"
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
      >
        {/* Espaciador — siempre ancho de íconos */}
        <div className="relative bg-transparent w-[calc(var(--sidebar-width-icon)+1.5rem)]" />

        {/* Sidebar sin contenedor: solo íconos flotantes */}
        <div
          className={cn(
            "fixed z-10 hidden md:flex",
            "w-[var(--sidebar-width-icon)]",
            side === "left" ? "inset-y-3 left-3" : "inset-y-3 right-3",
            className,
          )}
        >
          <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
            {desktopContent}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
