import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/Utils/ClassNames";
import { TYPOGRAPHY } from "@/Constants/Typography";

interface TooltipProviderProps {
  children: React.ReactNode;
}

interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  hidden?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRect: DOMRect | null;
  setTriggerRect: (rect: DOMRect | null) => void;
}

const TooltipContext = React.createContext<TooltipContextValue>({
  open: false,
  setOpen: () => {},
  triggerRect: null,
  setTriggerRect: () => {},
});

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  return (
    <TooltipContext.Provider
      value={{ open, setOpen, triggerRect, setTriggerRect }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  asChild = false,
  children,
}: TooltipTriggerProps) {
  const { setOpen, setTriggerRect } = React.useContext(TooltipContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = (rect: DOMRect) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTriggerRect(rect);
    timeoutRef.current = setTimeout(() => setOpen(true), 100);
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(false);
    setTriggerRect(null);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (asChild && React.isValidElement(children)) {
    // Fusiona los handlers sin reemplazar los del hijo
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        handleOpen(e.currentTarget.getBoundingClientRect());
        child.props.onMouseEnter?.(e);
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        handleClose();
        child.props.onMouseLeave?.(e);
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        handleOpen(e.currentTarget.getBoundingClientRect());
        child.props.onFocus?.(e);
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        handleClose();
        child.props.onBlur?.(e);
      },
    });
  }

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() =>
        wrapperRef.current &&
        handleOpen(wrapperRef.current.getBoundingClientRect())
      }
      onMouseLeave={handleClose}
      onFocus={() =>
        wrapperRef.current &&
        handleOpen(wrapperRef.current.getBoundingClientRect())
      }
      onBlur={handleClose}
    >
      {children}
    </div>
  );
}

export function TooltipContent({
  side = "right",
  align = "center",
  hidden = false,
  className,
  children,
}: TooltipContentProps) {
  const { open, triggerRect } = React.useContext(TooltipContext);

  if (hidden) return null;

  // Posición fixed calculada desde el rect del trigger
  const getFixedPosition = (): { top: number; left: number } => {
    if (!triggerRect) return { top: 0, left: 0 };
    const gap = 8;
    const cx = triggerRect.left + triggerRect.width / 2;
    const cy = triggerRect.top + triggerRect.height / 2;
    switch (side) {
      case "bottom":
        return {
          top: triggerRect.bottom + gap,
          left:
            align === "center"
              ? cx
              : align === "start"
                ? triggerRect.left
                : triggerRect.right,
        };
      case "top":
        return {
          top: triggerRect.top - gap,
          left:
            align === "center"
              ? cx
              : align === "start"
                ? triggerRect.left
                : triggerRect.right,
        };
      case "right":
        return {
          left: triggerRect.right + gap,
          top:
            align === "center"
              ? cy
              : align === "start"
                ? triggerRect.top
                : triggerRect.bottom,
        };
      case "left":
        return {
          left: triggerRect.left - gap,
          top:
            align === "center"
              ? cy
              : align === "start"
                ? triggerRect.top
                : triggerRect.bottom,
        };
    }
  };

  // Transform del div interior — framer-motion sobrescribe el transform del motion.div,
  // así que el centrado CSS va en un div hijo, igual que en el patrón AvatarTooltipPortal.
  const getInnerTransform = (): string | undefined => {
    const parts: string[] = [];
    if (align === "center") {
      if (side === "top" || side === "bottom") parts.push("translateX(-50%)");
      else parts.push("translateY(-50%)");
    }
    if (side === "top") parts.push("translateY(-100%)");
    if (side === "left") parts.push("translateX(-100%)");
    return parts.length ? parts.join(" ") : undefined;
  };

  // Dirección de la animación según el lado
  const motionY = side === "bottom" ? 6 : side === "top" ? -6 : 0;
  const motionX = side === "right" ? 6 : side === "left" ? -6 : 0;

  const { top, left } = getFixedPosition();

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="tooltip"
          initial={{ opacity: 0, y: motionY, x: motionX, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: motionY, x: motionX, scale: 0.94 }}
          transition={{
            default: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
            opacity: { duration: 0.14, ease: "easeOut" },
          }}
          style={{
            position: "fixed",
            top,
            left,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          {/* El div interior aplica el centrado — no lo toca framer-motion */}
          <div
            style={{ transform: getInnerTransform() }}
            className={cn(
              TYPOGRAPHY.tooltip,
              "font-medium text-blanco-una whitespace-nowrap",
              "bg-gris-una backdrop-blur-md border-none",
              "rounded-corner shadow-lg px-1.5 py-1",
              className,
            )}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
