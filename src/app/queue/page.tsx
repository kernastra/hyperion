"use client";

import { useState } from "react";
import { MainLayout } from "@/components/main-layout";
import { AddDownloadModal } from "@/components/add-download-modal";
import { useDownloadContext } from "@/contexts/DownloadContext";
import { Progress } from "@/components/ui/progress";

function QueueSidebar({ onAddUrl }: { onAddUrl: () => void }) {
  const { activeDownloads, clearCompleted, clearAll } = useDownloadContext();

  const totalSpeed = activeDownloads
    .filter(d => d.speed)
    .reduce((acc, d) => {
      const match = d.speed?.match(/(\d+(?:\.\d+)?)(KiB|MiB|GiB)\/s/);
      if (!match) return acc;
      const val = parseFloat(match[1]);
      const unit = match[2];
      const mbps = unit === 'KiB' ? val / 1024 : unit === 'GiB' ? val * 1024 : val;
      return acc + mbps;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Queue Controls */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Queue Controls</h3>
        <div className="space-y-3">
          <button
            onClick={onAddUrl}
            className="w-full bg-accent-green text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            + Add to Queue
          </button>
          <button
            onClick={clearCompleted}
            className="w-full bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Completed
          </button>
          <button
            onClick={clearAll}
            className="w-full bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Current Speed */}
      {activeDownloads.length > 0 && (
        <div>
          <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Current Speed</h3>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-blue mb-1">
              {totalSpeed > 0 ? `${totalSpeed.toFixed(1)} MB/s` : 'Calculating...'}
            </div>
            <div className="text-sm text-text-muted dark:text-gray-300 mb-3">Combined download speed</div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted dark:text-gray-300">Active</span>
            <span className="font-medium text-text-dark dark:text-white">{activeDownloads.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted dark:text-gray-300">Pending</span>
            <span className="font-medium text-text-dark dark:text-white">
              {activeDownloads.filter(d => d.status === 'pending').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted dark:text-gray-300">Downloading</span>
            <span className="font-medium text-text-dark dark:text-white">
              {activeDownloads.filter(d => d.status === 'downloading').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QueuePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    downloads,
    activeDownloads,
    completedDownloads,
    failedDownloads,
    cancelDownload,
    removeDownload,
    clearCompleted,
    retryDownload,
  } = useDownloadContext();

  const todayCompleted = completedDownloads.filter(d => {
    if (!d.endTime) return false;
    const today = new Date();
    const end = new Date(d.endTime);
    return end.toDateString() === today.toDateString();
  }).length;

  return (
    <MainLayout rightSidebar={<QueueSidebar onAddUrl={() => setModalOpen(true)} />}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 pt-2 lg:pt-0">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark dark:text-white">Download Queue</h1>
          <p className="text-text-muted dark:text-gray-300 text-sm lg:text-base">Manage your download queue and priorities</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCompleted}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            Clear Done
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
          >
            + Add to Queue
          </button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
          <div className="text-2xl font-bold text-text-dark dark:text-white">
            {activeDownloads.filter(d => d.status === 'downloading').length}
          </div>
          <div className="text-sm text-text-muted dark:text-gray-300">Downloading</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl">
          <div className="text-2xl font-bold text-text-dark dark:text-white">
            {activeDownloads.filter(d => d.status === 'pending').length}
          </div>
          <div className="text-sm text-text-muted dark:text-gray-300">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
          <div className="text-2xl font-bold text-text-dark dark:text-white">{todayCompleted}</div>
          <div className="text-sm text-text-muted dark:text-gray-300">Completed Today</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl">
          <div className="text-2xl font-bold text-text-dark dark:text-white">{failedDownloads.length}</div>
          <div className="text-sm text-text-muted dark:text-gray-300">Failed</div>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="bg-white dark:bg-gray-700 rounded-xl p-8 text-center transition-colors">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-semibold text-text-dark dark:text-white mb-2">Queue is empty</h3>
          <p className="text-text-muted dark:text-gray-400 text-sm mb-4">Add URLs to start downloading</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
          >
            + Add Download
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Downloads */}
          {activeDownloads.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-dark dark:text-white text-lg">Active Downloads</h3>
                <span className="text-sm text-accent-green font-medium">{activeDownloads.length} running</span>
              </div>
              <div className="space-y-3">
                {activeDownloads.map((download) => (
                  <div key={download.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-colors">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                        {download.status === 'pending' ? '⏳' : '⬇'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-dark dark:text-white truncate">{download.title}</div>
                        <div className="text-sm text-text-muted dark:text-gray-300">
                          {(() => { try { return new URL(download.url).hostname; } catch { return download.url; } })()}
                          {download.speed && ` • ${download.speed}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {download.speed && (
                          <span className="text-sm text-accent-green font-medium hidden sm:block">{download.speed}</span>
                        )}
                        <button
                          onClick={() => cancelDownload(download.id)}
                          className="text-text-muted hover:text-badge-red transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={download.progress} className="flex-1 h-2" />
                      <span className="text-sm text-text-muted dark:text-gray-300 whitespace-nowrap">
                        {download.progress.toFixed(0)}%{download.eta && ` • ${download.eta}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Downloads */}
          {completedDownloads.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-dark dark:text-white text-lg">Completed</h3>
                <button onClick={clearCompleted} className="text-sm text-text-muted hover:text-badge-red dark:hover:text-badge-red">
                  Clear all
                </button>
              </div>
              <div className="space-y-2">
                {completedDownloads.map((download) => (
                  <div key={download.id} className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-100 dark:border-green-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">✓</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-dark dark:text-white text-sm truncate">{download.title}</div>
                        <div className="text-xs text-text-muted dark:text-gray-300 truncate">{download.filename || 'Completed'}</div>
                      </div>
                      <button
                        onClick={() => removeDownload(download.id)}
                        className="text-text-muted hover:text-badge-red text-sm flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Downloads */}
          {failedDownloads.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-dark dark:text-white text-lg">Failed</h3>
              </div>
              <div className="space-y-2">
                {failedDownloads.map((download) => (
                  <div key={download.id} className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-badge-red rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">✕</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-dark dark:text-white text-sm truncate">{download.title}</div>
                        <div className="text-xs text-badge-red truncate">{download.error || 'Download failed'}</div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => retryDownload(download.id)}
                          className="text-text-muted hover:text-accent-blue text-sm"
                          title="Retry"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => removeDownload(download.id)}
                          className="text-text-muted hover:text-badge-red text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddDownloadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </MainLayout>
  );
}
