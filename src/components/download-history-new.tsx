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
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No download history</p>
            <p className="text-sm">Completed downloads will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Download History ({history.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear}
          disabled={history.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear History
        </Button>
      </div>

      {history.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {item.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {extractDomain(item.url)}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={item.status === 'completed' ? 'default' : 'destructive'}>
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
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>Downloaded: {formatTimestamp(item.timestamp)}</p>
              </div>
              
              {item.status === 'completed' && (
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">File:</span> {item.filename}
                  </p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {item.fileSize && <span>Size: {formatFileSize(item.fileSize)}</span>}
                    {item.duration && <span>Duration: {formatDuration(item.duration)}</span>}
                  </div>
                </div>
              )}
              
              {item.status === 'failed' && item.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {item.error}
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                {item.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openFile(item.filename)}
                  >
                    <FileVideo className="h-4 w-4 mr-1" />
                    Open File
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openUrl(item.url)}
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
  );
}
