import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Api from "@/services/Instance";
import { Loader2, FileText, Zap, Database, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";
import { useTheme } from "@/theme/ThemeContext";
import { cn } from "@/lib/utils";

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
  const { colors } = useTheme();

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
      <header className="px-6 py-10">
        <div className="max-w-5xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p style={{ color: colors.textMuted }} className="text-base mt-2">
              System performance and knowledge base metrics.
            </p>
          </div>

          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="secondary"
            className="gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Refresh Stats
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-surfaceAlt rounded w-1/2 mb-4" />
                <div className="h-8 bg-surfaceAlt rounded w-2/3" />
              </Card>
            ))
          ) : (
            <>
              <StatCard
                icon={<Database size={24} />}
                label="Total Chunks"
                value={stats?.total_chunks || 0}
                trend="+12%"
                colors={colors}
              />
              <StatCard
                icon={<FileText size={24} />}
                label="Total Documents"
                value={stats?.total_documents || 0}
                trend="+5%"
                colors={colors}
              />
              <StatCard
                icon={<CheckCircle size={24} />}
                label="System Status"
                value={
                  stats?.system_status === "operational"
                    ? "✓ Operational"
                    : "⚠ Error"
                }
                colors={colors}
              />
            </>
          )}
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">System Status</h2>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-textMuted mb-1">API Endpoint</p>
                <p className="font-mono text-sm font-semibold">
                  /api/v1/rag/ask
                </p>
              </div>
              <div>
                <p className="text-sm text-textMuted mb-1">Last Updated</p>
                <p className="text-sm font-medium">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">⚙️</span>
              <h2 className="text-xl font-bold">Refresh Settings</h2>
            </div>
            <p className="text-sm text-textMuted mb-4">
              Choose how often you want the statistics to update.
            </p>
            <div className="flex gap-2">
              {[10000, 30000, 60000].map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => setRefreshInterval(interval)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95",
                    refreshInterval === interval
                      ? "bg-primary text-white border-primary"
                      : "bg-surfaceAlt text-textSecondary border-transparent hover:border-border",
                  )}
                >
                  {interval / 1000}s
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Features Card */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <span className="text-2xl text-primary font-bold">#</span>
            <h2 className="text-2xl font-bold">Pipeline Capability</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureItem
              icon="🔍"
              title="Hybrid Search"
              description="Vector + Keyword matching with RRF."
              colors={colors}
            />
            <FeatureItem
              icon="📊"
              title="Reranking"
              description="Cross-encoder quality improvement."
              colors={colors}
            />
            <FeatureItem
              icon="✨"
              title="Query Enhancement"
              description="Automatic query rewriting."
              colors={colors}
            />
            <FeatureItem
              icon="⚡"
              title="Performance"
              description="Built-in timing for all stages."
              colors={colors}
            />
            <FeatureItem
              icon="☁️"
              title="Cloud Generation"
              description="Gemini API + Ollama fallback."
              colors={colors}
            />
            <FeatureItem
              icon="📌"
              title="Attribution"
              description="Citations with relevance scores."
              colors={colors}
            />
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DashboardV2;
