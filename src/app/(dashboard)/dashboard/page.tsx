import { getDashboardMetrics, getActivityFeed, getLeadFunnel } from "@/lib/queries";
import { MetricPulse } from "@/components/dashboard/MetricPulse";
import { ActivityFeedWidget } from "@/components/dashboard/ActivityFeedWidget";
import { LeadFunnelWidget } from "@/components/dashboard/LeadFunnelWidget";
import { TrendingUp, Briefcase, AlertTriangle, Radio, Bot, Target } from "lucide-react";

export default async function DashboardPage() {
  const [metrics, feed, funnel] = await Promise.all([
    getDashboardMetrics(),
    getActivityFeed(10),
    getLeadFunnel(),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#1A1214" }}>
          CEO Command Centre
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "#8C8078" }}>
          Red Cherry Interactive — Agency Pulse
        </p>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricPulse
          label="Revenue This Month"
          value={fmt(metrics.revenue)}
          icon={TrendingUp}
          color="#16A34A"
          bg="#DCFCE7"
          subtitle="Paid invoices"
        />
        <MetricPulse
          label="Active Jobs"
          value={String(metrics.activeJobs)}
          icon={Briefcase}
          color="#1D4ED8"
          bg="#DBEAFE"
          subtitle="In production"
        />
        <MetricPulse
          label="Overdue Invoices"
          value={metrics.overdueCount > 0 ? `${metrics.overdueCount} · ${fmt(metrics.overdueTotal)}` : "None"}
          icon={AlertTriangle}
          color={metrics.overdueCount > 0 ? "#C4122F" : "#16A34A"}
          bg={metrics.overdueCount > 0 ? "#FCE8EC" : "#DCFCE7"}
          subtitle={metrics.overdueCount > 0 ? "Action required" : "All clear"}
          urgent={metrics.overdueCount > 0}
        />
        <MetricPulse
          label="Media Pacing Health"
          value={`${metrics.mediaPacingPct}%`}
          icon={Radio}
          color={metrics.mediaPacingPct >= 80 ? "#16A34A" : "#D97706"}
          bg={metrics.mediaPacingPct >= 80 ? "#DCFCE7" : "#FEF3C7"}
          subtitle="Live buys on track"
        />
        <MetricPulse
          label="Pending Approvals"
          value={String(metrics.pendingApprovals)}
          icon={Bot}
          color={metrics.pendingApprovals > 0 ? "#C4122F" : "#16A34A"}
          bg={metrics.pendingApprovals > 0 ? "#FCE8EC" : "#DCFCE7"}
          subtitle="Autopilot queue"
          urgent={metrics.pendingApprovals > 0}
        />
        <MetricPulse
          label="Private-Sector Leads"
          value={String(metrics.privateLeadsInPipeline)}
          icon={Target}
          color="#7A0B22"
          bg="#FCE8EC"
          subtitle="In pipeline"
        />
      </div>

      {/* Two-column feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ActivityFeedWidget events={feed} />
        <LeadFunnelWidget data={funnel} />
      </div>
    </div>
  );
}
