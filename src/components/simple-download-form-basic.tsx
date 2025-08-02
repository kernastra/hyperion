"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useDownloadManager } from "@/hooks/useDownloadManager";

interface VideoInfo {
  title: string;
  description: string;
  duration: number;
  uploader: string;
  upload_date: string;
  view_count: number;
  like_count: number;
  thumbnail: string;
  formats: Array<{
    format_id: string;
    ext: string;
    quality: number | null;
    filesize: number | null;
    height: number | null;
    width: number | null;
    fps: number | null;
    vcodec: string | null;
    acodec: string | null;
    format_note: string | null;
  }>;
  webpage_url: string;
}

interface SimpleDownloadFormProps {
  onVideoAnalyzed?: (videoInfo: VideoInfo) => void;
}

export default function SimpleDownloadForm({ onVideoAnalyzed }: SimpleDownloadFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("bestvideo+bestaudio");
  const { startDownload } = useDownloadManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    setError("");
    setVideoInfo(null);
    
    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze video');
      }

      const data = await response.json();
      setVideoInfo(data);
      
      if (onVideoAnalyzed) {
        onVideoAnalyzed(data);
      }
      
    } catch (error) {
      console.error("Error analyzing URL:", error);
      setError(error instanceof Error ? error.message : 'Failed to analyze video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    
    try {
      setError("");
      setSuccessMessage("");
      
      const isAudioOnly = selectedFormat === "bestaudio";
      const isVideoOnly = selectedFormat === "bestvideo";
      
      await startDownload(url, {
        format: selectedFormat,
        quality: "best",
        audioOnly: isAudioOnly,
      }, videoInfo.title);
      
      setSuccessMessage(`Download started for "${videoInfo.title}"`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Download error:", error);
      setError("Failed to start download. Please try again.");
    }
  };

  const handleAddToQueue = async () => {
    if (!videoInfo) return;
    
    // For now, this does the same as download
    // In a future implementation, this could add to a queue without starting immediately
    await handleDownload();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    const gb = mb / 1024;
    
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm lg:text-base font-medium text-text-dark dark:text-white mb-2">
          Video URL
        </label>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none text-sm lg:text-base transition-colors"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </form>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {videoInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 space-y-4">
          <div className="flex gap-4">
            {videoInfo.thumbnail && (
              <img 
                src={videoInfo.thumbnail} 
                alt="Video thumbnail"
                className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-dark dark:text-white text-lg mb-2 line-clamp-2">
                {videoInfo.title}
              </h3>
              <div className="space-y-1 text-sm text-text-muted dark:text-gray-300">
                <p><span className="font-medium">Channel:</span> {videoInfo.uploader}</p>
                <p><span className="font-medium">Duration:</span> {formatDuration(videoInfo.duration)}</p>
                <div className="flex gap-4">
                  <span><span className="font-medium">Views:</span> {formatNumber(videoInfo.view_count)}</span>
                  {videoInfo.like_count > 0 && (
                    <span><span className="font-medium">Likes:</span> {formatNumber(videoInfo.like_count)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {videoInfo.formats && videoInfo.formats.length > 0 && (
            <div>
              <h4 className="font-medium text-text-dark dark:text-white mb-2">Download Options</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-dark dark:text-white mb-1">
                    Select Download Type
                  </label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose download type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bestvideo+bestaudio">📹 Video + Audio (Best Quality)</SelectItem>
                      <SelectItem value="bestaudio">🎵 Audio Only</SelectItem>
                      <SelectItem value="bestvideo">🎬 Video Only (No Audio)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">What you'll get:</p>
                    <div className="space-y-1 text-xs">
                      {selectedFormat === "bestvideo+bestaudio" && (
                        <p>📹 Complete video file with audio (MP4 format recommended)</p>
                      )}
                      {selectedFormat === "bestaudio" && (
                        <p>🎵 Audio-only file (MP3, AAC, or similar format)</p>
                      )}
                      {selectedFormat === "bestvideo" && (
                        <p>� Video-only file without audio (for editing purposes)</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleDownload}
              className="flex-1 bg-accent-green hover:bg-green-600 text-white"
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Now
            </Button>
            <Button 
              onClick={handleAddToQueue}
              variant="outline" 
              className="flex-1"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Queue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
