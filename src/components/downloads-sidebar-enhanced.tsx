"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Trash2, 
  RotateCcw,
  Pause,
  Play,
  FolderOpen
} from 'lucide-react';
import { useDownloadManager } from '@/hooks/useDownloadManager';

export default function DownloadsSidebar() {
  const { 
    downloads, 
    activeDownloads, 
    completedDownloads, 
    failedDownloads,
    cancelDownload,
    removeDownload, 
    clearCompleted,
    clearFailed,
    clearAll,
    retryDownload 
  } = useDownloadManager();

  // Debug logging
  console.log('DownloadsSidebar render:', {
    downloads: downloads.length,
    active: activeDownloads.length,
    completed: completedDownloads.length,
    failed: failedDownloads.length
  });

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const diff = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (speed?: string) => {
    if (!speed) return '';
    return speed;
  };

  const openDownloadsFolder = () => {
    // This would need to be implemented based on the platform
    console.log('Opening downloads folder...');
  };

  if (downloads.length === 0) {
    return (
      <Card className="h-fit bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="relative">
              <Download className="w-5 h-5" />
              <div className="absolute inset-0 w-5 h-5 bg-accent-blue/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            </div>
            Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted dark:text-gray-400">
            <div className="relative mb-4">
              <Download className="w-16 h-16 mx-auto opacity-30" />
              <div className="absolute inset-0 w-16 h-16 mx-auto bg-accent-blue/10 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm font-medium mb-2">No downloads yet</p>
            <p className="text-xs">Add a video URL above to start downloading!</p>
            <div className="mt-4 text-xs text-text-muted/70 dark:text-gray-500">
              Downloads will appear here with real-time progress 📊
            </div>
            
            {/* Debug section */}
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
              <div>Downloads: {downloads.length}</div>
              <div>Active: {activeDownloads.length}</div>
              <div>Completed: {completedDownloads.length}</div>
              <div>Failed: {failedDownloads.length}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Current downloads state:', downloads);
                  const saved = localStorage.getItem('hyperion-downloads');
                  console.log('localStorage data:', saved);
                }}
                className="mt-2 h-6 text-xs"
              >
                Debug Log
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="mt-2 ml-2 h-6 text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit max-h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Downloads ({downloads.length})
          </CardTitle>
          <div className="flex gap-1">
            {completedDownloads.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                className="text-xs h-6 px-2"
                title="Clear completed"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            {failedDownloads.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFailed}
                className="text-xs h-6 px-2"
                title="Clear failed"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Download Summary */}
        {(activeDownloads.length > 0 || completedDownloads.length > 0 || failedDownloads.length > 0) && (
          <div className="flex gap-2 text-xs text-text-muted dark:text-gray-400">
            {activeDownloads.length > 0 && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {activeDownloads.length} active
              </span>
            )}
            {completedDownloads.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-accent-green" />
                {completedDownloads.length} done
              </span>
            )}
            {failedDownloads.length > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-badge-red" />
                {failedDownloads.length} failed
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Active Downloads */}
        {activeDownloads.map((download) => (
          <div
            key={download.id}
            className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-300 dark:border-blue-700 rounded-lg p-3 space-y-3 shadow-sm animate-pulse"
            style={{ animationDuration: '2s' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative">
                    <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
                    <div className="absolute inset-0 w-4 h-4 bg-accent-blue/20 rounded-full animate-ping"></div>
                  </div>
                  <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                    {download.title}
                  </h4>
                </div>
                <p className="text-xs text-text-muted dark:text-gray-400 truncate">
                  {new URL(download.url).hostname}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelDownload(download.id)}
                className="p-1 h-6 w-6 text-text-muted hover:text-badge-red hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                title="Cancel download"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text-dark dark:text-white flex items-center gap-1">
                  {download.status === 'pending' ? (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse"></div>
                      Downloading...
                    </>
                  )}
                </span>
                <span className="text-accent-blue font-bold text-sm">
                  {download.progress.toFixed(1)}%
                </span>
              </div>
              
              <div className="relative">
                <Progress value={download.progress} className="h-3 bg-gray-200 dark:bg-gray-700" />
                <div 
                  className="absolute top-0 left-0 h-3 bg-gradient-to-r from-accent-blue to-blue-400 rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${download.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {download.status === 'downloading' && (download.speed || download.eta) && (
                <div className="flex justify-between text-xs text-text-muted dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {download.speed || 'Calculating...'}
                  </span>
                  <span className="flex items-center gap-1">
                    ⏱️ {download.eta ? `${download.eta}` : 'Calculating...'}
                  </span>
                </div>
              )}
              
              <div className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1">
                ⏰ Duration: {formatDuration(download.startTime)}
              </div>
            </div>
          </div>
        ))}

        {/* Completed Downloads */}
        {completedDownloads.map((download) => (
          <div
            key={download.id}
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/20 border border-green-300 dark:border-green-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative">
                    <CheckCircle className="w-4 h-4 text-accent-green flex-shrink-0" />
                    <div className="absolute inset-0 w-4 h-4 bg-green-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                  </div>
                  <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                    {download.title}
                  </h4>
                </div>
                <p className="text-xs text-text-muted dark:text-gray-400 truncate mb-2 flex items-center gap-1">
                  <span>📁</span>
                  {download.filename || 'Download completed'}
                </p>
                <div className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1">
                  <span>✅</span>
                  Completed in {formatDuration(download.startTime, download.endTime)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openDownloadsFolder}
                  className="p-1 h-6 w-6 text-text-muted hover:text-accent-blue"
                  title="Open folder"
                >
                  <FolderOpen className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDownload(download.id)}
                  className="p-1 h-6 w-6 text-text-muted hover:text-badge-red"
                  title="Remove from list"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Failed Downloads */}
        {failedDownloads.map((download) => (
          <div
            key={download.id}
            className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-800/20 border border-red-300 dark:border-red-700 rounded-lg p-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative">
                    <AlertCircle className="w-4 h-4 text-badge-red flex-shrink-0" />
                    <div className="absolute inset-0 w-4 h-4 bg-red-400/20 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                    {download.title}
                  </h4>
                </div>
                <p className="text-xs text-badge-red truncate mb-2 flex items-center gap-1">
                  <span>❌</span>
                  {download.error || 'Download failed'}
                </p>
                <div className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1">
                  <span>⏱️</span>
                  Failed after {formatDuration(download.startTime, download.endTime)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => retryDownload(download.id)}
                  className="p-1 h-6 w-6 text-text-muted hover:text-accent-blue"
                  title="Retry download"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDownload(download.id)}
                  className="p-1 h-6 w-6 text-text-muted hover:text-badge-red"
                  title="Remove from list"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
