import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SEGMENT_DISTRIBUTION, CLUSTER_COMPARISON, CLUSTERS_INFO } from '../../services/mockData';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

export default function SegmentDistribution({ 
  selectedCluster, 
  setSelectedCluster,
  customers = []
}) {
  const [activeView, setActiveView] = useState('distribution'); // 'distribution' | 'comparison'

  // Dynamically compute segment distribution from real customers if available
  const distributionData = useMemo(() => {
    if (!customers || customers.length === 0) {
      return SEGMENT_DISTRIBUTION;
    }

    const counts = {};
    customers.forEach((c) => {
      const cid = c.cluster !== null && c.cluster !== undefined ? c.cluster : -1;
      counts[cid] = (counts[cid] || 0) + 1;
    });

    const total = customers.length;
    return Object.entries(counts).map(([cidStr, count]) => {
      const cid = Number(cidStr);
      const info = CLUSTERS_INFO.find((info) => info.id === cid) || {
        name: cid === -1 ? 'Unassigned (Pending Spark)' : `Cluster ${cid}`,
        color: cid === -1 ? '#6b7280' : '#8b5cf6'
      };

      return {
        name: info.name,
        value: count,
        percentage: ((count / total) * 100).toFixed(1),
        color: info.color,
        clusterId: cid
      };
    });
  }, [customers]);

  // Dynamically compute comparison metrics (income, spending, age) from real customers
  const comparisonData = useMemo(() => {
    if (!customers || customers.length === 0) {
      return CLUSTER_COMPARISON;
    }

    const groups = {};
    customers.forEach((c) => {
      const cid = c.cluster !== null && c.cluster !== undefined ? c.cluster : -1;
      if (!groups[cid]) {
        groups[cid] = { totalIncome: 0, totalSpending: 0, totalAge: 0, count: 0 };
      }
      groups[cid].totalIncome += c.annualIncome;
      groups[cid].totalSpending += c.spendingScore;
      groups[cid].totalAge += c.age;
      groups[cid].count += 1;
    });

    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([cidStr, g]) => ({
        cluster: Number(cidStr) === -1 ? 'Unassigned' : `Cluster ${cidStr}`,
        avgIncome: Number((g.totalIncome / g.count).toFixed(1)),
        avgSpending: Number((g.totalSpending / g.count).toFixed(1)),
        avgAge: Number((g.totalAge / g.count).toFixed(1))
      }));
  }, [customers]);

  const customDonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-[#13131a] border border-[#8b5cf6]/40 shadow-xl text-xs space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.name}
          </div>
          <div className="text-gray-300">
            Customers: <span className="text-white font-bold">{data.value}</span> ({data.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  const customBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-[#13131a] border border-[#8b5cf6]/40 shadow-xl text-xs space-y-1">
          <div className="font-bold text-white border-b border-white/10 pb-1">{label}</div>
          {payload.map((p, idx) => (
            <div key={idx} className="flex justify-between gap-4" style={{ color: p.color }}>
              <span>{p.name}:</span>
              <span className="font-bold">{p.value} {p.name.includes('Income') ? 'k$' : ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {activeView === 'distribution' ? 'Segment Volume Breakdown' : 'Cluster Metrics Comparison'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {activeView === 'distribution'
              ? 'Proportion of total customer base per identified segment'
              : 'Centroid profiles: Income vs. Spending vs. Age'}
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-[#0d0c1d] border border-white/10 text-xs">
          <button
            onClick={() => setActiveView('distribution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeView === 'distribution'
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeView === 'comparison'
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Comparison</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {activeView === 'distribution' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart */}
          <div className="md:col-span-7 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  onClick={(entry) =>
                    setSelectedCluster(
                      selectedCluster === String(entry.clusterId) ? 'all' : String(entry.clusterId)
                    )
                  }
                  cursor="pointer"
                >
                  {distributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={selectedCluster === String(entry.clusterId) ? '#ffffff' : '#13131a'}
                      strokeWidth={selectedCluster === String(entry.clusterId) ? 2 : 1}
                      fillOpacity={
                        selectedCluster === 'all' || selectedCluster === String(entry.clusterId)
                          ? 1
                          : 0.3
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={customDonutTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Segment Breakdown List */}
          <div className="md:col-span-5 space-y-2">
            {distributionData.map((segment) => {
              const isSelected = selectedCluster === String(segment.clusterId);
              return (
                <div
                  key={segment.clusterId}
                  onClick={() =>
                    setSelectedCluster(isSelected ? 'all' : String(segment.clusterId))
                  }
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white/10 border-[#8b5cf6] shadow-sm'
                      : 'bg-[#0d0c1d]/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-xs font-semibold text-gray-200 truncate">
                      {segment.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-white font-mono">{segment.value}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({segment.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Cluster Comparison Bar Chart */
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2b44" opacity={0.4} />
              <XAxis dataKey="cluster" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip content={customBarTooltip} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="avgIncome" name="Avg Annual Income ($k)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgSpending" name="Avg Spending Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgAge" name="Avg Age (Yrs)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
