"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Trash2, FileVideo, Clock } from "lucide-react";

interface HistoryItem {
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

interface DownloadHistoryProps {
  history: HistoryItem[];
  onClear: () => void;
}

export function DownloadHistory({ history, onClear }: DownloadHistoryProps) {
  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown duration';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const openFile = (filename: string) => {
    // In a real implementation, this would open the file
    // For now, we'll just show an alert
    alert(`Opening file: ${filename}`);
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  if (history.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
        <CardContent className="p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Download className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No download history</h3>
            <p className="text-sm">Completed downloads will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Download History
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                {history.length}
              </Badge>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClear}
              disabled={history.length === 0}
              className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear History
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id} className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate text-gray-900 dark:text-gray-100">
                    {item.title || 'Video Download'}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    🌐 {extractDomain(item.url)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge className={
                    item.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-0' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-0'
                  }>
                    {item.status === 'completed' ? (
                      <FileVideo className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {item.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-2">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Downloaded: {formatTimestamp(item.timestamp)}
                  </p>
                </div>
                
                {item.status === 'completed' && (
                  <div className="space-y-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">📁 File:</span> {item.filename}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.fileSize && <span>💾 {formatFileSize(item.fileSize)}</span>}
                      {item.duration && <span>⏱️ {formatDuration(item.duration)}</span>}
                    </div>
                  </div>
                )}
                
                {item.status === 'failed' && item.error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="flex items-center gap-2">
                      ⚠️ {item.error}
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  {item.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openFile(item.filename)}
                      className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                    >
                      <FileVideo className="h-4 w-4 mr-1" />
                      Open File
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUrl(item.url)}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Original URL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
