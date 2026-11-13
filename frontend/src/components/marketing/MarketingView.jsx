import { useState, useEffect } from 'react';
import { fetchSegmentationResults } from '../../services/api';
import {
  Target,
  Lightbulb,
  Loader2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

/**
 * Derives distinct, meaningful persona names, strategic playbooks, and primary channels
 * based on the actual 3-dimensional cluster feature averages (Age, Income, Spending Score).
 */
function getDistinctPersonaProfile(cluster) {
  const cid = cluster.clusterId;
  const income = Number(cluster.avgAnnualIncome || 0);
  const spending = Number(cluster.avgSpendingScore || 0);
  const age = Number(cluster.avgAge || 0);

  // 1. High Income (>= $90k), Low/Moderate Spending (< 45): Affluent Wealth Accumulators
  if (income >= 90 && spending < 45) {
    return {
      personaName: "Affluent Wealth Accumulators",
      tagline: "High Income · Conservative Capital",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      color: cluster.color || "#10b981",
      description: `Highest-earning consumer segment (average income $${income.toFixed(1)}k, age ${age.toFixed(1)}) maintaining deliberate, conservative spending habits. Characterized by long-term wealth preservation and high capital potential.`,
      targetStrategy: "Present high-grade durable assets, investment-backed purchases, premium VIP tier perks, private concierge consultations, and quality guarantees rather than generic promotional discounts.",
      channel: "Executive Concierge, Direct Mail, Financial Portals & Private Client Advisors",
      opportunityTier: "Ultra-High Lifetime Value (Under-Activated)",
      kpiSummary: "High Purchasing Power"
    };
  }

  // 2. Upper-Middle Income ($65k-$90k), Low Spending (< 45): Frugal Mid-Career Professionals
  if (income >= 65 && income < 90 && spending < 45) {
    return {
      personaName: "Frugal Mid-Career Professionals",
      tagline: "Upper-Middle Income · Value-Conscious",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      color: cluster.color || "#f59e0b",
      description: `Mid-30s working professionals (average age ${age.toFixed(1)}) earning solidly above average ($${income.toFixed(1)}k) but spending with extreme restraint (${spending.toFixed(1)}/100). Highly analytical and discount-selective buyers.`,
      targetStrategy: "Demonstrate clear product utility, cost-per-use efficiency, corporate wellness packages, and transparent bundle savings that emphasize practical necessity.",
      channel: "LinkedIn, Business Portals, Email Digests & Targeted Search Ads",
      opportunityTier: "High Retention Potential",
      kpiSummary: "Analytical & Price-Disciplined"
    };
  }

  // 3. Middle Income ($45k-$70k), Moderate Spending, Mature Age (>= 48): Mature Pragmatic Consumers
  if (age >= 48 && income >= 45 && income < 70 && spending >= 35 && spending < 60) {
    return {
      personaName: "Mature Pragmatic Consumers",
      tagline: "Established Demographic · Balanced Shoppers",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      color: cluster.color || "#8b5cf6",
      description: `Established, mature consumers (average age ${age.toFixed(1)}) with dependable middle income ($${income.toFixed(1)}k) and balanced, calculated purchasing patterns. Value reliability, quality guarantees, and brand trust.`,
      targetStrategy: "Deploy tiered loyalty programs, home and wellness solutions, seasonal holiday catalog discounts, and omnichannel in-store service incentives.",
      channel: "Direct Email, Verified Customer Support, SMS Alerts & In-Store Associates",
      opportunityTier: "Core Volume Demographic",
      kpiSummary: "Steady Brand Loyalty"
    };
  }

  // 4. Middle Income ($45k-$70k), High Spending (>= 60), Young Age (< 35): Young Trendsetting Spenders
  if (age < 35 && income >= 45 && income < 70 && spending >= 60) {
    return {
      personaName: "Young Trendsetting Spenders",
      tagline: "Young Demographic · High Spending Velocity",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      color: cluster.color || "#3b82f6",
      description: `Young adult consumers (average age ${age.toFixed(1)}) with moderate income ($${income.toFixed(1)}k) driving the highest spending velocity (${spending.toFixed(1)}/100). Highly responsive to brand culture and mobile trends.`,
      targetStrategy: "Leverage mobile-first commerce, app-exclusive flash drops, Buy-Now-Pay-Later (BNPL) financing, social influencer campaigns, and gamified loyalty rewards.",
      channel: "Instagram, TikTok, Mobile Push Alerts & Campus / Urban Pop-ups",
      opportunityTier: "Rapid Growth Engine",
      kpiSummary: "Trend-Driven Shoppers"
    };
  }

  // 5. Modest Income (< $45k), Low Spending (< 45): Careful Budget Economizers
  if (income < 45 && spending < 45) {
    return {
      personaName: "Careful Budget Economizers",
      tagline: "Modest Income · Essential Staples Only",
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      color: cluster.color || "#ec4899",
      description: `Cost-sensitive consumers (average age ${age.toFixed(1)}) with modest income ($${income.toFixed(1)}k) strictly managing household spending (${spending.toFixed(1)}/100). Focused almost exclusively on daily essentials.`,
      targetStrategy: "Emphasize essential staples, clearance inventory, bulk value packages, extreme savings coupons, and zero-fee flexible payment options.",
      channel: "Weekly Circular Inserts, SMS Discount Alerts, Bargain Portals & Point-of-Sale Signage",
      opportunityTier: "High Price Sensitivity",
      kpiSummary: "Necessity-Driven Buyers"
    };
  }

  // Dynamic fallback for custom K values (6, 7, 8) or arbitrary cluster distributions
  return {
    personaName: `Cluster ${cid}: ${cluster.name || 'Custom Cluster'}`,
    tagline: `Income $${income.toFixed(1)}k · Spending ${spending.toFixed(1)}/100`,
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    color: cluster.color || "#8b5cf6",
    description: `Target segment characterized by average age of ${age.toFixed(1)} years, income of $${income.toFixed(1)}k, and spending score of ${spending.toFixed(1)}/100.`,
    targetStrategy: spending >= 50
      ? "Focus on high-engagement promotional campaigns, modern digital channels, and frequency incentives."
      : "Focus on price transparency, functional utility proof points, and value-oriented messaging.",
    channel: "Digital Channels, Direct Email & Personalized Push Notifications",
    opportunityTier: "Active Segment",
    kpiSummary: `Size: ${cluster.customerCount} Users`
  };
}

export default function MarketingView() {
  const [segmentationData, setSegmentationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const loadSegmentationResults = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const results = await fetchSegmentationResults();
      if (results && results.clusterSummaries && results.clusterSummaries.length > 0) {
        setSegmentationData(results);
      } else {
        setSegmentationData(null);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to retrieve live segmentation results from Spring Boot backend.');
      setSegmentationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchSegmentationResults()
      .then((results) => {
        if (!isMounted) return;
        if (results && results.clusterSummaries && results.clusterSummaries.length > 0) {
          setSegmentationData(results);
        } else {
          setSegmentationData(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setApiError(err.message || 'Backend server not reachable on http://localhost:8080');
        setSegmentationData(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute total customers dynamically from live cluster summaries
  const totalCustomers = segmentationData?.clusterSummaries
    ? segmentationData.clusterSummaries.reduce((sum, c) => sum + (c.customerCount || 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-[#13131a] border border-[#8b5cf6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                Data-Driven Marketing Analytics & Campaign Personas
              </h2>
              {segmentationData ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Live Spark 4.0 MLlib Model
                </span>
              ) : null}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Personalized customer acquisition, engagement, and retention strategies computed from real Spark MLlib K-Means clusters.
            </p>
          </div>
        </div>

        {/* Sync / Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadSegmentationResults}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#181824] hover:bg-[#201f30] text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            title="Reload from Spring Boot Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8b5cf6] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* State 1: Loading State */}
      {isLoading && (
        <div className="p-12 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
          <h3 className="text-sm font-bold text-white">Fetching Live Cluster Analytics...</h3>
          <p className="text-xs text-gray-400 max-w-sm">
            Retrieving mathematical cluster centroids, customer distributions, and demographic profiles from Apache Spark MLlib via Spring Boot API.
          </p>
        </div>
      )}

      {/* State 2: API Error / Offline State */}
      {!isLoading && apiError && (
        <div className="p-8 rounded-2xl bg-[#13131a] border border-rose-500/30 shadow-xl space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Live Marketing Analytics Unavailable</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Backend Offline
                </span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Could not retrieve live segmentation results from the Spring Boot API (<code className="text-purple-300 font-mono">/api/segmentation/results</code>).
              </p>
              <p className="text-xs text-gray-400 font-mono bg-[#0d0c1d] p-2.5 rounded-lg border border-white/5">
                Error: {apiError}
              </p>
              <p className="text-xs text-gray-400 pt-1">
                To view live data-driven marketing personas, please ensure the Spring Boot backend is running on <code className="text-blue-400 font-mono">http://localhost:8080</code> and MongoDB is accessible. Static mock counts are strictly suppressed to maintain data integrity.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={loadSegmentationResults}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      )}

      {/* State 3: Empty State (Backend connected, but no Spark job run yet) */}
      {!isLoading && !apiError && (!segmentationData || !segmentationData.clusterSummaries || segmentationData.clusterSummaries.length === 0) && (
        <div className="p-10 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 text-center space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#8b5cf6]/10 text-[#8b5cf6] w-fit mx-auto border border-[#8b5cf6]/20">
            <Cpu className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Spark Segmentation Results Found</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              MongoDB contains customer records, but an Apache Spark K-Means clustering job has not been executed yet to generate cluster boundaries and personas.
            </p>
          </div>
          <div className="text-xs text-purple-300 bg-[#0d0c1d] p-3 rounded-xl border border-white/5 max-w-md mx-auto">
            Please navigate to the <span className="font-bold text-white">Spark Segmentation</span> tab and click <span className="font-bold text-white">Run Spark Segmentation</span> to calculate cluster centroids.
          </div>
        </div>
      )}

      {/* State 4: Live Data-Driven Personas Display */}
      {!isLoading && !apiError && segmentationData?.clusterSummaries?.length > 0 && (
        <>
          {/* Real Metrics Header Summary */}
          <div className="p-4 rounded-xl bg-[#0d0c1d] border border-[#8b5cf6]/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                <Users className="w-3 h-3 text-[#8b5cf6]" />
                Total Clustered Users
              </div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {totalCustomers}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Active Personas (K)
              </div>
              <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">
                {segmentationData.k || segmentationData.clusterSummaries.length} Segments
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Within-Cluster Inertia (WCSS)
              </div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                {Number(segmentationData.wcss).toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-pink-400" />
                Silhouette Score
              </div>
              <div className="text-lg font-bold text-pink-400 font-mono mt-0.5">
                {Number(segmentationData.silhouetteScore).toFixed(4)}
              </div>
            </div>
          </div>

          {/* Persona Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segmentationData.clusterSummaries.map((cluster) => {
              const profile = getDistinctPersonaProfile(cluster);
              const count = cluster.customerCount || 0;
              const percentage = totalCustomers > 0 ? ((count / totalCustomers) * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={cluster.clusterId}
                  className="p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 shadow-xl space-y-4 flex flex-col justify-between transition-all"
                  style={{
                    boxShadow: `0 4px 20px -2px ${profile.color}15`
                  }}
                >
                  <div className="space-y-3">
                    {/* Top Row: Cluster Pill & Dynamic Percentage */}
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase"
                        style={{ backgroundColor: `${profile.color}20`, color: profile.color }}
                      >
                        Cluster {cluster.clusterId}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 font-mono">
                        <strong className="text-white">{count}</strong> customers ({percentage}%)
                      </span>
                    </div>

                    {/* Persona Title & Tagline */}
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {profile.personaName}
                      </h3>
                      <div className="text-[11px] font-semibold text-gray-400 mt-0.5">
                        {profile.tagline}
                      </div>
                    </div>

                    {/* Demographic Description */}
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {profile.description}
                    </p>

                    {/* Live Centroid Snapshot */}
                    <div className="p-3 rounded-xl bg-[#0d0c1d] border border-white/5 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-semibold">Mean Income</div>
                        <div className="font-bold text-white font-mono mt-0.5">
                          ${Number(cluster.avgAnnualIncome).toFixed(1)}k
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-semibold">Spending Score</div>
                        <div className="font-bold text-white font-mono mt-0.5">
                          {Number(cluster.avgSpendingScore).toFixed(1)}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-semibold">Mean Age</div>
                        <div className="font-bold text-white font-mono mt-0.5">
                          {Number(cluster.avgAge).toFixed(1)} yrs
                        </div>
                      </div>
                    </div>

                    {/* Actionable Strategy Playbook */}
                    <div className="pt-2">
                      <div className="text-xs font-bold text-[#8b5cf6] flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Recommended Marketing Playbook:</span>
                      </div>
                      <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                        {profile.targetStrategy}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Marketing Channels & Opportunity Tier */}
                  <div className="pt-3 border-t border-white/5 space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-gray-500 font-semibold text-[11px] shrink-0">Channels:</span>
                      <span className="text-gray-300 text-right text-[11px]">{profile.channel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-gray-500 font-semibold">Segment Tier:</span>
                      <span className="font-semibold text-purple-300">{profile.opportunityTier}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
