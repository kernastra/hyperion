"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Download, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Download {
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

interface DownloadQueueProps {
  downloads: Download[];
  onRemove: (id: string) => void;
}

export function DownloadQueue({ downloads, onRemove }: DownloadQueueProps) {
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'downloading':
        return <Download className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { 
        variant: 'secondary' as const, 
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' 
      },
      downloading: { 
        variant: 'default' as const, 
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' 
      },
      completed: { 
        variant: 'default' as const, 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
      },
      failed: { 
        variant: 'destructive' as const, 
        color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
      },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;

    return (
      <Badge className={`${config.color} border-0`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const formatSpeed = (speed?: string) => {
    if (!speed) return '';
    return speed;
  };

  const formatETA = (eta?: string) => {
    if (!eta) return '';
    return `ETA: ${eta}`;
  };

  if (downloads.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
        <CardContent className="p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Download className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No downloads in queue</h3>
            <p className="text-sm">Add URLs in the Download tab to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {downloads.map((download) => (
        <Card key={download.id} className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate text-gray-900 dark:text-gray-100">
                  {download.title || 'Video Download'}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {download.url}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {getStatusBadge(download.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(download.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2">
            {download.status === 'downloading' && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {download.progress.toFixed(1)}%
                  </span>
                  <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                    {download.speed && <span>📊 {formatSpeed(download.speed)}</span>}
                    {download.eta && <span>⏱️ {formatETA(download.eta)}</span>}
                  </div>
                </div>
                <Progress 
                  value={download.progress} 
                  className="h-3 bg-gray-200 dark:bg-gray-700"
                />
              </div>
            )}
            
            {download.status === 'completed' && download.filename && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Saved as: {download.filename}
                </span>
              </div>
            )}
            
            {download.status === 'failed' && download.error && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {download.error}
                </AlertDescription>
              </Alert>
            )}

            {download.status === 'pending' && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Waiting in queue...
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
