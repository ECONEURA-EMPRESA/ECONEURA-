export default function Header() {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🧠</div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                ECONEURA
              </h1>
              <p className="text-sm text-gray-400">
                AI Agents Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Gateway Online</span>
            </div>
            
            <div className="text-xs text-gray-500">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
