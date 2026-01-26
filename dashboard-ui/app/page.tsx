"use client";

import React from "react"

import { Sidebar } from "@/components/layout/sidebar";
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

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ label, value, icon, trend, trendUp = true }: StatCardProps) {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trendUp
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function FeatureItem({ title, description, icon }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/50 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const stats: StatCardProps[] = [
    {
      label: "Total Chunks",
      value: "12,847",
      icon: <FileText className="w-5 h-5" />,
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Total Documents",
      value: "384",
      icon: <TrendingUp className="w-5 h-5" />,
      trend: "+5%",
      trendUp: true,
    },
    {
      label: "System Status",
      value: "Operational",
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

  const features: FeatureItemProps[] = [
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
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
                  <span className="text-sm text-muted-foreground">API Endpoint</span>
                  <code className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                    /api/v1/rag/ask
                  </code>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="flex items-center gap-2 text-sm text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    Just now
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">Auto-Refresh</span>
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
      </main>
    </div>
  );
}
