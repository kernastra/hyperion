interface Download {
  id: string;
  title: string;
  platform: string;
  quality: string;
  size: string;
  time: string;
  type: 'video' | 'audio' | 'document';
  icon: string;
  color: string;
}

const mockDownloads: Download[] = [
  {
    id: '1',
    title: 'Amazing Nature Documentary',
    platform: 'YouTube',
    quality: '4K Video',
    size: '1.2 GB',
    time: '2:34 PM',
    type: 'video',
    icon: '▶',
    color: 'bg-red-500'
  },
  {
    id: '2',
    title: 'Coding Playlist Mix',
    platform: 'YouTube',
    quality: 'Audio Only',
    size: '156 MB',
    time: '1:15 PM',
    type: 'audio',
    icon: '🎵',
    color: 'bg-blue-500'
  },
];

const yesterdayDownloads: Download[] = [
  {
    id: '3',
    title: 'Programming Tutorial Series',
    platform: 'YouTube',
    quality: '1080p Video',
    size: '850 MB',
    time: '6:45 PM',
    type: 'document',
    icon: '📚',
    color: 'bg-green-500'
  },
];

export function RecentDownloadsList() {
  return (
    <div>
      <h3 className="font-semibold text-text-dark dark:text-white mb-4 text-base lg:text-lg">Recent Downloads</h3>
      
      {/* Today Section */}
      <div className="mb-4">
        <div className="text-sm lg:text-base font-medium text-text-muted dark:text-gray-300 mb-2">Today</div>
        <div className="space-y-2">
          {mockDownloads.map((download) => (
            <div 
              key={download.id}
              className="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <div className={`w-8 h-8 lg:w-10 lg:h-10 ${download.color} rounded-full flex items-center justify-center text-white text-sm lg:text-base flex-shrink-0`}>
                {download.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text-dark dark:text-white text-sm lg:text-base truncate">
                  {download.title}
                </div>
                <div className="text-xs lg:text-sm text-text-muted dark:text-gray-300">
                  {download.platform} • {download.quality}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm lg:text-base font-medium text-text-dark dark:text-white">
                  {download.size}
                </div>
                <div className="text-xs lg:text-sm text-text-muted dark:text-gray-300">
                  {download.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yesterday Section */}
      <div>
        <div className="text-sm lg:text-base font-medium text-text-muted dark:text-gray-300 mb-2">Yesterday</div>
        <div className="space-y-2">
          {yesterdayDownloads.map((download) => (
            <div 
              key={download.id}
              className="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <div className={`w-8 h-8 lg:w-10 lg:h-10 ${download.color} rounded-full flex items-center justify-center text-white text-sm lg:text-base flex-shrink-0`}>
                {download.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text-dark dark:text-white text-sm lg:text-base truncate">
                  {download.title}
                </div>
                <div className="text-xs lg:text-sm text-text-muted dark:text-gray-300">
                  {download.platform} • {download.quality}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm lg:text-base font-medium text-text-dark dark:text-white">
                  {download.size}
                </div>
                <div className="text-xs lg:text-sm text-text-muted dark:text-gray-300">
                  {download.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
