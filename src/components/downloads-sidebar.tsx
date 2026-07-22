"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  RotateCcw,
  FolderOpen
} from 'lucide-react';
import { useDownloadContext } from '@/contexts/DownloadContext';

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
  } = useDownloadContext();

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const diff = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (downloads.length === 0) {
    return (
      <Card className="h-fit bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted dark:text-gray-400">
            <Download className="w-16 h-16 mx-auto opacity-20 mb-4" />
            <p className="text-sm font-medium mb-2">No downloads yet</p>
            <p className="text-xs">Add a video URL to start downloading</p>
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
              <Button variant="ghost" size="sm" onClick={clearCompleted} className="text-xs h-6 px-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Clear done
              </Button>
            )}
            {failedDownloads.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFailed} className="text-xs h-6 px-2">
                <AlertCircle className="w-3 h-3 mr-1" />
                Clear failed
              </Button>
            )}
          </div>
        </div>

        {(activeDownloads.length > 0 || completedDownloads.length > 0 || failedDownloads.length > 0) && (
          <div className="flex gap-3 text-xs text-text-muted dark:text-gray-400 mt-1">
            {activeDownloads.length > 0 && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {activeDownloads.length} active
              </span>
            )}
            {completedDownloads.length > 0 && (
              <span className="flex items-center gap-1 text-accent-green">
                <CheckCircle className="w-3 h-3" />
                {completedDownloads.length} done
              </span>
            )}
            {failedDownloads.length > 0 && (
              <span className="flex items-center gap-1 text-badge-red">
                <AlertCircle className="w-3 h-3" />
                {failedDownloads.length} failed
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Active Downloads */}
        {activeDownloads.map((download) => (
          <div
            key={download.id}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 className="w-3 h-3 text-accent-blue animate-spin flex-shrink-0" />
                  <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                    {download.title}
                  </h4>
                </div>
                <p className="text-xs text-text-muted dark:text-gray-400 truncate">
                  {(() => { try { return new URL(download.url).hostname; } catch { return download.url; } })()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelDownload(download.id)}
                className="p-1 h-6 w-6 text-text-muted hover:text-badge-red shrink-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted dark:text-gray-400">
                  {download.status === 'pending' ? 'Preparing...' : 'Downloading...'}
                </span>
                <span className="font-medium text-accent-blue">{download.progress.toFixed(1)}%</span>
              </div>
              <Progress value={download.progress} className="h-1.5" />
              {download.speed && (
                <div className="flex justify-between text-xs text-text-muted dark:text-gray-400">
                  <span>{download.speed}</span>
                  {download.eta && <span>ETA {download.eta}</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Completed Downloads */}
        {completedDownloads.map((download) => (
          <div
            key={download.id}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3 h-3 text-accent-green flex-shrink-0" />
                  <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                    {download.title}
                  </h4>
                </div>
                <p className="text-xs text-text-muted dark:text-gray-400 truncate">
                  {download.filename || 'Completed'} • {formatDuration(download.startTime, download.endTime)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 text-text-muted hover:text-accent-blue">
                  <FolderOpen className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeDownload(download.id)} className="p-1 h-6 w-6 text-text-muted hover:text-badge-red">
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
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3 h-3 text-badge-red flex-shrink-0" />
                  <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                    {download.title}
                  </h4>
                </div>
                <p className="text-xs text-badge-red truncate">
                  {download.error || 'Download failed'}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => retryDownload(download.id)} className="p-1 h-6 w-6 text-text-muted hover:text-accent-blue">
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeDownload(download.id)} className="p-1 h-6 w-6 text-text-muted hover:text-badge-red">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {downloads.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="w-full text-xs text-text-muted hover:text-badge-red mt-1">
            Clear All
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
