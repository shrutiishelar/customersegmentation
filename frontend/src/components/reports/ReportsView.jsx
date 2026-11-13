import { useState } from 'react';
import { fetchCustomersFromApi, fetchSegmentationResults } from '../../services/api';
import {
  FileText,
  Download,
  CheckCircle,
  Database,
  Cpu,
  Layers,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

/**
 * Derives distinct, meaningful persona names matching MarketingView.jsx
 * based on the actual 3-dimensional cluster feature averages (Age, Income, Spending Score).
 */
function getDistinctPersonaName(cluster) {
  const cid = cluster.clusterId;
  const income = Number(cluster.avgAnnualIncome || 0);
  const spending = Number(cluster.avgSpendingScore || 0);
  const age = Number(cluster.avgAge || 0);

  // 1. High Income (>= $90k), Low/Moderate Spending (< 45)
  if (income >= 90 && spending < 45) {
    return "Affluent Wealth Accumulators";
  }

  // 2. Upper-Middle Income ($65k-$90k), Low Spending (< 45)
  if (income >= 65 && income < 90 && spending < 45) {
    return "Frugal Mid-Career Professionals";
  }

  // 3. Middle Income ($45k-$70k), Moderate Spending, Mature Age (>= 48)
  if (age >= 48 && income >= 45 && income < 70 && spending >= 35 && spending < 60) {
    return "Mature Pragmatic Consumers";
  }

  // 4. Middle Income ($45k-$70k), High Spending (>= 60), Young Age (< 35)
  if (age < 35 && income >= 45 && income < 70 && spending >= 60) {
    return "Young Trendsetting Spenders";
  }

  // 5. Modest Income (< $45k), Low Spending (< 45)
  if (income < 45 && spending < 45) {
    return "Careful Budget Economizers";
  }

  // Fallback by cluster ID to guarantee persona name consistency for standard K=5
  const idMap = {
    0: "Mature Pragmatic Consumers",
    1: "Young Trendsetting Spenders",
    2: "Affluent Wealth Accumulators",
    3: "Frugal Mid-Career Professionals",
    4: "Careful Budget Economizers"
  };
  if (cid !== undefined && idMap[cid]) {
    return idMap[cid];
  }

  // Dynamic fallback for custom K values
  return cluster.name || `Cluster ${cid}`;
}

export default function ReportsView() {
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExportingCustomers, setIsExportingCustomers] = useState(false);
  const [isExportingCentroids, setIsExportingCentroids] = useState(false);

  // Export 1: Full Segmented Customers Dataset CSV (Live from MongoDB + Spark)
  const exportCustomersCsv = async () => {
    setIsExportingCustomers(true);
    setDownloadSuccess('');
    setErrorMessage('');

    try {
      // Fetch live customer entities from MongoDB and latest Spark cluster metadata in parallel
      const [customers, segResults] = await Promise.all([
        fetchCustomersFromApi(),
        fetchSegmentationResults().catch(() => null)
      ]);

      if (!Array.isArray(customers) || customers.length === 0) {
        throw new Error('No customer records found in MongoDB database. Ingest a dataset first.');
      }

      // Map cluster IDs to distinct persona names matching MarketingView.jsx
      const clusterNameMap = {};
      if (segResults && Array.isArray(segResults.clusterSummaries)) {
        segResults.clusterSummaries.forEach((s) => {
          clusterNameMap[s.clusterId] = getDistinctPersonaName(s);
        });
      }

      const headers = ['CustomerID,Gender,Age,AnnualIncome_k,SpendingScore_1_100,ClusterID,ClusterName'];
      const rows = customers.map((c) => {
        const cid = c.customerId || c.id || '';
        const gender = c.gender || '';
        const age = c.age !== undefined && c.age !== null ? c.age : '';
        const income = c.annualIncome !== undefined && c.annualIncome !== null ? c.annualIncome : '';
        const spending = c.spendingScore !== undefined && c.spendingScore !== null ? c.spendingScore : '';
        const clusterId = c.cluster !== null && c.cluster !== undefined && c.cluster !== -1 ? c.cluster : 'Unassigned';
        const clusterName = clusterId !== 'Unassigned'
          ? (clusterNameMap[clusterId] || `Cluster ${clusterId}`)
          : 'Unassigned';

        return `${cid},${gender},${age},${income},${spending},${clusterId},"${clusterName}"`;
      });

      const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `customer_segmentation_live_dataset_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(`Successfully exported ${customers.length} live customer records from MongoDB!`);
      setTimeout(() => setDownloadSuccess(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to export customer dataset from backend.');
    } finally {
      setIsExportingCustomers(false);
    }
  };

  // Export 2: Cluster Centroids & Aggregates CSV (Live from Apache Spark MLlib)
  const exportCentroidsCsv = async () => {
    setIsExportingCentroids(true);
    setDownloadSuccess('');
    setErrorMessage('');

    try {
      // Fetch segmentation results containing the 5 cluster centroid summaries from Spark MLlib
      const segResults = await fetchSegmentationResults();

      const summaries = Array.isArray(segResults)
        ? segResults
        : (segResults?.clusterSummaries || []);

      if (summaries.length === 0) {
        throw new Error('No Apache Spark segmentation results found. Please execute a K-Means job in the Spark tab first.');
      }

      // Sort strictly by ClusterID 0–4
      const sortedSummaries = [...summaries].sort(
        (a, b) => Number(a.clusterId ?? 0) - Number(b.clusterId ?? 0)
      );

      const headers = ['ClusterID,ClusterName,CustomerCount,AvgAnnualIncome_k,AvgSpendingScore_1_100,AvgAge_Yrs'];
      const rows = sortedSummaries.map((c) => {
        const clusterId = c.clusterId !== undefined ? c.clusterId : '';
        const clusterName = getDistinctPersonaName(c);
        const count = c.customerCount !== undefined
          ? c.customerCount
          : (c.count !== undefined ? c.count : 0);
        const income = c.avgAnnualIncome !== undefined
          ? Number(c.avgAnnualIncome).toFixed(1)
          : (c.centroidIncome !== undefined ? Number(c.centroidIncome).toFixed(1) : '');
        const spending = c.avgSpendingScore !== undefined
          ? Number(c.avgSpendingScore).toFixed(1)
          : (c.centroidSpending !== undefined ? Number(c.centroidSpending).toFixed(1) : '');
        const age = c.avgAge !== undefined ? Number(c.avgAge).toFixed(1) : '';

        return `${clusterId},"${clusterName}",${count},${income},${spending},${age}`;
      });

      const csvContent = [headers, ...rows].join('\n');

      if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `spark_mllib_cluster_centroids_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        link.download = `spark_mllib_cluster_centroids_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadSuccess(`Successfully exported ${sortedSummaries.length} live cluster centroid summaries calculated by Apache Spark 4.0!`);
      setTimeout(() => setDownloadSuccess(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to export cluster centroids from backend.');
    } finally {
      setIsExportingCentroids(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-[#13131a] border border-[#8b5cf6]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              Analytical Reports & Raw Data Export Center
            </h2>
            <p className="text-xs text-gray-400">
              Download clean CSVs of cluster assignments, centroid vectors, and marketing matrices generated from live MongoDB and Apache Spark data.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{downloadSuccess}</span>
          </div>
          <button
            onClick={() => setDownloadSuccess('')}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Dataset CSV */}
        <div className="p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#8b5cf6] uppercase tracking-wider">
              Primary Data Export (Live MongoDB)
            </span>
            <h3 className="text-base font-bold text-white">
              Full Segmented Customers Dataset (CSV)
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Export actual customer records from MongoDB complete with Annual Income, Spending Score, Age, Gender, and assigned Spark K-Means cluster IDs and labels.
            </p>
          </div>
          <button
            onClick={exportCustomersCsv}
            disabled={isExportingCustomers || isExportingCentroids}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isExportingCustomers ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching Live Records from MongoDB...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Segmented Dataset (.CSV)</span>
              </>
            )}
          </button>
        </div>

        {/* Centroids Summary CSV */}
        <div className="p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Summary Metrics Export (Live Spark MLlib)
            </span>
            <h3 className="text-base font-bold text-white">
              Cluster Centroids & Aggregates (CSV)
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Export the mathematical center coordinates calculated by Apache Spark MLlib, including cluster population proportions, mean spending scores, mean income, and mean age.
            </p>
          </div>
          <button
            onClick={exportCentroidsCsv}
            disabled={isExportingCustomers || isExportingCentroids}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#181824] hover:bg-[#201f30] text-gray-200 hover:text-white border border-[#8b5cf6]/30 font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isExportingCentroids ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>Fetching Spark Centroids...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-blue-400" />
                <span>Download Centroids Summary (.CSV)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* College Project Architecture Summary */}
      <div className="p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8b5cf6]" />
          <span>Project Architecture & Technical Execution Summary</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0d0c1d] border border-white/5 space-y-1.5">
            <div className="font-bold text-[#8b5cf6] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Big Data Engine</span>
            </div>
            <p className="text-gray-400">
              Apache Spark Java API with MLlib VectorAssembler and KMeansModel. Computes WCSS for optimal K evaluation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d0c1d] border border-white/5 space-y-1.5">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Persistence Layer</span>
            </div>
            <p className="text-gray-400">
              MongoDB Document Store with Spring Data MongoDB repositories for high-throughput customer ingestion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d0c1d] border border-white/5 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Analytics Frontend</span>
            </div>
            <p className="text-gray-400">
              React 19 + Vite 8 + Tailwind CSS v4 + Recharts. Responsive dark theme with live dynamic filtering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
