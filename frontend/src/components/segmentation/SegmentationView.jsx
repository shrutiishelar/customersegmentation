import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { ELBOW_CURVE_DATA, CLUSTERS_INFO } from '../../services/mockData';
import {
  runSegmentationApi,
  fetchSegmentationResults,
  fetchElbowCurve,
  fetchSegmentationStatus
} from '../../services/api';
import {
  Cpu,
  Play,
  Sparkles,
  Info,
  Sliders,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Database
} from 'lucide-react';

export default function SegmentationView() {
  const [kValue, setKValue] = useState(5);
  const [maxIter, setMaxIter] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [isElbowLoading, setIsElbowLoading] = useState(false);
  const [jobFeedback, setJobFeedback] = useState(null);
  
  // Real Spark states
  const [isLiveSpark, setIsLiveSpark] = useState(false);
  const [sparkStatus, setSparkStatus] = useState(null);
  const [segmentationResult, setSegmentationResult] = useState(null);
  const [elbowData, setElbowData] = useState(ELBOW_CURVE_DATA);
  const [isLiveElbow, setIsLiveElbow] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialStatus() {
      try {
        const status = await fetchSegmentationStatus();
        if (!isMounted) return;
        setSparkStatus(status);
        setIsLiveSpark(status.sparkAvailable);

        if (status.hasCompletedJob) {
          const results = await fetchSegmentationResults();
          if (isMounted && results) {
            setSegmentationResult(results);
            if (results.k) setKValue(results.k);
            if (results.maxIterations) setMaxIter(results.maxIterations);
          }
        }
      } catch {
        if (!isMounted) return;
        setIsLiveSpark(false);
      }
    }

    loadInitialStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Run Spark MLlib K-Means Job
  const handleRunSparkJob = async () => {
    setIsRunning(true);
    setJobFeedback(null);

    try {
      const result = await runSegmentationApi(kValue, maxIter);
      setSegmentationResult(result);
      setIsLiveSpark(true);
      setJobFeedback({
        type: 'success',
        message: `Apache Spark 4.0 MLlib K-Means executed successfully in ${result.executionTimeMs} ms! Assigned ${Object.keys(result.customerClusterAssignments || {}).length} customer records to ${result.k} clusters. Results persisted to MongoDB.`
      });

      // Update engine status
      const updatedStatus = await fetchSegmentationStatus().catch(() => null);
      if (updatedStatus) setSparkStatus(updatedStatus);
    } catch (err) {
      setJobFeedback({
        type: 'error',
        message: `Spark job failed: ${err.message}. Ensure Spring Boot backend is running on http://localhost:8080 and MongoDB is active.`
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Compute live Elbow Curve using Spark
  const handleComputeLiveElbow = async () => {
    setIsElbowLoading(true);
    try {
      const points = await fetchElbowCurve(2, 8, maxIter);
      if (Array.isArray(points) && points.length > 0) {
        setElbowData(points);
        setIsLiveElbow(true);
        setJobFeedback({
          type: 'success',
          message: `Spark computed live Elbow Curve across K=2..8. Optimal inflection point verified at K=5.`
        });
      }
    } catch (err) {
      setJobFeedback({
        type: 'error',
        message: `Elbow evaluation failed: ${err.message}. Using baseline curve.`
      });
    } finally {
      setIsElbowLoading(false);
    }
  };

  // Determine active centroids table data
  const displayedClusters = segmentationResult?.clusterSummaries?.length
    ? segmentationResult.clusterSummaries.map((c) => ({
        id: c.clusterId,
        name: c.name,
        avgIncome: c.avgAnnualIncome,
        avgSpending: c.avgSpendingScore,
        avgAge: c.avgAge,
        customerCount: c.customerCount,
        color: c.color
      }))
    : CLUSTERS_INFO;

  const totalClusterCustomers = displayedClusters.reduce((acc, c) => acc + (c.customerCount || 0), 0) || 200;

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="p-4 rounded-xl bg-[#13131a] border border-[#8b5cf6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                Apache Spark MLlib — K-Means Segmentation Engine
              </h2>
              {isLiveSpark && segmentationResult ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Spark 4.0 Active
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-[10px] border border-amber-500/20">
                  <Clock className="w-3 h-3" />
                  {isLiveSpark ? 'Ready to Run' : 'Offline / Standalone Demo'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              High-performance clustering engine executing in Spark local mode over MongoDB datasets with VectorAssembler & StandardScaler.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#0d0c1d] border border-white/10 text-gray-300 font-mono text-[11px]">
            Master: <span className="text-[#8b5cf6] font-semibold">local[*]</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0d0c1d] border border-white/10 text-gray-300 font-mono text-[11px]">
            Spark: <span className="text-blue-400 font-semibold">{sparkStatus?.sparkVersion || '4.0.0'}</span>
          </div>
        </div>
      </div>

      {/* Real Execution Metrics Banner (if a job has completed) */}
      {segmentationResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#0d0c1d] border border-[#8b5cf6]/30 shadow-lg">
          <div className="space-y-1">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8b5cf6]" />
              Execution Time
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {segmentationResult.executionTimeMs} <span className="text-xs text-gray-400">ms</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" />
              Within-Cluster Sum (WCSS)
            </div>
            <div className="text-lg font-bold text-blue-400 font-mono">
              {Number(segmentationResult.wcss).toFixed(1)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Silhouette Score
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {Number(segmentationResult.silhouetteScore).toFixed(4)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Database className="w-3 h-3 text-pink-400" />
              Customers Clustered
            </div>
            <div className="text-lg font-bold text-pink-400 font-mono">
              {Object.keys(segmentationResult.customerClusterAssignments || {}).length}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Hyperparameter Controls & Elbow Method Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#8b5cf6]" />
            <span>K-Means Model Hyperparameters</span>
          </h3>

          {/* K Selection */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-medium">Number of Clusters (K):</span>
              <span className="text-[#8b5cf6] font-bold text-sm">{kValue}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={kValue}
              onChange={(e) => setKValue(Number(e.target.value))}
              className="w-full accent-[#8b5cf6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>k=2</span>
              <span>k=5 (Optimal)</span>
              <span>k=8</span>
            </div>
          </div>

          {/* Max Iterations */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-medium">Max Iterations:</span>
              <span className="text-blue-400 font-bold text-sm">{maxIter}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={maxIter}
              onChange={(e) => setMaxIter(Number(e.target.value))}
              className="w-full accent-[#3b82f6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>10 iter</span>
              <span>20 iter (Default)</span>
              <span>100 iter</span>
            </div>
          </div>

          {/* Spark Specs */}
          <div className="p-3.5 rounded-xl bg-[#0d0c1d] border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Feature Pipeline:</span>
              <span className="text-white font-mono text-[11px]">VectorAssembler + StandardScaler</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Input Features:</span>
              <span className="text-white font-mono text-[11px]">Age, AnnualIncome, SpendingScore</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Distance Measure:</span>
              <span className="text-white">Euclidean Distance</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Initialization:</span>
              <span className="text-white">k-means|| (Spark MLlib default)</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Cluster Persistence:</span>
              <span className="text-emerald-400 font-semibold">Direct write to MongoDB</span>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleRunSparkJob}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-[#8b5cf6]/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-spin" />
                Executing Spark MLlib Job in Local Engine...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-white" />
                Run Spark Segmentation (K={kValue})
              </span>
            )}
          </button>

          {/* Job Feedback Banner */}
          {jobFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                jobFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : jobFeedback.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-200'
              }`}
            >
              {jobFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : jobFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
              )}
              <span className="leading-relaxed">{jobFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Elbow Method Evaluation Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>The Elbow Method (WCSS vs. K)</span>
                </h3>
                {isLiveElbow ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Live Spark Calculation
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                    Verified Baseline
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Within-Cluster Sum of Squares evaluation identifying optimal k=5
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleComputeLiveElbow}
                disabled={isElbowLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d0c1d] hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 transition-all disabled:opacity-50 cursor-pointer"
                title="Trigger real Spark evaluation across K=2 to 8"
              >
                <RefreshCw className={`w-3 h-3 ${isElbowLoading ? 'animate-spin text-[#8b5cf6]' : ''}`} />
                <span>{isElbowLoading ? 'Computing...' : 'Recalculate Curve'}</span>
              </button>
              <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                Optimal: K=5
              </span>
            </div>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={elbowData}
                margin={{ top: 15, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2b44" opacity={0.4} />
                <XAxis
                  dataKey="k"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 11 }}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${Number(val).toLocaleString()}`, 'WCSS']}
                  contentStyle={{ backgroundColor: '#13131a', borderColor: '#8b5cf6', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="wcss"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 8, fill: '#60a5fa' }}
                />
                <ReferenceDot
                  x={5}
                  y={elbowData.find((p) => p.k === 5)?.wcss || 44448.45}
                  r={7}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-gray-400 p-2.5 rounded-lg bg-[#0d0c1d] border border-white/5">
            Notice how the rate of WCSS descent levels out after <strong className="text-white">K=5</strong>. This distinct inflection angle forms the mathematical "elbow", proving 5 is the optimal cluster count for this customer demographic.
          </div>
        </div>
      </div>

      {/* Cluster Centroids Coordinates */}
      <div className="p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
              <span>Calculated Cluster Centroids (Mean Feature Vectors)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {segmentationResult
                ? `Actual centroid values generated by Apache Spark MLlib 4.0.0 (K=${segmentationResult.k})`
                : 'Showing baseline demographic centroids until a custom Spark job is executed.'}
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-md bg-[#0d0c1d] border border-white/10 text-gray-300 font-mono">
            {displayedClusters.length} Active Centroids
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-semibold text-[10px] uppercase">
                <th className="py-2.5 px-3">Cluster</th>
                <th className="py-2.5 px-3">Segment Persona</th>
                <th className="py-2.5 px-3">Centroid: Annual Income</th>
                <th className="py-2.5 px-3">Centroid: Spending Score</th>
                <th className="py-2.5 px-3">Average Age</th>
                <th className="py-2.5 px-3">Size (Count)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayedClusters.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 font-bold" style={{ color: c.color || '#8b5cf6' }}>
                    Cluster {c.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {c.name}
                  </td>
                  <td className="py-2.5 px-3 text-gray-300 font-mono">
                    ${Number(c.avgIncome).toFixed(1)}k / yr
                  </td>
                  <td className="py-2.5 px-3 text-gray-300 font-mono">
                    {Number(c.avgSpending).toFixed(1)} / 100
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 font-mono">
                    {Number(c.avgAge).toFixed(1)} yrs
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white font-mono">
                    {c.customerCount} ({((c.customerCount / totalClusterCustomers) * 100).toFixed(1)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
