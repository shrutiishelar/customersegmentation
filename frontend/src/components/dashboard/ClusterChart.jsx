import { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CLUSTERS_INFO } from '../../services/mockData';
import { Info } from 'lucide-react';

const UNASSIGNED_INFO = {
  id: -1,
  name: 'Unassigned (Pending Spark Job)',
  shortName: 'Unassigned',
  color: '#6b7280'
};

const getClusterInfo = (clusterId) => {
  if (clusterId === -1 || clusterId === null || clusterId === undefined || clusterId === 'Unassigned') {
    return UNASSIGNED_INFO;
  }
  return (
    CLUSTERS_INFO.find((c) => c.id === clusterId) || {
      id: clusterId,
      name: `Cluster ${clusterId}`,
      shortName: `C${clusterId}`,
      color: '#8b5cf6'
    }
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const cluster = getClusterInfo(data.cluster);

    return (
      <div className="p-3.5 rounded-xl bg-[#13131a] border border-[#8b5cf6]/40 shadow-2xl backdrop-blur-md text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/10">
          <span className="font-bold text-white text-sm">{data.id}</span>
          <span
            className="px-2 py-0.5 rounded-md font-semibold text-[10px]"
            style={{ backgroundColor: `${cluster.color}20`, color: cluster.color }}
          >
            {cluster.name}
          </span>
        </div>
        <div className="text-gray-300 grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
          <div><span className="text-gray-400">Gender:</span> {data.gender}</div>
          <div><span className="text-gray-400">Age:</span> {data.age} yrs</div>
          <div><span className="text-gray-400">Income:</span> ${data.annualIncome}k/yr</div>
          <div><span className="text-gray-400">Spending Score:</span> {data.spendingScore}/100</div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ClusterChart({ 
  customers, 
  selectedCluster, 
  setSelectedCluster 
}) {
  const [hoveredCluster, setHoveredCluster] = useState(null);

  // Dynamically determine available clusters from customers dataset
  const availableClusters = useMemo(() => {
    const uniqueIds = Array.from(new Set(customers.map((c) => c.cluster))).sort((a, b) => {
      if (a === -1 || a === 'Unassigned') return 1;
      if (b === -1 || b === 'Unassigned') return -1;
      return Number(a) - Number(b);
    });
    return uniqueIds.map((id) => getClusterInfo(id));
  }, [customers]);

  // Filter or highlight based on user selection
  const chartData = useMemo(() => {
    return customers.map((c) => ({
      ...c,
      fillColor: getClusterInfo(c.cluster).color
    }));
  }, [customers]);

  return (
    <div className="p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Customer Segmentation Map (K-Means Clusters)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8b5cf6]/15 text-[#c084fc] font-semibold border border-[#8b5cf6]/30">
              Income vs. Spending
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            2D feature projection of Annual Income (k$) vs. Spending Score (1-100)
          </p>
        </div>

        {/* Legend / Dynamic Cluster Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCluster('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCluster === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All ({customers.length})
          </button>
          {availableClusters.map((cluster) => {
            const isSelected = selectedCluster === String(cluster.id);
            return (
              <button
                key={cluster.id}
                onClick={() => setSelectedCluster(isSelected ? 'all' : String(cluster.id))}
                onMouseEnter={() => setHoveredCluster(cluster.id)}
                onMouseLeave={() => setHoveredCluster(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 text-white font-semibold'
                    : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
                style={{
                  borderColor: isSelected ? cluster.color : 'transparent',
                  boxShadow: isSelected ? `0 0 12px ${cluster.color}40` : undefined
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cluster.color }}
                />
                <span>{cluster.id === -1 ? 'Unassigned' : `C${cluster.id}: ${cluster.shortName}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Scatter Plot */}
      <div className="w-full h-[360px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 25, bottom: 25, left: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2e2b44"
              opacity={0.5}
            />
            <XAxis
              type="number"
              dataKey="annualIncome"
              name="Annual Income"
              unit="k$"
              domain={[10, 140]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#3b3852' }}
              axisLine={{ stroke: '#3b3852' }}
              label={{
                value: 'Annual Income (k$)',
                position: 'insideBottom',
                offset: -12,
                fill: '#9ca3af',
                fontSize: 12,
                fontWeight: 600
              }}
            />
            <YAxis
              type="number"
              dataKey="spendingScore"
              name="Spending Score"
              unit=""
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#3b3852' }}
              axisLine={{ stroke: '#3b3852' }}
              label={{
                value: 'Spending Score (1-100)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#9ca3af',
                fontSize: 12,
                fontWeight: 600
              }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3', stroke: '#8b5cf6' }}
            />
            <Scatter
              name="Customers"
              data={chartData}
              animationDuration={800}
            >
              {chartData.map((entry, index) => {
                const isMatchingSelected =
                  selectedCluster === 'all' || selectedCluster === String(entry.cluster);
                const isHovered =
                  hoveredCluster === null || hoveredCluster === entry.cluster;

                const opacity = isMatchingSelected && isHovered ? 0.95 : 0.15;
                const stroke = isMatchingSelected ? '#ffffff' : 'transparent';

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fillColor}
                    fillOpacity={opacity}
                    stroke={stroke}
                    strokeWidth={isMatchingSelected ? 1 : 0}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Insights Footnote */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0d0c1d] border border-[#8b5cf6]/15 text-xs text-gray-400">
        <Info className="w-4 h-4 text-[#8b5cf6] shrink-0" />
        <span>
          Mathematical cluster partitioning generated by Spark MLlib K-Means: high earners with high spending (top right), high earners with conservative spending (bottom right), moderate income balanced buyers (center), and entry-level segments (left).
        </span>
      </div>
    </div>
  );
}
