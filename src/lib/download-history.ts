export interface DownloadRecord {
  id: string;
  url: string;
  title: string;
  filename: string;
  status: 'completed' | 'failed';
  timestamp: string;
  error?: string;
  fileSize?: number;
  duration?: number;
}

class DownloadHistoryManager {
  private static instance: DownloadHistoryManager;
  private history: DownloadRecord[] = [];

  static getInstance(): DownloadHistoryManager {
    if (!DownloadHistoryManager.instance) {
      DownloadHistoryManager.instance = new DownloadHistoryManager();
    }
    return DownloadHistoryManager.instance;
  }

  addRecord(record: Omit<DownloadRecord, 'id' | 'timestamp'>): void {
    const newRecord: DownloadRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    this.history.unshift(newRecord);
    
    // Keep only the last 100 records
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
  }

  getHistory(): DownloadRecord[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  removeRecord(id: string): void {
    this.history = this.history.filter(record => record.id !== id);
  }
}

export default DownloadHistoryManager;
