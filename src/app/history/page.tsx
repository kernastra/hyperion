"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/main-layout";

interface HistoryRecord {
  id: string;
  url: string;
  title: string;
  filename: string;
  status: 'completed' | 'failed';
  timestamp: string;
  error?: string;
}

type FilterType = 'all' | 'completed' | 'failed';

function groupByDate(records: HistoryRecord[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: { label: string; records: HistoryRecord[] }[] = [];

  const todayItems = records.filter(r => new Date(r.timestamp) >= today);
  const yesterdayItems = records.filter(r => {
    const d = new Date(r.timestamp);
    return d >= yesterday && d < today;
  });
  const thisWeekItems = records.filter(r => {
    const d = new Date(r.timestamp);
    return d >= weekAgo && d < yesterday;
  });
  const olderItems = records.filter(r => new Date(r.timestamp) < weekAgo);

  if (todayItems.length > 0) groups.push({ label: 'Today', records: todayItems });
  if (yesterdayItems.length > 0) groups.push({ label: 'Yesterday', records: yesterdayItems });
  if (thisWeekItems.length > 0) groups.push({ label: 'This Week', records: thisWeekItems });
  if (olderItems.length > 0) groups.push({ label: 'Older', records: olderItems });

  return groups;
}

function HistorySidebar({ history }: { history: HistoryRecord[] }) {
  const total = history.length;
  const completed = history.filter(h => h.status === 'completed').length;
  const failed = history.filter(h => h.status === 'failed').length;
  const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

  const now = new Date();
  const thisMonth = history.filter(h => {
    const d = new Date(h.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const exportCSV = () => {
    const rows = [
      ['ID', 'Title', 'URL', 'Filename', 'Status', 'Timestamp', 'Error'],
      ...history.map(h => [h.id, h.title, h.url, h.filename, h.status, h.timestamp, h.error || ''])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hyperion-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyURLs = () => {
    const urls = history.map(h => h.url).join('\n');
    navigator.clipboard.writeText(urls).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted dark:text-gray-300">Total Downloads</span>
            <span className="text-sm font-semibold text-text-dark dark:text-white">{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted dark:text-gray-300">Success Rate</span>
            <span className="text-sm font-semibold text-accent-green">{successRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted dark:text-gray-300">Failed</span>
            <span className="text-sm font-semibold text-badge-red">{failed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted dark:text-gray-300">This Month</span>
            <span className="text-sm font-semibold text-text-dark dark:text-white">{thisMonth} files</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div>
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Export</h3>
        <div className="space-y-2">
          <button
            onClick={exportCSV}
            className="w-full text-left px-3 py-2 text-sm text-text-muted dark:text-gray-300 hover:text-text-dark dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Export as CSV
          </button>
          <button
            onClick={copyURLs}
            className="w-full text-left px-3 py-2 text-sm text-text-muted dark:text-gray-300 hover:text-text-dark dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Copy URLs List
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Today', 'Yesterday']));

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/history?action=remove&id=${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch {}
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all download history?')) return;
    try {
      await fetch('/api/history?action=clear', { method: 'DELETE' });
      setHistory([]);
    } catch {}
  };

  const filtered = history.filter(h => {
    if (filter === 'completed' && h.status !== 'completed') return false;
    if (filter === 'failed' && h.status !== 'failed') return false;
    if (search) {
      const q = search.toLowerCase();
      return h.title?.toLowerCase().includes(q) || h.url?.toLowerCase().includes(q) || h.filename?.toLowerCase().includes(q);
    }
    return true;
  });

  const groups = groupByDate(filtered);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const tabs: { label: string; value: FilterType }[] = [
    { label: 'All Downloads', value: 'all' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
  ];

  return (
    <MainLayout rightSidebar={<HistorySidebar history={history} />}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 pt-2 lg:pt-0">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark dark:text-white">Download History</h1>
          <p className="text-text-muted dark:text-gray-300 text-sm lg:text-base">View and manage your download history</p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search downloads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
          />
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm whitespace-nowrap"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200 dark:border-gray-600">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'text-accent-blue border-b-2 border-accent-blue -mb-px'
                : 'text-text-muted dark:text-gray-400 hover:text-text-dark dark:hover:text-white'
            }`}
          >
            {tab.label}
            {tab.value === 'all' && history.length > 0 && (
              <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{history.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-text-muted dark:text-gray-400">
          <div className="text-2xl mb-2">⏳</div>
          <p>Loading history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted dark:text-gray-400">
          <div className="text-4xl mb-3">📜</div>
          <h3 className="font-semibold text-text-dark dark:text-white mb-2">
            {search ? 'No results found' : 'No download history'}
          </h3>
          <p className="text-sm">
            {search ? `No downloads match "${search}"` : 'Downloads will appear here after completion'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center gap-3 mb-4 w-full text-left"
              >
                <h3 className="text-lg font-semibold text-text-dark dark:text-white">{group.label}</h3>
                <span className="text-sm text-text-muted dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {group.records.length}
                </span>
                <span className="ml-auto text-text-muted dark:text-gray-400 text-sm">
                  {expandedGroups.has(group.label) ? '▲' : '▼'}
                </span>
              </button>

              {expandedGroups.has(group.label) && (
                <div className="space-y-3">
                  {group.records.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg p-4 border hover:shadow-md transition-all ${
                        item.status === 'failed'
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0 ${
                          item.status === 'completed' ? 'bg-accent-green' : 'bg-badge-red'
                        }`}>
                          {item.status === 'completed' ? '✓' : '✕'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-text-dark dark:text-white truncate">
                            {item.title || item.url}
                          </div>
                          {item.status === 'completed' ? (
                            <div className="text-sm text-text-muted dark:text-gray-300 mt-1">
                              {item.filename && <span className="truncate">{item.filename} • </span>}
                              {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                            </div>
                          ) : (
                            <div className="text-sm text-badge-red mt-1">
                              Failed at {formatTime(item.timestamp)}
                              {item.error && ` • ${item.error}`}
                            </div>
                          )}
                          <div className="text-xs text-text-muted dark:text-gray-400 mt-1 truncate">{item.url}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.status === 'failed' && (
                            <button className="text-accent-blue hover:text-blue-600 text-sm">Retry</button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-text-muted hover:text-badge-red text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="text-center py-4 text-sm text-text-muted dark:text-gray-400">
            Showing {filtered.length} of {history.length} records
          </div>
        </div>
      )}
    </MainLayout>
  );
}
