"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

interface DownloadProgress {
  id: string;
  url: string;
  title?: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  progress: number;
  speed?: string;
  eta?: string;
  filename?: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

interface DownloadOptions {
  format?: string;
  quality?: string;
  audioOnly?: boolean;
  outputPath?: string;
}

export function useDownloadManager() {
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);
  const [mounted, setMounted] = useState(false);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Ensure we only run client-side logic after mounting
  useEffect(() => {
    setMounted(true);
    console.log('DownloadManager mounted');
    
    // Load downloads from localStorage
    try {
      const saved = localStorage.getItem('hyperion-downloads');
      if (saved) {
        const parsedDownloads = JSON.parse(saved);
        // Convert date strings back to Date objects
        const downloadsWithDates = parsedDownloads.map((d: any) => ({
          ...d,
          startTime: new Date(d.startTime),
          endTime: d.endTime ? new Date(d.endTime) : undefined,
        }));
        setDownloads(downloadsWithDates);
        console.log('Loaded downloads from localStorage:', downloadsWithDates);
      }
    } catch (error) {
      console.error('Failed to load downloads from localStorage:', error);
    }
  }, []);

  // Debug downloads state and save to localStorage
  useEffect(() => {
    console.log('Downloads state updated:', downloads);
    if (mounted && downloads.length > 0) {
      try {
        localStorage.setItem('hyperion-downloads', JSON.stringify(downloads));
        console.log('Saved downloads to localStorage');
      } catch (error) {
        console.error('Failed to save downloads to localStorage:', error);
      }
    }
  }, [downloads, mounted]);

  const startDownload = useCallback(async (
    url: string, 
    options: DownloadOptions = {},
    videoTitle?: string
  ) => {
    if (!mounted) return '';
    
    const downloadId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const abortController = new AbortController();
    abortControllers.current.set(downloadId, abortController);
    
    // Add initial download entry
    const newDownload: DownloadProgress = {
      id: downloadId,
      url,
      title: videoTitle || 'Video Download',
      status: 'pending',
      progress: 0,
      startTime: new Date(),
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
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to start download');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle Server-Sent Events stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Update status to downloading
      setDownloads(prev => 
        prev.map(d => 
          d.id === downloadId 
            ? { ...d, status: 'downloading' as const }
            : d
        )
      );

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);
            
            setDownloads(prev => 
              prev.map(d => {
                if (d.id !== downloadId) return d;
                
                switch (data.type) {
                  case 'progress':
                    return {
                      ...d,
                      progress: Math.min(100, Math.max(0, data.progress || 0)),
                      speed: data.speed,
                      eta: data.eta,
                      filename: data.filename || d.filename,
                    };
                  case 'complete': {
                    // Save to history
                    fetch('/api/history', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        url: d.url,
                        title: d.title || 'Unknown',
                        filename: data.filename || '',
                        status: 'completed',
                      }),
                    }).catch(() => {});
                    return {
                      ...d,
                      status: 'completed' as const,
                      progress: 100,
                      filename: data.filename,
                      endTime: new Date(),
                      speed: undefined,
                      eta: undefined,
                    };
                  }
                  case 'error': {
                    // Save failed to history (only for non-cancellation errors)
                    if (data.message && !data.message.includes('cancelled')) {
                      fetch('/api/history', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          url: d.url,
                          title: d.title || 'Unknown',
                          filename: '',
                          status: 'failed',
                          error: data.message,
                        }),
                      }).catch(() => {});
                    }
                    return {
                      ...d,
                      status: 'failed' as const,
                      error: data.message,
                      endTime: new Date(),
                    };
                  }
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

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Download was cancelled
        setDownloads(prev => 
          prev.map(d => 
            d.id === downloadId 
              ? { 
                  ...d, 
                  status: 'failed' as const, 
                  error: 'Download cancelled',
                  endTime: new Date(),
                }
              : d
          )
        );
      } else {
        console.error('Download error:', error);
        setDownloads(prev => 
          prev.map(d => 
            d.id === downloadId 
              ? { 
                  ...d, 
                  status: 'failed' as const, 
                  error: error instanceof Error ? error.message : 'Download failed',
                  endTime: new Date(),
                }
              : d
          )
        );
      }
    } finally {
      // Clean up abort controller
      abortControllers.current.delete(downloadId);
    }

    return downloadId;
  }, [mounted]);

  const cancelDownload = useCallback((id: string) => {
    const abortController = abortControllers.current.get(id);
    if (abortController) {
      abortController.abort();
      abortControllers.current.delete(id);
    }
    
    setDownloads(prev => 
      prev.map(d => 
        d.id === id 
          ? { 
              ...d, 
              status: 'failed' as const, 
              error: 'Download cancelled by user',
              endTime: new Date(),
            }
          : d
      )
    );
  }, []);

  const removeDownload = useCallback((id: string) => {
    // Cancel download if it's still active
    const abortController = abortControllers.current.get(id);
    if (abortController) {
      abortController.abort();
      abortControllers.current.delete(id);
    }
    
    setDownloads(prev => prev.filter(d => d.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setDownloads(prev => prev.filter(d => d.status !== 'completed'));
  }, []);

  const clearFailed = useCallback(() => {
    setDownloads(prev => prev.filter(d => d.status !== 'failed'));
  }, []);

  const clearAll = useCallback(() => {
    // Cancel all active downloads
    abortControllers.current.forEach((controller) => {
      controller.abort();
    });
    abortControllers.current.clear();
    
    setDownloads([]);
    
    // Clear localStorage as well
    try {
      localStorage.removeItem('hyperion-downloads');
      console.log('Cleared downloads from localStorage');
    } catch (error) {
      console.error('Failed to clear downloads from localStorage:', error);
    }
  }, []);

  const retryDownload = useCallback((id: string) => {
    const download = downloads.find(d => d.id === id);
    if (download && download.status === 'failed') {
      // Remove the failed download and start a new one
      removeDownload(id);
      // Extract options from the original download (you might want to store these)
      startDownload(download.url, {}, download.title);
    }
  }, [downloads, removeDownload, startDownload]);

  // Computed values
  const activeDownloads = downloads.filter(d => 
    d.status === 'downloading' || d.status === 'pending'
  );
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const failedDownloads = downloads.filter(d => d.status === 'failed');

  return {
    downloads,
    activeDownloads,
    completedDownloads,
    failedDownloads,
    startDownload,
    cancelDownload,
    removeDownload,
    clearCompleted,
    clearFailed,
    clearAll,
    retryDownload,
  };
}
