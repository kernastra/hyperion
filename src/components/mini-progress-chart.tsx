export function MiniProgressChart() {
  return (
    <div className="mb-4 lg:mb-6">
      <div className="flex items-end gap-1 h-12 lg:h-16 mb-2 overflow-x-auto">
        <div className="w-2 lg:w-3 bg-gray-300 h-3 lg:h-4 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-gray-300 h-4 lg:h-6 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-gray-300 h-6 lg:h-8 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-gray-300 h-4 lg:h-5 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-gray-300 h-8 lg:h-10 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-gray-300 h-5 lg:h-7 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-gray-300 h-9 lg:h-12 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-gray-300 h-7 lg:h-9 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-gray-300 h-10 lg:h-14 rounded-sm flex-shrink-0"></div>
        <div className="w-2 lg:w-3 bg-accent-blue h-12 lg:h-16 rounded-sm flex-shrink-0"></div>
      </div>
      <p className="text-xs lg:text-sm text-text-muted">Download activity (last 30 days)</p>
    </div>
  );
}
