import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  FileText,
  LayoutDashboard,
  Layers,
  Sparkles,
  Target,
  Users,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
  { id: 'customers', label: 'Customers', icon: Users, badge: '200' },
  { id: 'dataset', label: 'Dataset & Preprocessing', icon: Database, badge: null },
  { id: 'segmentation', label: 'Spark Segmentation', icon: Cpu, badge: 'ML' },
  { id: 'marketing', label: 'Marketing Analytics', icon: Target, badge: null },
  { id: 'reports', label: 'Reports & Export', icon: FileText, badge: 'CSV' },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0d0c1d] border-r border-[#8b5cf6]/20 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand / Logo Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-[#8b5cf6]/15 bg-[#0a0918]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] text-white shadow-lg shadow-[#8b5cf6]/25 shrink-0">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="font-bold text-base tracking-tight text-white truncate flex items-center gap-1.5">
                  CustomerSeg
                  <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
                </span>
                <span className="text-[11px] text-gray-400 font-medium tracking-wide truncate">
                  Big Data Analytics
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Core Modules
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#3b82f6]/10 text-white border border-[#8b5cf6]/40 shadow-sm shadow-[#8b5cf6]/10 font-semibold'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center' : 'justify-between'}
                `}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0
                      ${isActive ? 'text-[#8b5cf6]' : 'text-gray-400 group-hover:text-gray-200'}
                    `}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0
                      ${isActive
                        ? 'bg-[#8b5cf6] text-white shadow-xs shadow-[#8b5cf6]/50'
                        : 'bg-white/10 text-gray-400 group-hover:text-gray-300'
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator Strip */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-[#8b5cf6] to-[#3b82f6] rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Project Architecture Tag */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-4 rounded-xl bg-[#13131a] border border-[#8b5cf6]/15">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
              <span className="text-xs font-semibold text-purple-300">Big Data Stack</span>
            </div>
            <div className="text-[11px] text-gray-400 leading-relaxed">
              Spark MLlib K-Means • Java 21 • Spring Boot • MongoDB
            </div>
          </div>
        )}

        {/* Collapse Toggle Footer for Desktop */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-[#8b5cf6]/15 bg-[#0a0918]">
          {!isCollapsed && (
            <span className="text-xs text-gray-500 font-medium px-2">Collapse menu</span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors ml-auto"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
