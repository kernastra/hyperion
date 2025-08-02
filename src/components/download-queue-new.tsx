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
      pending: 'secondary' as const,
      downloading: 'default' as const,
      completed: 'default' as const,
      failed: 'destructive' as const,
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No downloads in queue</p>
            <p className="text-sm">Add URLs in the Download tab to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {downloads.map((download) => (
        <Card key={download.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {download.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {download.url}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {getStatusBadge(download.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(download.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2">
            {download.status === 'downloading' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{download.progress.toFixed(1)}%</span>
                  <div className="flex gap-4">
                    {download.speed && <span>{formatSpeed(download.speed)}</span>}
                    {download.eta && <span>{formatETA(download.eta)}</span>}
                  </div>
                </div>
                <Progress value={download.progress} className="h-2" />
              </div>
            )}
            
            {download.status === 'completed' && download.filename && (
              <div className="text-sm text-muted-foreground">
                <span>Saved as: {download.filename}</span>
              </div>
            )}
            
            {download.status === 'failed' && download.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{download.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
