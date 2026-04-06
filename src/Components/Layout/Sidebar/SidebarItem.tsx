import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import type { NavItem } from "@/Types/CommonTypes";
import { cn } from "@/Utils/ClassNames";
import { useNavigationItems } from "@/Hooks/UseNavigation";
import { getIconByName } from "@/Components/Ui/Icons/SystemIcons";
import { SidebarNavContext } from "./SidebarNavContext";
import { SIDEBAR_ITEM } from "@/Constants/Components";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { buttonVariants } from "@/Components/Ui/Buttons/Button";
import { SPRING_SIDEBAR } from "@/Constants/Animations";

interface SidebarItemProps {
  item: NavItem;
  isSubItem?: boolean;
  isCollapsed?: boolean;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  item,
  isSubItem = false,
  isCollapsed = false,
}) => {
  const { handleItemClick, isItemActive } = useNavigationItems();
  const { setHoveredItem, selectedItemId } = useContext(SidebarNavContext);
  const triggerRef = useRef<HTMLDivElement>(null);

  const isActive =
    isItemActive(item.id) ||
    Boolean(
      item.isExpandable &&
      item.children?.some((child) => isItemActive(child.id)),
    );

  // Visualmente activo cuando la ruta coincide O cuando su panel está abierto
  const isExpandable = Boolean(item.isExpandable && item.children?.length);
  const isFlyoutOpen = isExpandable && selectedItemId === item.id;

  /**
   * layoutCollapsed: versión retrasada de isCollapsed.
   * Al colapsar espera a que el sidebar termine su animación antes de cambiar el padding.
   * Al expandir aplica inmediatamente.
   */
  const [layoutCollapsed, setLayoutCollapsed] = useState(() => isCollapsed);
  useEffect(() => {
    const timer = setTimeout(
      () => setLayoutCollapsed(isCollapsed),
      isCollapsed ? 320 : 0,
    );
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    if (!item.isExpandable) handleItemClick(item.id, item.href, false);
  }, [item, handleItemClick]);

  const iconName = item.icon?.replace("system-icon:", "");

  const showAnimatedBackground = isHovered || isFlyoutOpen;

  return (
    <div className={cn(isSubItem && isCollapsed && "hidden")}>
      <div
        ref={triggerRef}
        className={cn("relative", !layoutCollapsed && isSubItem && "ml-3")}
        onMouseEnter={() => {
          setIsHovered(true);
          if (isExpandable) setHoveredItem(item, triggerRef.current);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (isExpandable) setHoveredItem(null);
        }}
      >
        <button
          onClick={handleClick}
          className={cn(
            buttonVariants({ variant: "sidebarItem", size: "none" }),
            "group/btn flex items-center text-left font-medium! z-10",
            layoutCollapsed
              ? "size-sidebar-item justify-center"
              : `w-full ${SIDEBAR_ITEM.button} gap-1 justify-start`,
            isActive && !showAnimatedBackground
              ? "bg-rojo-una-2! text-blanco-una! shadow-md"
              : isActive || showAnimatedBackground
                ? "bg-transparent! text-blanco-una!"
                : "shadow-md",
          )}
        >
          {/* Fondo deslizable animado */}
          {showAnimatedBackground && (
            <motion.div
              layoutId="sidebar-hover-indicator"
              className="absolute inset-0 bg-rojo-una-2 rounded-corner -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={SPRING_SIDEBAR}
            />
          )}
          {iconName && (
            <span
              className={cn(
                "shrink-0 flex items-center justify-center",
                SIDEBAR_ITEM.icon,
              )}
            >
              {getIconByName(iconName, "md")}
            </span>
          )}

          {!layoutCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "flex-1 truncate whitespace-pre",
                TYPOGRAPHY.sidebarItem,
              )}
            >
              {item.label}
            </motion.span>
          )}

          {isExpandable && !layoutCollapsed && (
            <motion.span
              animate={{ rotate: isFlyoutOpen ? 0 : 90 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="shrink-0 ml-auto w-4 h-4 opacity-60 flex items-center justify-center"
            >
              {getIconByName("chevron-right", "sm")}
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
};

export const SidebarItem = React.memo(SidebarItemComponent);
