import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FeatureItem } from "@/components/dashboard/FeatureItem";
import {
  TrendingUp,
  FileText,
  Activity,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Search,
  Sparkles,
  GitBranch,
  Clock,
} from "lucide-react";
import Api from "@/services/Instance";
import { toast } from "sonner";

interface RAGStats {
  total_chunks: number;
  total_documents: number;
  system_status: string;
}

export default function DashboardV3() {
  const [stats, setStats] = useState<RAGStats>({
    total_chunks: 0,
    total_documents: 0,
    system_status: "loading",
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await Api.get<RAGStats>("/api/v1/rag/stats");
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching RAG stats:", error);
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Chunks",
      value: loading ? "..." : stats.total_chunks.toLocaleString(),
      icon: <FileText className="w-5 h-5" />,
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Total Documents",
      value: loading ? "..." : stats.total_documents.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5" />,
      trend: "+5%",
      trendUp: true,
    },
    {
      label: "System Status",
      value: loading
        ? "..."
        : stats.system_status === "operational"
        ? "Operational"
        : "Error",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      label: "Avg Response Time",
      value: "1.2s",
      icon: <Zap className="w-5 h-5" />,
      trend: "-8%",
      trendUp: true,
    },
  ];

  const features = [
    {
      title: "Hybrid Search",
      description: "Vector + Keyword matching with RRF fusion",
      icon: <Search className="w-4 h-4" />,
    },
    {
      title: "Intelligent Reranking",
      description: "Cross-encoder re-ranking for result quality",
      icon: <ArrowUpRight className="w-4 h-4" />,
    },
    {
      title: "Query Enhancement",
      description: "Automatic query rewriting and decomposition",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      title: "Source Attribution",
      description: "Citations with relevance confidence scores",
      icon: <GitBranch className="w-4 h-4" />,
    },
  ];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time metrics for your RAG pipeline
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* API Info Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">
            System Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">
                API Endpoint
              </span>
              <code className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                /api/v1/rag/ask
              </code>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Status</span>
              <span
                className={`flex items-center gap-2 text-sm ${
                  stats.system_status === "operational"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    stats.system_status === "operational"
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  } animate-pulse`}
                />
                {stats.system_status === "operational"
                  ? "Operational"
                  : "Error"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Last Updated
              </span>
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {formatTime(lastUpdated)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">
                Auto-Refresh
              </span>
              <div className="flex gap-1.5">
                {[10, 30, 60].map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      interval === 30
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {interval}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Pipeline Features
          </h2>
          <div className="space-y-1">
            {features.map((feature) => (
              <FeatureItem key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent hover:border-primary/30 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Start AI Chat
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent hover:border-primary/30 transition-colors"
          >
            <FileText className="w-4 h-4 text-primary" />
            Upload Document
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent hover:border-primary/30 transition-colors"
          >
            <Search className="w-4 h-4 text-primary" />
            Browse Knowledge
          </button>
        </div>
      </div>
    </div>
  );
}
