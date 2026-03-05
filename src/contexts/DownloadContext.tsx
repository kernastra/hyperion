"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDownloadManager } from "@/hooks/useDownloadManager";

type DownloadContextType = ReturnType<typeof useDownloadManager>;

const DownloadContext = createContext<DownloadContextType | null>(null);

export function DownloadProvider({ children }: { children: ReactNode }) {
  const downloadManager = useDownloadManager();
  return (
    <DownloadContext.Provider value={downloadManager}>
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownloadContext(): DownloadContextType {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error("useDownloadContext must be used within a DownloadProvider");
  }
  return context;
}
