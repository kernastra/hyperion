"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Loader2, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import { useDownload } from '@/hooks/useDownload';

export default function DownloadsSidebar() {
  const { downloads, removeDownload, clearCompleted } = useDownload();

  if (downloads.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted dark:text-gray-400">
            <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No active downloads</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'pending');
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const failedDownloads = downloads.filter(d => d.status === 'failed');

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Downloads ({downloads.length})
          </CardTitle>
          {completedDownloads.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompleted}
              className="text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Active Downloads */}
        {activeDownloads.map((download) => (
          <div
            key={download.id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                  {download.title}
                </h4>
                <p className="text-xs text-text-muted dark:text-gray-400 truncate">
                  {new URL(download.url).hostname}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDownload(download.id)}
                className="p-1 h-6 w-6 text-text-muted hover:text-badge-red"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {download.status === 'pending' && (
                <Loader2 className="w-4 h-4 animate-spin text-accent-blue" />
              )}
              {download.status === 'downloading' && (
                <Loader2 className="w-4 h-4 animate-spin text-accent-blue" />
              )}
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-text-dark dark:text-white">
                    {download.status === 'pending' ? 'Preparing...' : 'Downloading...'}
                  </span>
                  <span className="text-xs text-text-muted dark:text-gray-400">
                    {download.progress}%
                  </span>
                </div>
                <Progress value={download.progress} className="h-1.5" />
              </div>
            </div>

            {download.status === 'downloading' && (download.speed || download.eta) && (
              <div className="flex justify-between text-xs text-text-muted dark:text-gray-400">
                <span>{download.speed || ''}</span>
                <span>{download.eta ? `ETA: ${download.eta}` : ''}</span>
              </div>
            )}
          </div>
        ))}

        {/* Completed Downloads */}
        {completedDownloads.map((download) => (
          <div
            key={download.id}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-accent-green flex-shrink-0" />
                  <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                    {download.title}
                  </h4>
                </div>
                <p className="text-xs text-text-muted dark:text-gray-400 truncate">
                  {download.filename || 'Download completed'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDownload(download.id)}
                className="p-1 h-6 w-6 text-text-muted hover:text-badge-red"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Failed Downloads */}
        {failedDownloads.map((download) => (
          <div
            key={download.id}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-badge-red flex-shrink-0" />
                  <h4 className="text-sm font-medium text-text-dark dark:text-white truncate">
                    {download.title}
                  </h4>
                </div>
                <p className="text-xs text-badge-red truncate">
                  {download.error || 'Download failed'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDownload(download.id)}
                className="p-1 h-6 w-6 text-text-muted hover:text-badge-red"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
