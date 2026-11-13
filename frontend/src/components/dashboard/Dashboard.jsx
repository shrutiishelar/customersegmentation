import { useState, useMemo, useEffect } from 'react';
import MetricCard from './MetricCard';
import ClusterChart from './ClusterChart';
import SegmentDistribution from './SegmentDistribution';
import QuickActions from './QuickActions';
import {
  MOCK_CUSTOMERS,
  CLUSTERS_INFO,
  DEMO_METADATA,
  DEMO_STATISTICS
} from '../../services/mockData';
import {
  fetchCustomersFromApi,
  checkSystemStatus
} from '../../services/api';
import {
  Users,
  Layers,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isSparkLive, setIsSparkLive] = useState(false);
  const [customersData, setCustomersData] = useState(MOCK_CUSTOMERS);

  useEffect(() => {
    let isMounted = true;

    async function syncBackend() {
      try {
        const status = await checkSystemStatus();
        if (status.apiConnected && status.mongoConnected && status.totalCustomers > 0) {
          const apiCustomers = await fetchCustomersFromApi();
          if (isMounted && Array.isArray(apiCustomers) && apiCustomers.length > 0) {
            const mapped = apiCustomers.map((c) => ({
              id: c.customerId || c.id,
              gender: c.gender,
              age: c.age,
              annualIncome: c.annualIncome,
              spendingScore: c.spendingScore,
              // Strictly preserve real cluster or explicitly mark as unassigned (-1)
              cluster: c.cluster !== null && c.cluster !== undefined ? c.cluster : -1
            }));
            setCustomersData(mapped);
            setIsLiveBackend(true);
            setIsSparkLive(!!status.sparkConnected);
          }
        }
      } catch {
        if (isMounted) {
          setIsLiveBackend(false);
          setIsSparkLive(false);
          setCustomersData(MOCK_CUSTOMERS);
        }
      }
    }

    syncBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered customer list based on search and cluster selection
  const filteredCustomers = useMemo(() => {
    return customersData.filter((c) => {
      const matchesCluster =
        selectedCluster === 'all' || String(c.cluster) === selectedCluster;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.gender.toLowerCase().includes(q) ||
        String(c.age).includes(q) ||
        String(c.annualIncome).includes(q) ||
        String(c.spendingScore).includes(q);

      return matchesCluster && matchesSearch;
    });
  }, [customersData, selectedCluster, searchQuery]);

  // Distinct cluster calculation
  const { distinctClusterCount, unassignedCount } = useMemo(() => {
    const validClusters = new Set(
      customersData
        .map((c) => c.cluster)
        .filter((c) => c !== null && c !== undefined && c !== -1 && c !== 'Unassigned')
    );
    const unassigned = customersData.filter(
      (c) => c.cluster === null || c.cluster === undefined || c.cluster === -1 || c.cluster === 'Unassigned'
    ).length;

    return {
      distinctClusterCount: validClusters.size || DEMO_STATISTICS.numberOfClusters,
      unassignedCount: unassigned
    };
  }, [customersData]);

  // Dynamically compute KPIs for filtered selection
  const dynamicStats = useMemo(() => {
    if (!filteredCustomers.length) {
      return { count: 0, avgIncome: 0, avgSpending: 0, avgAge: 0 };
    }
    const totalIncome = filteredCustomers.reduce((acc, c) => acc + c.annualIncome, 0);
    const totalSpending = filteredCustomers.reduce((acc, c) => acc + c.spendingScore, 0);
    const totalAge = filteredCustomers.reduce((acc, c) => acc + c.age, 0);
    return {
      count: filteredCustomers.length,
      avgIncome: (totalIncome / filteredCustomers.length).toFixed(1),
      avgSpending: (totalSpending / filteredCustomers.length).toFixed(1),
      avgAge: (totalAge / filteredCustomers.length).toFixed(1)
    };
  }, [filteredCustomers]);

  const handleResetFilters = () => {
    setSelectedCluster('all');
    setSearchQuery('');
  };

  // Export current filtered view as CSV
  const handleExportCsv = () => {
    const headers = ['CustomerID,Gender,Age,AnnualIncome_k,SpendingScore_1_100,ClusterID,ClusterName'];
    const rows = filteredCustomers.map((c) => {
      const cluster = CLUSTERS_INFO.find((info) => info.id === c.cluster);
      const clusterName = c.cluster === -1 ? 'Unassigned' : cluster?.name || `Cluster ${c.cluster}`;
      return `${c.id},${c.gender},${c.age},${c.annualIncome},${c.spendingScore},${c.cluster},"${clusterName}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_segmentation_${isLiveBackend ? 'live_db' : 'demo'}_${selectedCluster === 'all' ? 'all' : 'cluster_' + selectedCluster}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
        isLiveBackend
          ? 'bg-gradient-to-r from-[#131c17] to-[#13131a] border-emerald-500/30'
          : 'bg-gradient-to-r from-[#181824] to-[#13131a] border-[#8b5cf6]/30'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isLiveBackend ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#8b5cf6]/15 text-[#8b5cf6]'
          }`}>
            {isLiveBackend ? (
              <Database className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isLiveBackend ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {isLiveBackend ? 'Live Data: MongoDB Connected' : 'Notice: Frontend Demo Mode'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                {isLiveBackend ? `Active Collection (${customersData.length} records)` : `${DEMO_METADATA.datasetName} (N=200)`}
              </span>
              {isSparkLive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium">
                  Spark 4.0 MLlib Clustered
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              {isLiveBackend
                ? unassignedCount > 0
                  ? `Analytics computed from MongoDB. ${unassignedCount} records are unassigned. Run Spark K-Means to segment.`
                  : 'Analytics and cluster charts are computed directly from live MongoDB records partitioned by Spark MLlib.'
                : 'Spring Boot backend is offline or empty. Displaying local benchmark baseline dataset.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {unassignedCount > 0 && isLiveBackend && (
            <button
              onClick={() => setActiveTab('segmentation')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Run Spark Job</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('dataset')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-purple-300 border border-[#8b5cf6]/40 transition-all cursor-pointer"
          >
            <span>Ingest New CSV</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Customers"
          value={dynamicStats.count}
          subtitle={selectedCluster === 'all' ? (isLiveBackend ? 'Live MongoDB collection' : 'Full sample population') : `Filtered: Cluster ${selectedCluster}`}
          icon={Users}
          color="purple"
          badge={isLiveBackend ? 'MongoDB' : 'Benchmark'}
          trend={selectedCluster === 'all' ? '100% of Dataset' : `${((dynamicStats.count / (customersData.length || 1)) * 100).toFixed(0)}% of Total`}
          trendPositive={true}
        />

        <MetricCard
          title="Identified Clusters"
          value={distinctClusterCount}
          subtitle={unassignedCount > 0 ? `${unassignedCount} unassigned` : `K-Means optimal k=${distinctClusterCount}`}
          icon={Layers}
          color="blue"
          badge={isSparkLive ? 'Spark MLlib' : 'Baseline'}
          trend={unassignedCount > 0 ? 'Pending Spark Job' : 'WCSS Elbow Validated'}
          trendPositive={unassignedCount === 0}
        />

        <MetricCard
          title="Avg Annual Income"
          value={`$${dynamicStats.avgIncome}k`}
          subtitle="Range: $15k - $137k"
          icon={DollarSign}
          color="emerald"
          badge="Annualized"
          trend={selectedCluster === '0' || selectedCluster === '2' ? 'High Income Segment' : 'Mid/Normal Range'}
          trendPositive={parseFloat(dynamicStats.avgIncome) >= 60}
        />

        <MetricCard
          title="Avg Spending Score"
          value={`${dynamicStats.avgSpending}/100`}
          subtitle="Range: 1 - 99"
          icon={TrendingUp}
          color="pink"
          badge="Score 1-100"
          trend={selectedCluster === '2' || selectedCluster === '4' ? 'High Spenders' : 'Conservative/Balanced'}
          trendPositive={parseFloat(dynamicStats.avgSpending) >= 50}
        />
      </div>

      {/* Quick Search & Filter Controls */}
      <QuickActions
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCluster={selectedCluster}
        setSelectedCluster={setSelectedCluster}
        onResetFilters={handleResetFilters}
        setActiveTab={setActiveTab}
        onExportCsv={handleExportCsv}
      />

      {/* Visual Analytics Grid: Scatter Plot & Segment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scatter Plot: Income vs Spending */}
        <div className="lg:col-span-7">
          <ClusterChart
            customers={filteredCustomers}
            selectedCluster={selectedCluster}
            setSelectedCluster={setSelectedCluster}
          />
        </div>

        {/* Donut & Bar Charts: Distribution & Metrics */}
        <div className="lg:col-span-5">
          <SegmentDistribution
            selectedCluster={selectedCluster}
            setSelectedCluster={setSelectedCluster}
            customers={filteredCustomers}
          />
        </div>
      </div>

      {/* Customer Segment Profiles & Strategic Insights Cards */}
      <div className="p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
              <span>Segment Personas & Marketing Action Matrix</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Data-driven personas derived from centroid coordinates for targeted campaigns
            </p>
          </div>
          <button
            onClick={() => setActiveTab('marketing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CLUSTERS_INFO.map((cluster) => {
            const isSelected = selectedCluster === String(cluster.id);
            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedCluster(isSelected ? 'all' : String(cluster.id))}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-white/10 ring-2'
                    : 'bg-[#0d0c1d] border-white/5 hover:border-white/15'
                }`}
                style={{
                  borderColor: isSelected ? cluster.color : undefined,
                  boxShadow: isSelected ? `0 0 16px ${cluster.color}30` : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                    style={{ backgroundColor: `${cluster.color}25`, color: cluster.color }}
                  >
                    Cluster {cluster.id}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400 font-bold">
                    {cluster.customerCount} users
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{cluster.name}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">
                    {cluster.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Income: ${cluster.avgIncome}k</span>
                  <span className="text-gray-400">Spend: {cluster.avgSpending}/100</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
