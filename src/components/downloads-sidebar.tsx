export function DownloadsSidebar() {
  return (
    <>
      {/* Download Stats */}
      <div className="mb-6">
        <h3 className="font-semibold text-text-dark dark:text-white mb-3 text-lg">Download Stats</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-muted dark:text-gray-300">Videos</span>
              <span className="font-medium dark:text-white">24 files</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
              <div className="bg-accent-green h-1 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-muted dark:text-gray-300">Audio</span>
              <span className="font-medium dark:text-white">12 files</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
              <div className="bg-accent-green h-1 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-muted dark:text-gray-300">Playlists</span>
              <span className="font-medium dark:text-white">6 items</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
              <div className="bg-accent-green h-1 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 transition-colors">
        <div className="w-10 h-10 bg-accent-blue rounded-lg flex items-center justify-center text-white mb-3 text-lg">
          💡
        </div>
        <h4 className="font-semibold text-text-dark dark:text-white mb-2">Download Faster</h4>
        <p className="text-sm text-text-muted dark:text-gray-300 mb-3">
          Use batch downloads and configure concurrent connections to speed up your downloads.
        </p>
        <button className="w-full bg-accent-blue text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          VIEW TIPS
        </button>
      </div>
    </>
  );
}
