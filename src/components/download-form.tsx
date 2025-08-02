"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Plus, X, Settings, FileVideo, Music } from "lucide-react";

interface DownloadOptions {
  format: string;
  quality: string;
  audioOnly: boolean;
  outputPath?: string;
}

interface DownloadFormProps {
  onDownload: (url: string, options: DownloadOptions) => void;
}

export function DownloadForm({ onDownload }: DownloadFormProps) {
  const [urls, setUrls] = useState<string[]>([""]);
  const [format, setFormat] = useState("best");
  const [quality, setQuality] = useState("best");
  const [audioOnly, setAudioOnly] = useState(false);
  const [outputPath, setOutputPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateOutputPath = (path: string): string | null => {
    if (!path.trim()) return null; // Empty path is valid (uses default)
    
    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(path)) {
      return "Output path contains invalid characters: < > : \" | ? *";
    }
    
    // Check if it's a relative path that goes outside current directory
    if (path.includes('..')) {
      return "Relative paths with '..' are not allowed for security reasons";
    }
    
    return null;
  };

  const addUrlField = () => {
    setUrls([...urls, ""]);
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const validUrls = urls.filter(url => url.trim() !== "");
    
    if (validUrls.length === 0) {
      setError("Please enter at least one valid URL");
      setIsLoading(false);
      return;
    }

    // Validate output path if provided
    if (outputPath.trim()) {
      const pathError = validateOutputPath(outputPath.trim());
      if (pathError) {
        setError(pathError);
        setIsLoading(false);
        return;
      }
    }

    try {
      for (const url of validUrls) {
        const options = {
          format,
          quality,
          audioOnly,
          outputPath: outputPath.trim() || undefined,
        };
        
        onDownload(url.trim(), options);
      }
      
      // Reset form
      setUrls([""]);
      setOutputPath("");
    } catch (error) {
      console.error('Failed to add download to queue:', error);
      setError("Failed to add download to queue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Download Videos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter video URLs and customize your download options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="border-red-200 dark:border-red-800">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileVideo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Video URLs
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUrlField}
                className="h-8 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add URL
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                {urls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeUrlField(index)}
                    className="h-10 w-10 p-0 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Download Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!audioOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAudioOnly(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <FileVideo className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button
                  type="button"
                  variant={audioOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAudioOnly(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <Music className="h-4 w-4 mr-2" />
                  Audio Only
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge className="h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400" />
                Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best">🌟 Best Quality</SelectItem>
                  <SelectItem value="worst">🔽 Worst Quality</SelectItem>
                  <SelectItem value="2160">🎬 4K (2160p)</SelectItem>
                  <SelectItem value="1440">📺 2K (1440p)</SelectItem>
                  <SelectItem value="1080">📽️ Full HD (1080p)</SelectItem>
                  <SelectItem value="720">🎥 HD (720p)</SelectItem>
                  <SelectItem value="480">📹 SD (480p)</SelectItem>
                  <SelectItem value="360">📱 Low (360p)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileVideo className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">⭐ Best Available</SelectItem>
                <SelectItem value="mp4">🎬 MP4</SelectItem>
                <SelectItem value="webm">🌐 WebM</SelectItem>
                <SelectItem value="mkv">📼 MKV</SelectItem>
                <SelectItem value="avi">🎞️ AVI</SelectItem>
                <SelectItem value="mp3">🎵 MP3 (Audio)</SelectItem>
                <SelectItem value="m4a">🎶 M4A (Audio)</SelectItem>
                <SelectItem value="opus">🔊 Opus (Audio)</SelectItem>
                <SelectItem value="flac">🎼 FLAC (Audio)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Output Path (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="📁 /path/to/downloads (leave empty for default)"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• Leave empty to use default downloads folder</p>
              <p>• Use absolute paths like: /home/user/Downloads</p>
              <p>• Or relative paths like: ./my-downloads</p>
              <p>• Directory will be created if it doesn&apos;t exist</p>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white border-0"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Adding to Queue...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-3" />
                Add to Download Queue
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
