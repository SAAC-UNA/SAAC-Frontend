/**
 * Para cards del ancho del contenedor, usar
 * <Card className="p-4">
 */

import React from "react";
import { cn } from "@/Utils/ClassNames";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("bg-blanco-una rounded-corner shadow-md", className)}>
      {children}
    </div>
  );
};