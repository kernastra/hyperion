"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { useDownloadContext } from "@/contexts/DownloadContext";

interface AddDownloadModalProps {
  open: boolean;
  onClose: () => void;
}

interface VideoInfo {
  title: string;
  duration: number;
  uploader: string;
  view_count: number;
  thumbnail: string;
  formats: Array<{ format_id: string; ext: string; height: number | null }>;
}

export function AddDownloadModal({ open, onClose }: AddDownloadModalProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("bestvideo+bestaudio");
  const { startDownload } = useDownloadContext();
  const router = useRouter();

  const handleClose = () => {
    setUrl("");
    setError("");
    setSuccessMessage("");
    setVideoInfo(null);
    setSelectedFormat("bestvideo+bestaudio");
    onClose();
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError("");
    setVideoInfo(null);

    try {
      const res = await fetch('/api/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze video');
      }

      const data = await res.json();
      setVideoInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;

    try {
      setError("");
      const isAudioOnly = selectedFormat === "bestaudio";
      await startDownload(url, {
        format: selectedFormat,
        quality: "best",
        audioOnly: isAudioOnly,
      }, videoInfo.title);

      setSuccessMessage(`Download started for "${videoInfo.title}"`);
      setTimeout(() => {
        handleClose();
        router.push('/queue');
      }, 1500);
    } catch {
      setError("Failed to start download. Please try again.");
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('http')) {
        setUrl(text);
      }
    } catch {
      // clipboard access denied
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg dark:bg-gray-800 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-text-dark dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-accent-blue" />
            Add Download
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleAnalyze} className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="bg-accent-blue hover:bg-blue-600 text-white px-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
            </Button>
          </form>

          <button
            onClick={handlePasteClipboard}
            className="w-full text-sm text-text-muted dark:text-gray-400 hover:text-text-dark dark:hover:text-white py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors text-left"
          >
            Paste from clipboard
          </button>

          {error && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-400">{successMessage}</AlertDescription>
            </Alert>
          )}

          {videoInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex gap-3">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt="thumbnail"
                    className="w-24 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-dark dark:text-white text-sm line-clamp-2">{videoInfo.title}</p>
                  <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                    {videoInfo.uploader} • {formatDuration(videoInfo.duration)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-dark dark:text-white mb-1">Download Type</label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bestvideo+bestaudio">Video + Audio (Best Quality)</SelectItem>
                    <SelectItem value="bestaudio">Audio Only</SelectItem>
                    <SelectItem value="bestvideo">Video Only (No Audio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-accent-green hover:bg-green-600 text-white"
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Now
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="px-3 dark:border-gray-600 dark:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
