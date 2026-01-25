import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Api from "@/services/Instance";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  Moon,
  Sun,
  FileText,
  Zap,
  Database,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";
import { useTheme } from "@/theme/ThemeContext";

interface StatsData {
  total_chunks: number;
  total_documents: number;
  system_status: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  colors: any;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  colors,
}) => (
  <Card
    style={{
      backgroundColor: colors.surface,
      borderColor: colors.border,
    }}
    className="border p-6 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-start justify-between mb-4">
      <div
        style={{
          backgroundColor: colors.primaryLight,
          color: "#ffffff",
        }}
        className="p-3 rounded-lg"
      >
        {icon}
      </div>
      {trend && (
        <span
          style={{ color: colors.primary }}
          className="text-sm font-semibold"
        >
          {trend}
        </span>
      )}
    </div>
    <p style={{ color: colors.textMuted }} className="text-sm mb-2">
      {label}
    </p>
    <p className="text-3xl font-bold">{value}</p>
  </Card>
);

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colors: any;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
  colors,
}) => (
  <div className="flex items-start gap-4">
    <div style={{ color: colors.primary }} className="text-2xl flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p style={{ color: colors.textMuted }} className="text-sm">
        {description}
      </p>
    </div>
  </div>
);

export const DashboardV2: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const { mode, colors, toggleTheme } = useTheme();

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

  return (
    <div
      style={{ backgroundColor: colors.background, color: colors.text }}
      className="min-h-screen transition-colors duration-300"
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="border-b sticky top-0 z-10 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span style={{ color: colors.primary }} className="text-4xl">
                📊
              </span>
              Vault RAG Dashboard
            </h1>
            <p style={{ color: colors.textMuted }} className="text-sm mt-1">
              Real-time metrics and system status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              style={{
                backgroundColor: colors.primary,
                color: "#ffffff",
              }}
              className="gap-2 hover:opacity-90"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Refresh
            </Button>

            <button
              onClick={toggleTheme}
              style={{
                backgroundColor: colors.primaryLight,
                color: "#ffffff",
              }}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              title="Toggle theme"
            >
              {mode === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div
            style={{
              backgroundColor: colors.accent1,
              borderColor: colors.accent1,
            }}
            className="mb-6 p-4 bg-opacity-10 border rounded-lg flex items-center gap-3"
          >
            <AlertCircle
              style={{ color: colors.accent1 }}
              className="w-5 h-5 flex-shrink-0"
            />
            <div>
              <p className="font-semibold">Error Loading Stats</p>
              <p style={{ color: colors.textSecondary }} className="text-sm">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                  className="border p-6 animate-pulse"
                >
                  <div
                    style={{ backgroundColor: colors.surfaceAlt }}
                    className="h-4 rounded w-1/2 mb-4"
                  />
                  <div
                    style={{ backgroundColor: colors.surfaceAlt }}
                    className="h-8 rounded w-2/3"
                  />
                </Card>
              ))
            : stats && (
                <>
                  <StatCard
                    icon={<Database className="w-5 h-5" />}
                    label="Total Chunks"
                    value={stats.total_chunks}
                    trend="+12%"
                    colors={colors}
                  />
                  <StatCard
                    icon={<FileText className="w-5 h-5" />}
                    label="Total Documents"
                    value={stats.total_documents}
                    trend="+5%"
                    colors={colors}
                  />
                  <StatCard
                    icon={<CheckCircle className="w-5 h-5" />}
                    label="System Status"
                    value={
                      stats.system_status === "operational"
                        ? "✓ Operational"
                        : "⚠ Error"
                    }
                    colors={colors}
                  />
                </>
              )}
        </div>

        {/* System Information */}
        <Card
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="border p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap style={{ color: colors.primary }} className="w-6 h-6" />
            <h2 className="text-2xl font-bold">System Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p style={{ color: colors.textMuted }} className="text-sm mb-2">
                API Endpoint
              </p>
              <p className="font-mono text-sm font-semibold break-all">
                /api/v1/rag/ask
              </p>
            </div>

            <div>
              <p style={{ color: colors.textMuted }} className="text-sm mb-2">
                Status
              </p>
              {stats?.system_status === "operational" ? (
                <p style={{ color: colors.accent2 }} className="font-semibold">
                  ✓ Operational
                </p>
              ) : (
                <p style={{ color: colors.accent1 }} className="font-semibold">
                  ⚠ Error
                </p>
              )}
            </div>

            <div>
              <p style={{ color: colors.textMuted }} className="text-sm mb-2">
                Last Updated
              </p>
              <p className="font-mono text-sm">
                {new Date().toLocaleTimeString()}
              </p>
            </div>

            <div>
              <p style={{ color: colors.textMuted }} className="text-sm mb-2">
                Auto-Refresh Interval
              </p>
              <div className="flex gap-2 flex-wrap">
                {[10000, 30000, 60000].map((interval) => (
                  <button
                    key={interval}
                    onClick={() => setRefreshInterval(interval)}
                    style={{
                      backgroundColor:
                        refreshInterval === interval
                          ? colors.primary
                          : colors.surfaceAlt,
                      color:
                        refreshInterval === interval ? "#ffffff" : colors.text,
                      borderColor: colors.border,
                    }}
                    className="px-3 py-1 rounded text-xs font-medium border transition-colors hover:opacity-80"
                  >
                    {interval / 1000}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="border p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <span style={{ color: colors.primary }} className="text-2xl">
              ⚙️
            </span>
            <h2 className="text-2xl font-bold">RAG Pipeline Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureItem
              icon="🔍"
              title="Hybrid Search"
              description="Vector + Keyword matching with RRF for best results"
              colors={colors}
            />
            <FeatureItem
              icon="📊"
              title="Reranking"
              description="Cross-encoder re-ranking for quality improvement"
              colors={colors}
            />
            <FeatureItem
              icon="✨"
              title="Query Enhancement"
              description="Automatic query rewriting + sub-questions"
              colors={colors}
            />
            <FeatureItem
              icon="⚡"
              title="Performance Metrics"
              description="Built-in timing for all RAG stages"
              colors={colors}
            />
            <FeatureItem
              icon="☁️"
              title="Cloud-First Generation"
              description="Gemini API (primary) + Ollama (fallback)"
              colors={colors}
            />
            <FeatureItem
              icon="📌"
              title="Source Attribution"
              description="Citations with relevance scores for transparency"
              colors={colors}
            />
          </div>
        </Card>

        {/* Illustration Section */}
        <div className="mt-12 text-center">
          <div
            style={{
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
            }}
            className="border rounded-2xl p-12"
          >
            <div
              className="flex items-center justify-center w-32 h-32 mx-auto mb-6 rounded-full"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <span className="text-6xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Powered by AI</h3>
            <p style={{ color: colors.textMuted }} className="max-w-md mx-auto">
              Your RAG system is running smoothly and ready to answer any
              question about your documents. Start chatting!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardV2;
