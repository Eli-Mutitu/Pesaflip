"use client";

import * as React from "react";

import type { Toast, ToasterToast } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToastActionElement = React.ReactElement<any, string | React.JSXElementConstructor<any>>;
export type ToasterToastProps = ToasterToast & {
  action?: ToasterToastActionElement;
};

// Unique ID for each toast
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

// Create a context
type ToastContextType = {
  toasts: ToasterToastProps[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Toast) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    ...context,
    toast: (props: Toast) => {
      context.addToast(props);
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        context.removeToast(toastId);
      }
    },
  };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToastProps[]>([]);

  const addToast = React.useCallback((toast: Toast) => {
    setToasts((currentToasts) => {
      // Create a new toast
      const id = genId();
      const newToast = {
        ...toast,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) {
            setToasts((currentToasts) =>
              currentToasts.map((t) => (t.id === id ? { ...t, open: false } : t))
            );

            setTimeout(() => {
              setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
            }, TOAST_REMOVE_DELAY);
          }
        },
      };

      // If we're already at the limit, remove the oldest toast
      if (currentToasts.length >= TOAST_LIMIT) {
        return [...currentToasts.slice(1), newToast];
      }

      return [...currentToasts, newToast];
    });
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }, []);

  const updateToast = React.useCallback((id: string, toast: Toast) => {
    setToasts((currentToasts) =>
      currentToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export { type Toast }; 