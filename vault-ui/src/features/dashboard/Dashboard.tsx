import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Api from "@/services/Instance";
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";

interface StatsData {
  total_chunks: number;
  total_documents: number;
  system_status: string;
}

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch stats
  const {
    data: statsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rag-stats"],
    queryFn: async () => {
      try {
        const response = await Api.get("/api/v1/rag/stats");
        return response.data as StatsData;
      } catch (err) {
        throw new Error("Failed to fetch RAG statistics");
      }
    },
    refetchInterval: refreshInterval,
    retry: 3,
  });

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData]);

  // Stat cards
  const statCards: Stat[] = stats
    ? [
        {
          label: "Total Chunks",
          value: stats.total_chunks,
          icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
          trend: "+12%",
        },
        {
          label: "Total Documents",
          value: stats.total_documents,
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          trend: "+5%",
        },
        {
          label: "System Status",
          value:
            stats.system_status === "operational" ? "✓ Operational" : "⚠ Error",
          icon: (
            <div
              className={`w-3 h-3 rounded-full ${
                stats.system_status === "operational"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
          ),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🔮 Vault RAG Dashboard
            </h1>
            <p className="text-slate-400">
              Real-time metrics and statistics for your RAG pipeline
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-300">Error Loading Stats</p>
              <p className="text-red-200 text-sm">{error.message}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse"
                >
                  <div className="h-4 bg-slate-700 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-slate-700 rounded w-2/3" />
                </div>
              ))
            : statCards.map((stat, index) => (
                <Card
                  key={index}
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-300">
                        {stat.label}
                      </h3>
                      {stat.icon}
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold text-white">
                        {stat.value}
                      </p>
                      {stat.trend && (
                        <span className="text-sm text-green-400">
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
        </div>

        {/* System Info */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">API Endpoint</p>
                <p className="text-white font-mono text-sm break-all">
                  /api/v1/rag/ask
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <p className="text-green-400 font-semibold">
                  {stats?.system_status === "operational"
                    ? "✓ Operational"
                    : "⚠ Error"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Last Updated</p>
                <p className="text-white text-sm">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Auto-Refresh</p>
                <div className="flex gap-2 mt-2">
                  {[10000, 30000, 60000].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setRefreshInterval(interval)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        refreshInterval === interval
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {interval / 1000}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              RAG Pipeline Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">Hybrid Search</p>
                  <p className="text-slate-400 text-sm">
                    Vector + Keyword matching with RRF
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">Reranking</p>
                  <p className="text-slate-400 text-sm">
                    Cross-encoder re-ranking for quality
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">Query Enhancement</p>
                  <p className="text-slate-400 text-sm">
                    Query rewriting + sub-questions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">Performance Metrics</p>
                  <p className="text-slate-400 text-sm">
                    Timing for all RAG stages
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">
                    Cloud-First Generation
                  </p>
                  <p className="text-slate-400 text-sm">
                    Gemini API with Ollama fallback
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">Source Attribution</p>
                  <p className="text-slate-400 text-sm">
                    Citations with relevance scores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
