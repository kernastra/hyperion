import SimpleDownloadForm from '@/components/simple-download-form-basic';
import { MainLayout } from '@/components/main-layout';
import DownloadsSidebar from '@/components/downloads-sidebar-enhanced';

export default function Home() {
  return (
    <MainLayout rightSidebar={<DownloadsSidebar />}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 pt-2 lg:pt-0">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark dark:text-white">Downloads</h1>
          <p className="text-text-muted dark:text-gray-300 text-sm lg:text-base">Add URLs to download videos from YouTube and other platforms</p>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 border border-gray-100 dark:border-gray-600 transition-colors">
        <h2 className="text-lg font-semibold text-text-dark dark:text-white mb-4">Add New Download</h2>
        <SimpleDownloadForm />
      </div>

      {/* Supported platforms */}
      <div className="mt-6 bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 border border-gray-100 dark:border-gray-600 transition-colors">
        <h3 className="font-semibold text-text-dark dark:text-white mb-3">Supported Platforms</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: 'YouTube', color: 'bg-red-500', icon: '▶' },
            { name: 'Vimeo', color: 'bg-blue-500', icon: '▶' },
            { name: 'SoundCloud', color: 'bg-orange-500', icon: '🎵' },
            { name: 'Twitter/X', color: 'bg-gray-800', icon: '𝕏' },
            { name: 'Instagram', color: 'bg-pink-500', icon: '📷' },
            { name: 'TikTok', color: 'bg-black', icon: '♪' },
            { name: 'Reddit', color: 'bg-orange-600', icon: '🔴' },
            { name: '1000+ more', color: 'bg-accent-blue', icon: '∞' },
          ].map((platform) => (
            <div key={platform.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <div className={`w-6 h-6 ${platform.color} rounded flex items-center justify-center text-white text-xs`}>
                {platform.icon}
              </div>
              <span className="text-sm text-text-dark dark:text-white">{platform.name}</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
