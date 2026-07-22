import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve('./hyperion.config.json');

export interface HyperionConfig {
  ytDlpPath: string;
  ffmpegPath: string;
  downloadPath: string;
  maxConcurrentDownloads: number;
  defaultVideoQuality: string;
  defaultVideoFormat: string;
  defaultAudioFormat: string;
  defaultAudioQuality: string;
  speedLimit: string;
  retryCount: number;
  autoStart: boolean;
  downloadSubtitles: boolean;
  embedSubtitles: boolean;
  downloadThumbnails: boolean;
  notifyOnComplete: boolean;
  notifyOnFail: boolean;
  useProxy: boolean;
  proxyUrl: string;
  cookiesPath: string;
}

const defaults: HyperionConfig = {
  ytDlpPath: process.env.YTDLP_PATH || 'yt-dlp',
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  downloadPath: './downloads',
  maxConcurrentDownloads: 5,
  defaultVideoQuality: '1080',
  defaultVideoFormat: 'mp4',
  defaultAudioFormat: 'mp3',
  defaultAudioQuality: 'best',
  speedLimit: 'unlimited',
  retryCount: 3,
  autoStart: true,
  downloadSubtitles: true,
  embedSubtitles: false,
  downloadThumbnails: true,
  notifyOnComplete: true,
  notifyOnFail: true,
  useProxy: false,
  proxyUrl: '',
  cookiesPath: '',
};

export function getConfig(): HyperionConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return { ...defaults, ...JSON.parse(content) };
    }
  } catch {
    // ignore parse errors, use defaults
  }
  return { ...defaults };
}

export function saveConfig(config: Partial<HyperionConfig>): void {
  const current = getConfig();
  const updated = { ...current, ...config };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
}
