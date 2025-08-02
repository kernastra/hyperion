'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DownloadForm } from './download-form';
import { DownloadQueue } from './download-queue';
import { DownloadHistory } from './download-history';

export interface Download {
  id: string;
  url: string;
  title: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  speed?: string;
  eta?: string;
  filename?: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  filename: string;
  status: 'completed' | 'failed';
  timestamp: string;
  error?: string;
  fileSize?: number;
  duration?: number;
}

interface DownloadOptions {
  format: string;
  quality: string;
  audioOnly: boolean;
  outputPath?: string;
}

export function VideoDownloader() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

    const handleDownload = async (url: string, options: DownloadOptions) => {
    const downloadId = Date.now().toString();
    const newDownload: Download = {
      id: downloadId,
      url,
      title: 'Loading...',
      status: 'pending',
      progress: 0,
    };

    setDownloads(prev => [newDownload, ...prev]);

    try {
      // First, get video info
      const infoResponse = await fetch('/api/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (infoResponse.ok) {
        const videoInfo = await infoResponse.json();
        setDownloads(prev => prev.map(d => 
          d.id === downloadId 
            ? { ...d, title: videoInfo.title || 'Unknown Video' }
            : d
        ));
      }

      // Start the download
      const downloadResponse = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...options }),
      });

      if (!downloadResponse.ok) {
        throw new Error(`HTTP ${downloadResponse.status}: ${downloadResponse.statusText}`);
      }

      if (!downloadResponse.body) {
        throw new Error('No response body');
      }

      const reader = downloadResponse.body.getReader();
      const decoder = new TextDecoder();

      setDownloads(prev => prev.map(d => 
        d.id === downloadId 
          ? { ...d, status: 'downloading' as const }
          : d
      ));

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'progress') {
              setDownloads(prev => prev.map(d => 
                d.id === downloadId 
                  ? { 
                      ...d, 
                      progress: data.progress,
                      speed: data.speed,
                      eta: data.eta,
                      filename: data.filename || d.filename,
                    }
                  : d
              ));
            } else if (data.type === 'complete') {
              setDownloads(prev => prev.map(d => 
                d.id === downloadId 
                  ? { 
                      ...d, 
                      status: 'completed' as const,
                      progress: 100,
                      filename: data.filename || d.filename,
                    }
                  : d
              ));

              // Add to history
              const completedDownload = downloads.find(d => d.id === downloadId);
              if (completedDownload) {
                await addToHistory({
                  url: completedDownload.url,
                  title: completedDownload.title,
                  filename: data.filename || 'Unknown',
                  status: 'completed' as const,
                });
              }
            } else if (data.type === 'error') {
              setDownloads(prev => prev.map(d => 
                d.id === downloadId 
                  ? { 
                      ...d, 
                      status: 'failed' as const,
                      error: data.message,
                    }
                  : d
              ));

              // Add to history as failed
              const failedDownload = downloads.find(d => d.id === downloadId);
              if (failedDownload) {
                await addToHistory({
                  url: failedDownload.url,
                  title: failedDownload.title,
                  filename: 'N/A',
                  status: 'failed' as const,
                  error: data.message,
                });
              }
            }
          } catch (parseError) {
            console.error('Failed to parse progress data:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      setDownloads(prev => prev.map(d => 
        d.id === downloadId 
          ? { 
              ...d, 
              status: 'failed' as const,
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          : d
      ));
    }
  };

  const addToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      await loadHistory(); // Reload history
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch('/api/history?action=clear', {
        method: 'DELETE',
      });
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const removeDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
        <Tabs defaultValue="download" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-gray-700/50 m-2 rounded-xl">
            <TabsTrigger 
              value="download" 
              className="rounded-lg font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-md transition-all"
            >
              📥 Download
            </TabsTrigger>
            <TabsTrigger 
              value="queue"
              className="rounded-lg font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-md transition-all"
            >
              🔄 Queue {downloads.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {downloads.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="rounded-lg font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-md transition-all"
            >
              📚 History {history.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  {history.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="download" className="mt-0">
              <DownloadForm onDownload={handleDownload} />
            </TabsContent>

            <TabsContent value="queue" className="mt-0">
              <DownloadQueue 
                downloads={downloads} 
                onRemove={removeDownload}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <DownloadHistory 
                history={history} 
                onClear={clearHistory}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
