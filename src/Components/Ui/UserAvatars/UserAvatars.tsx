import { cn } from "@/utils/ClassNames";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { DROPDOWN_VARIANTS, ITEM_VARIANTS } from "@/Constants/Animations";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/Components/Ui/Feedback/Tooltip";

export interface UserAvatarsUser {
  id: string | number;
  name?: string;
}

interface UserAvatarsProps {
  /** Lista de usuarios con id y nombre */
  users: UserAvatarsUser[];
  /** Tamaño del avatar en px (default: 40) */
  size?: number | string;
  /** Clases extra para el contenedor */
  className?: string;
  /** Máximo de avatares visibles antes de mostrar +X (default: 7) */
  maxVisible?: number;
  /** Porcentaje de superposición entre avatares (default: 60) */
  overlap?: number;
  /** Factor de escala al hacer hover (default: 1.2) */
  focusScale?: number;
  /** Mostrar avatares de derecha a izquierda (default: false) */
  isRightToLeft?: boolean;
  /** Solo superposición, sin desplazamiento al hacer hover (default: false) */
  isOverlapOnly?: boolean;
  /** Posición del tooltip (default: "bottom") */
  tooltipPlacement?: "top" | "bottom";
}

// Colores del sistema de diseño definidos en index.css @theme
const AVATAR_COLORS = [
  { bg: "bg-verde-ring", text: "text-verde-dark" },
  { bg: "bg-info-ring", text: "text-info-dark" },
  { bg: "bg-error-ring", text: "text-error-dark" },
  { bg: "bg-indigo-ring", text: "text-indigo-dark" },
  { bg: "bg-teal-ring", text: "text-teal-dark" },
  { bg: "bg-morado-ring", text: "text-morado-dark" },
  { bg: "bg-warning-ring", text: "text-warning-dark" },
] as const;

function getColorForId(id: string | number): (typeof AVATAR_COLORS)[number] {
  const key = String(id);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(name?: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Portal dropdown: lista todos los usuarios ocultos al hacer clic en la burbuja "+X"
interface OverflowDropdownPortalProps {
  users: UserAvatarsUser[];
  x: number;
  y: number;
  placement: "top" | "bottom";
  onClose: () => void;
}

function OverflowDropdownPortal({ users, x, y, placement, onClose }: OverflowDropdownPortalProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del dropdown
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const variants = placement === "bottom" ? DROPDOWN_VARIANTS : {
    ...DROPDOWN_VARIANTS,
    hidden: { ...DROPDOWN_VARIANTS.hidden, y: 8, transformOrigin: "bottom center" as const },
    visible: { ...DROPDOWN_VARIANTS.visible, y: 0, transformOrigin: "bottom center" as const },
    exit: { ...DROPDOWN_VARIANTS.exit, y: 6, transformOrigin: "bottom center" as const },
  };

  return createPortal(
    <motion.div
      ref={ref}
      role="listbox"
      aria-label="Usuarios adicionales"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "fixed",
        left: x,
        top: placement === "bottom" ? y : undefined,
        bottom: placement === "top" ? `calc(100vh - ${y}px)` : undefined,
        transform: "translateX(-50%)",
        zIndex: 9999,
        minWidth: "160px",
        maxWidth: "240px",
        maxHeight: "260px",
      }}
      className="overflow-y-auto rounded-corner-md bg-blanco-una border border-gris-light shadow-lg p-1 font-poppins custom-scrollbar"
    >
      {users.map((user, i) => {
        const color = getColorForId(user.id);
        const initials = getInitials(user.name);
        return (
          <motion.div
            key={user.id}
            custom={i}
            variants={ITEM_VARIANTS}
            initial="hidden"
            animate="visible"
            role="option"
            aria-selected={false}
            className="flex items-center gap-2 px-2 py-1.5 rounded-corner-sm hover:bg-blanco-una-2 transition-colors cursor-default"
          >
            {/* Mini burbuja */}
            <div
              className={cn(
                "shrink-0 rounded-full flex items-center justify-center select-none font-semibold text-blanco-una",
                color.bg
              )}
              style={{ width: 26, height: 26, fontSize: 10 }}
            >
              {initials}
            </div>
            <span className={cn(TYPOGRAPHY.tooltip, "text-gris-una-4 truncate")}>
              {user.name ?? "Sin nombre"}
            </span>
          </motion.div>
        );
      })}
    </motion.div>,
    document.body
  );
}

export const UserAvatars = ({
  users,
  size = 40,
  className,
  maxVisible = 7,
  isRightToLeft = false,
  isOverlapOnly = false,
  overlap = 60,
  focusScale = 1.2,
  tooltipPlacement = "bottom",
}: UserAvatarsProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ x: number; y: number } | null>(null);
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slicedUsers = users.slice(0, Math.min(maxVisible + 1, users.length + 1));
  const exceedMaxLength = users.length > maxVisible;
  const overflowUsers = exceedMaxLength ? users.slice(maxVisible) : [];

  // Solo rastrea el índice para controlar escala y desplazamiento de burbujas
  const handleEnter = (index: number) => setHoveredIndex(index);
  const handleLeave = () => setHoveredIndex(null);

  const handleOverflowClick = (index: number) => {
    const el = avatarRefs.current[index];
    if (!el) return;
    if (dropdownOpen) {
      setDropdownOpen(false);
      setDropdownPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setDropdownPos({
      x: rect.left + rect.width / 2,
      y: tooltipPlacement === "bottom" ? rect.bottom + 8 : rect.top - 8,
    });
    setDropdownOpen(true);
  };

  const handleKeyEnter = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    if ((e.key === "Enter" || e.key === " ") && exceedMaxLength && index === maxVisible) {
      handleOverflowClick(index);
    }
  };

  return (
    <>
      <div className={cn("flex items-center relative", className)}>
        {slicedUsers.map((user, index) => {
          const isHoveredOne = hoveredIndex === index;
          const isLengthBubble = exceedMaxLength && maxVisible === index;

          const diff = 1 - overlap / 100;
          // Siempre traer la burbuja hover al frente para que reciba todos los
          // pointer-events sin ser tapada por burbujas adyacentes de mayor índice.
          const zIndex = isHoveredOne
            ? slicedUsers.length + 1
            : isRightToLeft
            ? slicedUsers.length - index
            : index;

          const shouldScale =
            isHoveredOne && (!exceedMaxLength || slicedUsers.length - 1 !== index);

          const shouldShift =
            hoveredIndex !== null &&
            (isRightToLeft ? index < hoveredIndex : index > hoveredIndex) &&
            !isOverlapOnly;

          const baseGap = Number(size) * (overlap / 100);
          const neededGap = (Number(size) * (1 + focusScale)) / 2;
          const shift = Math.max(0, neededGap - baseGap);

          const color = getColorForId(user.id);
          const initials = getInitials(user.name);

          // Burbuja de exceso "+X" — dropdown propio, sin tooltip
          if (isLengthBubble) {
            return (
              <motion.div
                key={user.id}
                ref={(el: HTMLDivElement | null) => { avatarRefs.current[index] = el; }}
                role="button"
                aria-label={`Ver ${overflowUsers.length} usuarios más`}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                className="relative outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-una rounded-full cursor-pointer"
                style={{ width: size, height: size, zIndex, marginLeft: index === 0 ? 0 : -Number(size) * diff }}
                tabIndex={0}
                onClick={() => handleOverflowClick(index)}
                onKeyDown={(e) => handleKeyEnter(e, index)}
                animate={{ scale: shouldScale ? focusScale : 1, x: shouldShift ? shift * (isRightToLeft ? -1 : 1) : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <motion.div
                  className={cn(
                    "w-full h-full rounded-full border-2 border-white shadow-sm flex items-center justify-center select-none font-semibold",
                    dropdownOpen ? "bg-gris-una-2 text-blanco-una" : "bg-gris-light text-gris-una-3"
                  )}
                  style={{ fontSize: `calc(${Number(size)}px * 0.36)` }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span>+{overflowUsers.length}</span>
                </motion.div>
              </motion.div>
            );
          }

          // Avatar normal — usa el Tooltip del sistema (portal + spring)
          return (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <motion.div
                  ref={(el: HTMLDivElement | null) => { avatarRefs.current[index] = el; }}
                  role="img"
                  aria-label={user.name || "Usuario"}
                  className="relative outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-una rounded-full cursor-default"
                  style={{ width: size, height: size, zIndex, marginLeft: index === 0 ? 0 : -Number(size) * diff }}
                  tabIndex={0}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={handleLeave}
                  onFocus={() => handleEnter(index)}
                  onBlur={handleLeave}
                  animate={{ scale: shouldScale ? focusScale : 1, x: shouldShift ? shift * (isRightToLeft ? -1 : 1) : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div
                    className={cn(
                      "w-full h-full rounded-full border-2 border-white shadow-sm flex items-center justify-center select-none font-semibold",
                      color.bg, color.text
                    )}
                    style={{ fontSize: `calc(${Number(size)}px * 0.36)` }}
                  >
                    <span>{initials}</span>
                  </div>
                </motion.div>
              </TooltipTrigger>
              {user.name && (
                <TooltipContent side={tooltipPlacement}>{user.name}</TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>

      {/* Dropdown en portal — lista usuarios ocultos al clic en burbuja "+X" */}
      <AnimatePresence>
        {dropdownOpen && dropdownPos && overflowUsers.length > 0 && (
          <OverflowDropdownPortal
            users={overflowUsers}
            x={dropdownPos.x}
            y={dropdownPos.y}
            placement={tooltipPlacement}
            onClose={() => { setDropdownOpen(false); setDropdownPos(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
