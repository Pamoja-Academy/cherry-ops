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
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-10">
      {/* Editorial header — Joe Public energy */}
      <header className="relative overflow-hidden border border-white/10 bg-[#0c0c0c] px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 10% 20%, rgba(196,18,47,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(122,11,34,0.25), transparent 50%)",
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#C4122F]">
            Red Cherry Interactive
          </p>
          <h2
            className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[0.95] text-white sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Command
            <br />
            Centre
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
            Agency pulse for Pheladi &amp; Danny — production, media, cash, and private-sector growth in one frame.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
        <MetricPulse
          label="Paid Revenue"
          value={fmt(metrics.revenue)}
          iconName="TrendingUp"
          color="#F87171"
          subtitle="Settled invoices"
        />
        <MetricPulse
          label="Active Jobs"
          value={String(metrics.activeJobs)}
          iconName="Briefcase"
          color="#FCA5A5"
          subtitle="In flight"
        />
        <MetricPulse
          label="Overdue Invoices"
          value={
            metrics.overdueCount > 0
              ? `${metrics.overdueCount} · ${fmt(metrics.overdueTotal)}`
              : "None"
          }
          iconName="AlertTriangle"
          color={metrics.overdueCount > 0 ? "#C4122F" : "#86EFAC"}
          subtitle={metrics.overdueCount > 0 ? "Action required" : "All clear"}
          urgent={metrics.overdueCount > 0}
        />
        <MetricPulse
          label="Media Pacing"
          value={`${metrics.mediaPacingPct}%`}
          iconName="Radio"
          color={metrics.mediaPacingPct >= 80 ? "#86EFAC" : "#FBBF24"}
          subtitle="Live buys on track"
        />
        <MetricPulse
          label="Pending Approvals"
          value={String(metrics.pendingApprovals)}
          iconName="Bot"
          color={metrics.pendingApprovals > 0 ? "#C4122F" : "#86EFAC"}
          subtitle="Autopilot queue"
          urgent={metrics.pendingApprovals > 0}
        />
        <MetricPulse
          label="Private-Sector Leads"
          value={String(metrics.privateLeadsInPipeline)}
          iconName="Target"
          color="#C4122F"
          subtitle="Growth pipeline"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ActivityFeedWidget events={feed} />
        <LeadFunnelWidget data={funnel} />
      </div>
    </div>
  );
}
