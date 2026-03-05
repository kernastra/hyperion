"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";

interface Settings {
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

function SettingsSidebar({ onSave }: { onSave: () => void }) {
  const [systemStatus, setSystemStatus] = useState<{ ytdlp: { ok: boolean; version: string }; ffmpeg: { ok: boolean; version: string } } | null>(null);

  useEffect(() => {
    fetch('/api/system-status')
      .then(r => r.json())
      .then(data => setSystemStatus(data))
      .catch(() => setSystemStatus(null));
  }, []);

  return (
    <div className="space-y-6">
      {/* System Info */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">System Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-start gap-2">
            <span className="text-text-muted dark:text-gray-300 flex-shrink-0">yt-dlp</span>
            <span className={`font-medium text-right break-all ${systemStatus?.ytdlp.ok ? 'text-accent-green' : 'text-badge-red'}`}>
              {systemStatus ? (systemStatus.ytdlp.ok ? systemStatus.ytdlp.version : 'Not found') : '...'}
            </span>
          </div>
          <div className="flex justify-between items-start gap-2">
            <span className="text-text-muted dark:text-gray-300 flex-shrink-0">ffmpeg</span>
            <span className={`font-medium text-right break-all ${systemStatus?.ffmpeg.ok ? 'text-accent-green' : 'text-badge-red'}`}>
              {systemStatus ? (systemStatus.ffmpeg.ok ? systemStatus.ffmpeg.version.split(' ').slice(0, 3).join(' ') : 'Not found') : '...'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Quick Actions</h3>
        <div className="space-y-2">
          {[
            'View Logs',
            'Clear Cache',
            'Test Connection',
          ].map((action) => (
            <button
              key={action}
              className="w-full text-left px-3 py-2 text-sm text-text-muted dark:text-gray-300 hover:text-text-dark dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Help & Support */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Help & Support</h3>
        <div className="space-y-2">
          {[
            'Documentation',
            'Report Bug',
            'Feature Request',
          ].map((item) => (
            <button
              key={item}
              className="w-full text-left px-3 py-2 text-sm text-text-muted dark:text-gray-300 hover:text-text-dark dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const update = (key: keyof Settings, value: Settings[keyof Settings]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  if (loading || !settings) {
    return (
      <MainLayout>
        <div className="pt-2 lg:pt-0 text-center py-12 text-text-muted dark:text-gray-400">
          Loading settings...
        </div>
      </MainLayout>
    );
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none";
  const selectClass = inputClass;
  const sectionClass = "bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 transition-colors";
  const labelClass = "block text-sm font-medium text-text-dark dark:text-white mb-2";
  const checkboxLabelClass = "flex items-center gap-3";
  const checkboxClass = "w-4 h-4 text-accent-blue bg-gray-100 border-gray-300 rounded focus:ring-accent-blue dark:bg-gray-700 dark:border-gray-600";

  return (
    <MainLayout rightSidebar={<SettingsSidebar onSave={handleSave} />}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 pt-2 lg:pt-0">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark dark:text-white">Settings</h1>
          <p className="text-text-muted dark:text-gray-300 text-sm lg:text-base">Configure Hyperion to your preferences</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6 lg:space-y-8">
        {/* Download Settings */}
        <div className={sectionClass}>
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">Download Settings</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Download Directory</label>
              <input
                type="text"
                value={settings.downloadPath}
                onChange={(e) => update('downloadPath', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max Concurrent Downloads</label>
              <select
                value={settings.maxConcurrentDownloads}
                onChange={(e) => update('maxConcurrentDownloads', parseInt(e.target.value))}
                className={selectClass}
              >
                {[1, 2, 3, 5, 7, 10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Speed Limit</label>
              <select
                value={settings.speedLimit}
                onChange={(e) => update('speedLimit', e.target.value)}
                className={selectClass}
              >
                <option value="unlimited">Unlimited</option>
                <option value="100M">100 MB/s</option>
                <option value="50M">50 MB/s</option>
                <option value="25M">25 MB/s</option>
                <option value="10M">10 MB/s</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Retry Failed Downloads</label>
              <select
                value={settings.retryCount}
                onChange={(e) => update('retryCount', parseInt(e.target.value))}
                className={selectClass}
              >
                <option value={0}>Never</option>
                <option value={1}>1 time</option>
                <option value={3}>3 times</option>
                <option value={5}>5 times</option>
              </select>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={settings.autoStart}
                onChange={(e) => update('autoStart', e.target.checked)}
                className={checkboxClass}
              />
              <span className="text-sm text-text-dark dark:text-white">Auto-start downloads when added to queue</span>
            </label>
          </div>
        </div>

        {/* Quality & Format */}
        <div className={sectionClass}>
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">Quality & Format Settings</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Default Video Quality</label>
              <select
                value={settings.defaultVideoQuality}
                onChange={(e) => update('defaultVideoQuality', e.target.value)}
                className={selectClass}
              >
                <option value="best">Best Available</option>
                <option value="2160">4K (2160p)</option>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Default Audio Quality</label>
              <select
                value={settings.defaultAudioQuality}
                onChange={(e) => update('defaultAudioQuality', e.target.value)}
                className={selectClass}
              >
                <option value="best">Best Available</option>
                <option value="320k">320 kbps</option>
                <option value="256k">256 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="128k">128 kbps</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Video Format</label>
              <select
                value={settings.defaultVideoFormat}
                onChange={(e) => update('defaultVideoFormat', e.target.value)}
                className={selectClass}
              >
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
                <option value="webm">WEBM</option>
                <option value="avi">AVI</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Audio Format</label>
              <select
                value={settings.defaultAudioFormat}
                onChange={(e) => update('defaultAudioFormat', e.target.value)}
                className={selectClass}
              >
                <option value="mp3">MP3</option>
                <option value="m4a">M4A</option>
                <option value="opus">OPUS</option>
                <option value="flac">FLAC</option>
                <option value="wav">WAV</option>
              </select>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <label className={checkboxLabelClass}>
              <input type="checkbox" checked={settings.downloadSubtitles} onChange={(e) => update('downloadSubtitles', e.target.checked)} className={checkboxClass} />
              <span className="text-sm text-text-dark dark:text-white">Download subtitles when available</span>
            </label>
            <label className={checkboxLabelClass}>
              <input type="checkbox" checked={settings.embedSubtitles} onChange={(e) => update('embedSubtitles', e.target.checked)} className={checkboxClass} />
              <span className="text-sm text-text-dark dark:text-white">Embed subtitles in video file</span>
            </label>
            <label className={checkboxLabelClass}>
              <input type="checkbox" checked={settings.downloadThumbnails} onChange={(e) => update('downloadThumbnails', e.target.checked)} className={checkboxClass} />
              <span className="text-sm text-text-dark dark:text-white">Download thumbnails</span>
            </label>
          </div>
        </div>

        {/* Network & Proxy */}
        <div className={sectionClass}>
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">Network & Proxy</h3>
          <div className="space-y-4">
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={settings.useProxy}
                onChange={(e) => update('useProxy', e.target.checked)}
                className={checkboxClass}
              />
              <span className="text-sm text-text-dark dark:text-white">Use proxy server</span>
            </label>
            {settings.useProxy && (
              <div className="ml-7">
                <label className={labelClass}>Proxy URL</label>
                <input
                  type="text"
                  placeholder="http://proxy.example.com:8080"
                  value={settings.proxyUrl}
                  onChange={(e) => update('proxyUrl', e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-600">
              <label className={labelClass}>Cookies File Path</label>
              <input
                type="text"
                placeholder="/workspaces/hyperion/cookies.txt"
                value={settings.cookiesPath}
                onChange={(e) => update('cookiesPath', e.target.value)}
                className={inputClass}
              />
              <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                Path to a Netscape-format cookies.txt file. Required for YouTube and other sites with bot detection.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={sectionClass}>
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            <label className={checkboxLabelClass}>
              <input type="checkbox" checked={settings.notifyOnComplete} onChange={(e) => update('notifyOnComplete', e.target.checked)} className={checkboxClass} />
              <span className="text-sm text-text-dark dark:text-white">Notify when downloads complete</span>
            </label>
            <label className={checkboxLabelClass}>
              <input type="checkbox" checked={settings.notifyOnFail} onChange={(e) => update('notifyOnFail', e.target.checked)} className={checkboxClass} />
              <span className="text-sm text-text-dark dark:text-white">Notify when downloads fail</span>
            </label>
          </div>
        </div>

        {/* Advanced */}
        <div className={sectionClass}>
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">Advanced</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className={labelClass}>yt-dlp Path</label>
              <input
                type="text"
                value={settings.ytDlpPath}
                onChange={(e) => update('ytDlpPath', e.target.value)}
                className={inputClass}
                placeholder="/usr/local/bin/yt-dlp"
              />
              <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Path to yt-dlp executable</p>
            </div>
            <div>
              <label className={labelClass}>ffmpeg Path</label>
              <input
                type="text"
                value={settings.ffmpegPath}
                onChange={(e) => update('ffmpegPath', e.target.value)}
                className={inputClass}
                placeholder="/usr/bin/ffmpeg"
              />
              <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Path to ffmpeg executable</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-badge-red text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
