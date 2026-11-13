import {
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  Users,
  Download,
  Crown
} from 'lucide-react';
import { CLUSTERS_INFO } from '../../services/mockData';

export default function QuickActions({
  searchQuery,
  setSearchQuery,
  selectedCluster,
  setSelectedCluster,
  onResetFilters,
  setActiveTab,
  onExportCsv
}) {
  return (
    <div className="p-5 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search & Filter inputs */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Customer ID (e.g. CUST-015, Female, 35)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0c1d] border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-hidden focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Cluster Selector */}
          <div className="relative min-w-[190px]">
            <Filter className="w-4 h-4 text-[#8b5cf6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#0d0c1d] border border-white/10 text-white text-xs sm:text-sm appearance-none focus:outline-hidden focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] cursor-pointer"
            >
              <option value="all">All Clusters (5 Total)</option>
              {CLUSTERS_INFO.map((cluster) => (
                <option key={cluster.id} value={String(cluster.id)}>
                  Cluster {cluster.id}: {cluster.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedCluster !== 'all' || searchQuery) && (
            <button
              onClick={onResetFilters}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold transition-all shrink-0"
              title="Reset all search & cluster filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter: VIP High Earners */}
          <button
            onClick={() => setSelectedCluster('2')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
          >
            <Crown className="w-3.5 h-3.5 text-emerald-400" />
            <span>VIP Elite (C2)</span>
          </button>

          {/* Quick Filter: Savers */}
          <button
            onClick={() => setSelectedCluster('0')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Savers (C0)</span>
          </button>

          {/* Jump to Customer Table */}
          <button
            onClick={() => setActiveTab('customers')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white hover:opacity-90 shadow-sm transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View All Records</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#181824] hover:bg-[#201f30] text-gray-300 hover:text-white border border-white/10 transition-all"
            title="Download CSV of current selection"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
