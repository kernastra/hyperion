"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { AddDownloadModal } from "@/components/add-download-modal";
import { useDownloadContext } from "@/contexts/DownloadContext";

interface HistoryRecord {
  id: string;
  url: string;
  title: string;
  filename: string;
  status: 'completed' | 'failed';
  timestamp: string;
  error?: string;
}

interface SystemStatus {
  ytdlp: { ok: boolean; version: string };
  ffmpeg: { ok: boolean; version: string };
  downloadPath: string;
}

function getHostLabel(url: string): { name: string; color: string } {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const map: Record<string, { name: string; color: string }> = {
      'youtube.com': { name: 'YouTube', color: 'bg-red-500' },
      'youtu.be':    { name: 'YouTube', color: 'bg-red-500' },
      'vimeo.com':   { name: 'Vimeo', color: 'bg-blue-500' },
      'soundcloud.com': { name: 'SoundCloud', color: 'bg-orange-500' },
      'twitter.com': { name: 'Twitter/X', color: 'bg-gray-800' },
      'x.com':       { name: 'Twitter/X', color: 'bg-gray-800' },
      'instagram.com': { name: 'Instagram', color: 'bg-pink-500' },
      'tiktok.com':  { name: 'TikTok', color: 'bg-black' },
      'reddit.com':  { name: 'Reddit', color: 'bg-orange-600' },
      'twitch.tv':   { name: 'Twitch', color: 'bg-purple-600' },
      'dailymotion.com': { name: 'Dailymotion', color: 'bg-blue-600' },
    };
    return map[host] ?? { name: host, color: 'bg-gray-500' };
  } catch {
    return { name: url, color: 'bg-gray-500' };
  }
}

function DashboardSidebar({
  onAddUrl,
  history,
  status,
}: {
  onAddUrl: () => void;
  history: HistoryRecord[];
  status: SystemStatus | null;
}) {
  // Derive unique recent sources from actual history
  const recentSources = Object.values(
    history.reduce<Record<string, { name: string; color: string; count: number }>>((acc, h) => {
      const src = getHostLabel(h.url);
      if (!acc[src.name]) acc[src.name] = { ...src, count: 0 };
      acc[src.name].count++;
      return acc;
    }, {})
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={onAddUrl}
            className="w-full bg-accent-blue text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            + Add URL
          </button>
          <button
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text.startsWith('http')) onAddUrl();
              } catch {}
            }}
            className="w-full bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Paste from Clipboard
          </button>
        </div>
      </div>

      {/* System Status — live from API */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">System Status</h3>
        {status === null ? (
          <p className="text-xs text-text-muted dark:text-gray-400">Checking...</p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted dark:text-gray-300">yt-dlp</span>
              <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${status.ytdlp.ok ? 'text-accent-green bg-green-100 dark:bg-green-900/30' : 'text-badge-red bg-red-100 dark:bg-red-900/30'}`}>
                {status.ytdlp.ok ? status.ytdlp.version : 'Not found'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted dark:text-gray-300">ffmpeg</span>
              <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${status.ffmpeg.ok ? 'text-accent-green bg-green-100 dark:bg-green-900/30' : 'text-badge-red bg-red-100 dark:bg-red-900/30'}`}>
                {status.ffmpeg.ok ? 'Available' : 'Not found'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-text-muted dark:text-gray-300 flex-shrink-0">Output</span>
              <span className="text-text-dark dark:text-white font-medium text-xs text-right truncate" title={status.downloadPath}>
                {status.downloadPath}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Sources — derived from actual history */}
      {recentSources.length > 0 && (
        <div>
          <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Recent Sources</h3>
          <div className="space-y-2">
            {recentSources.map((src) => (
              <div key={src.name} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${src.color} rounded flex items-center justify-center text-white text-xs font-bold`}>
                    {src.name[0]}
                  </div>
                  <span className="text-sm text-text-dark dark:text-white">{src.name}</span>
                </div>
                <span className="text-xs text-text-muted dark:text-gray-400">{src.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { activeDownloads, downloads } = useDownloadContext();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(data => setHistory(data.history || []))
      .catch(() => {});
  }, [downloads]);

  useEffect(() => {
    fetch('/api/system-status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ ytdlp: { ok: false, version: 'Error' }, ffmpeg: { ok: false, version: 'Error' }, downloadPath: '' }));
  }, []);

  const totalDownloads = history.length;
  const completedCount = history.filter(h => h.status === 'completed').length;
  const thisMonthCount = history.filter(h => {
    const d = new Date(h.timestamp);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Last 7 days chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const count = history.filter(h => h.timestamp.slice(0, 10) === dayStr).length;
    return { label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], count };
  });
  const maxCount = Math.max(...last7Days.map(d => d.count), 1);

  // Format distribution from filenames
  const audioExts = /\.(mp3|m4a|opus|flac|wav|aac|ogg)$/i;
  const audioCount = history.filter(h => audioExts.test(h.filename || '')).length;
  const videoCount = completedCount - audioCount;
  const failedCount = history.filter(h => h.status === 'failed').length;
  const distTotal = totalDownloads || 1;

  const recentHistory = history.slice(0, 5);

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <MainLayout rightSidebar={
      <DashboardSidebar
        onAddUrl={() => setModalOpen(true)}
        history={history}
        status={status}
      />
    }>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 pt-2 lg:pt-0">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark dark:text-white">Dashboard</h1>
          <p className="text-text-muted dark:text-gray-300 text-sm lg:text-base">
            Welcome back! Here&apos;s what&apos;s happening with your downloads.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap"
        >
          + New Download
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 lg:p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-accent-blue rounded-lg flex items-center justify-center text-white">📁</div>
            <span className="text-xs font-medium text-accent-blue bg-blue-100 dark:bg-blue-800/50 px-2 py-1 rounded-full">All time</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-text-dark dark:text-white mb-1">{totalDownloads.toLocaleString()}</div>
          <div className="text-sm text-text-muted dark:text-gray-300">Total Downloads</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 lg:p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-accent-green rounded-lg flex items-center justify-center text-white">✓</div>
            <span className="text-xs font-medium text-accent-green bg-green-100 dark:bg-green-800/50 px-2 py-1 rounded-full">
              {totalDownloads > 0 ? `${Math.round((completedCount / totalDownloads) * 100)}%` : '—'}
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-text-dark dark:text-white mb-1">{completedCount}</div>
          <div className="text-sm text-text-muted dark:text-gray-300">Completed</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 lg:p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-accent-purple rounded-lg flex items-center justify-center text-white">⚡</div>
            <span className="text-xs font-medium text-accent-purple bg-purple-100 dark:bg-purple-800/50 px-2 py-1 rounded-full">Live</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-text-dark dark:text-white mb-1">{activeDownloads.length}</div>
          <div className="text-sm text-text-muted dark:text-gray-300">Active Downloads</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 lg:p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-accent-orange rounded-lg flex items-center justify-center text-white">📈</div>
            <span className="text-xs font-medium text-accent-orange bg-orange-100 dark:bg-orange-800/50 px-2 py-1 rounded-full">Month</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-text-dark dark:text-white mb-1">{thisMonthCount}</div>
          <div className="text-sm text-text-muted dark:text-gray-300">This Month</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
        {/* Download Activity Chart */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-dark dark:text-white text-lg">Download Activity</h3>
            <span className="text-xs text-text-muted dark:text-gray-400">Last 7 days</span>
          </div>
          {last7Days.every(d => d.count === 0) ? (
            <p className="text-text-muted dark:text-gray-400 text-sm text-center py-12">No activity yet</p>
          ) : (
            <>
              <div className="flex items-end gap-2 h-32 lg:h-40 mb-3">
                {last7Days.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-xs text-text-muted dark:text-gray-400 mb-1">{day.count > 0 ? day.count : ''}</span>
                    <div
                      className={`w-full rounded-sm transition-all ${day.count > 0 ? 'bg-accent-blue' : 'bg-gray-200 dark:bg-gray-600'}`}
                      style={{ height: `${Math.max(4, (day.count / maxCount) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-text-muted dark:text-gray-300">
                {last7Days.map((day, i) => <span key={i}>{day.label}</span>)}
              </div>
            </>
          )}
        </div>

        {/* Format Distribution */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 transition-colors">
          <h3 className="font-semibold text-text-dark dark:text-white text-lg mb-4">Format Distribution</h3>
          {totalDownloads === 0 ? (
            <p className="text-text-muted dark:text-gray-400 text-sm text-center py-12">No downloads yet</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-dark dark:text-white">Video</span>
                  <span className="font-medium text-text-dark dark:text-white">{Math.round((videoCount / distTotal) * 100)}% ({videoCount})</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-accent-blue h-2 rounded-full" style={{ width: `${(videoCount / distTotal) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-dark dark:text-white">Audio</span>
                  <span className="font-medium text-text-dark dark:text-white">{Math.round((audioCount / distTotal) * 100)}% ({audioCount})</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-accent-green h-2 rounded-full" style={{ width: `${(audioCount / distTotal) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-dark dark:text-white">Failed</span>
                  <span className="font-medium text-text-dark dark:text-white">{Math.round((failedCount / distTotal) * 100)}% ({failedCount})</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-badge-red h-2 rounded-full" style={{ width: `${(failedCount / distTotal) * 100}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-dark dark:text-white text-lg">Recent Activity</h3>
          <button onClick={() => router.push('/history')} className="text-accent-blue hover:text-blue-600 text-sm font-medium">
            View All
          </button>
        </div>

        {activeDownloads.length === 0 && recentHistory.length === 0 ? (
          <p className="text-center py-8 text-sm text-text-muted dark:text-gray-400">No recent activity. Start a download to see it here.</p>
        ) : (
          <div className="space-y-3">
            {activeDownloads.slice(0, 3).map((download) => (
              <div key={download.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">⏬</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-dark dark:text-white text-sm truncate">{download.title}</div>
                  <div className="text-xs text-accent-blue">Downloading… {download.progress.toFixed(0)}%</div>
                </div>
                <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 flex-shrink-0">
                  <div className="bg-accent-blue h-1.5 rounded-full" style={{ width: `${download.progress}%` }} />
                </div>
              </div>
            ))}
            {recentHistory.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ${item.status === 'completed' ? 'bg-accent-green' : 'bg-badge-red'}`}>
                  {item.status === 'completed' ? '✓' : '✕'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-dark dark:text-white text-sm truncate">{item.title || item.url}</div>
                  <div className="text-xs text-text-muted dark:text-gray-300">
                    {item.status === 'completed' ? 'Downloaded' : 'Failed'} · {formatTimeAgo(item.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddDownloadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </MainLayout>
  );
}
