import SimpleDownloadForm from '@/components/simple-download-form-basic';
import { MainLayout } from '@/components/main-layout';
import DownloadsSidebar from '@/components/downloads-sidebar-enhanced';
import { MiniProgressChart } from '@/components/mini-progress-chart';
import { RecentDownloadsList } from '@/components/recent-downloads-list';

export default function Home() {
  return (
    <MainLayout rightSidebar={<DownloadsSidebar />}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 pt-16 lg:pt-0">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark dark:text-white">Downloads</h1>
          <p className="text-text-muted dark:text-gray-300 text-sm lg:text-base">Manage your video downloads</p>
        </div>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-full border-2 border-white"></div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-full border-2 border-white"></div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-500 rounded-full border-2 border-white"></div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
            +2
          </div>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="mb-4 lg:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
        <SimpleDownloadForm />
      </div>

      {/* Mini Progress Chart */}
      <MiniProgressChart />

      {/* Recent Downloads List */}
      <RecentDownloadsList />
    </MainLayout>
  );
}
