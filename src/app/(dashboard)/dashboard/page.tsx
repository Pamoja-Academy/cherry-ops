import { getDashboardMetrics, getActivityFeed, getLeadFunnel } from "@/lib/queries";
import { MetricPulse } from "@/components/dashboard/MetricPulse";
import { ActivityFeedWidget } from "@/components/dashboard/ActivityFeedWidget";
import { LeadFunnelWidget } from "@/components/dashboard/LeadFunnelWidget";

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
          icon="trending-up"
          color="#16A34A"
          bg="#DCFCE7"
          subtitle={`of ${fmt(metrics.revenueTarget)} target`}
        />
        <MetricPulse
          label="Active Jobs"
          value={String(metrics.activeJobs)}
          icon="briefcase"
          color={metrics.overdueJobs > 0 ? "#D97706" : "#1D4ED8"}
          bg={metrics.overdueJobs > 0 ? "#FEF3C7" : "#DBEAFE"}
          subtitle={metrics.overdueJobs > 0 ? `${metrics.overdueJobs} overdue` : "All on schedule"}
        />
        <MetricPulse
          label="Outstanding Invoices"
          value={fmt(metrics.outstandingTotal)}
          icon="alert"
          color={metrics.overdueCount > 0 ? "#C4122F" : "#16A34A"}
          bg={metrics.overdueCount > 0 ? "#FCE8EC" : "#DCFCE7"}
          subtitle={metrics.overdueCount > 0 ? `${metrics.overdueCount} overdue · ${fmt(metrics.overdueTotal)}` : "Nothing overdue"}
          urgent={metrics.overdueCount > 0}
          href="/invoices"
        />
        <MetricPulse
          label="Media Pacing Health"
          value={`${metrics.mediaPacingPct}%`}
          icon="radio"
          color={metrics.mediaPacingPct >= 80 ? "#16A34A" : "#D97706"}
          bg={metrics.mediaPacingPct >= 80 ? "#DCFCE7" : "#FEF3C7"}
          subtitle="Live buys on track"
          href="/media"
        />
        <MetricPulse
          label="Pending Approvals"
          value={String(metrics.pendingApprovals)}
          icon="bot"
          color={metrics.pendingApprovals > 0 ? "#C4122F" : "#16A34A"}
          bg={metrics.pendingApprovals > 0 ? "#FCE8EC" : "#DCFCE7"}
          subtitle="Autopilot queue"
          urgent={metrics.pendingApprovals > 0}
          href="/autopilot"
        />
        <MetricPulse
          label="Private-Sector Win Rate"
          value={metrics.privateWinRate !== null ? `${metrics.privateWinRate}%` : "—"}
          icon="target"
          color="#7A0B22"
          bg="#FCE8EC"
          subtitle={`${metrics.privateLeadsInPipeline} leads in pipeline`}
          href="/leads"
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
