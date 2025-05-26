import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormRowProps {
  children: ReactNode;
  className?: string;
}

export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {children}
    </div>
  );
}

interface FormGroupProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function FormGroup({ children, className, fullWidth = false }: FormGroupProps) {
  return (
    <div className={cn("space-y-2", fullWidth && "md:col-span-2", className)}>
      {children}
    </div>
  );
}

interface FormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function Form({ children, onSubmit, className }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
      {children}
    </form>
  );
}

interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function FormSection({ children, title, description, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-3", className)}>
      {children}
    </div>
  );
} 