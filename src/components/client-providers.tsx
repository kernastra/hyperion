"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { DownloadProvider } from "@/contexts/DownloadContext";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DownloadProvider>
        {children}
      </DownloadProvider>
    </ThemeProvider>
  );
}
