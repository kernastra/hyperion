"use client";

import { useState, useCallback } from 'react';

interface DownloadProgress {
  id: string;
  url: string;
  title?: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  speed?: string;
  eta?: string;
  filename?: string;
  error?: string;
}

interface DownloadOptions {
  format?: string;
  quality?: string;
  audioOnly?: boolean;
  outputPath?: string;
}

export function useDownload() {
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);

  const startDownload = useCallback(async (
    url: string, 
    options: DownloadOptions = {},
    videoTitle?: string
  ) => {
    const downloadId = Date.now().toString();
    
    // Add initial download entry
    const newDownload: DownloadProgress = {
      id: downloadId,
      url,
      title: videoTitle || 'Video Download',
      status: 'pending',
      progress: 0,
    };

    setDownloads(prev => [...prev, newDownload]);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          format: options.format || 'best',
          quality: options.quality || 'best',
          audioOnly: options.audioOnly || false,
          outputPath: options.outputPath,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start download');
      }

      // Handle Server-Sent Events for real-time progress
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        setDownloads(prev => 
          prev.map(d => 
            d.id === downloadId 
              ? { ...d, status: 'downloading' as const }
              : d
          )
        );

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              setDownloads(prev => 
                prev.map(d => {
                  if (d.id !== downloadId) return d;
                  
                  switch (data.type) {
                    case 'progress':
                      return {
                        ...d,
                        progress: data.progress || 0,
                        speed: data.speed,
                        eta: data.eta,
                      };
                    case 'complete':
                      return {
                        ...d,
                        status: 'completed' as const,
                        progress: 100,
                        filename: data.filename,
                      };
                    case 'error':
                      return {
                        ...d,
                        status: 'failed' as const,
                        error: data.message,
                      };
                    default:
                      return d;
                  }
                })
              );
            } catch (parseError) {
              console.error('Failed to parse download progress:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloads(prev => 
        prev.map(d => 
          d.id === downloadId 
            ? { 
                ...d, 
                status: 'failed' as const, 
                error: error instanceof Error ? error.message : 'Download failed' 
              }
            : d
        )
      );
    }

    return downloadId;
  }, []);

  const removeDownload = useCallback((id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setDownloads(prev => prev.filter(d => d.status !== 'completed'));
  }, []);

  return {
    downloads,
    startDownload,
    removeDownload,
    clearCompleted,
  };
}
