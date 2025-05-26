"use client";

import React from "react";
import { ToastProvider as ToastProviderInternal } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProviderInternal>
      {children}
      <Toaster />
    </ToastProviderInternal>
  );
} 