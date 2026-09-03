import Link from "next/link";
import { getOpportunities, getOpportunityStats } from "@/lib/queries";
import { scoreBand } from "@/lib/opportunity/scorer";
import { OpportunityRowActions } from "@/components/opportunity/OpportunityRowActions";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const BAND_COLORS = {
  pursue: "#16A34A",
  review: "#D97706",
  discard: "#8C8078",
};

function scoreColor(score: number) {
  return BAND_COLORS[scoreBand(score)];
}

export default async function OpportunitiesPage(props: PageProps<"/opportunities">) {
  const sp = await props.searchParams;
  const showAll = sp?.show === "all";
  const [opportunities, stats] = await Promise.all([
    getOpportunities(showAll),
    getOpportunityStats(showAll),
  ]);

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #7A0B22 0%, #C4122F 100%)" }}
      >
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Opportunity Ops</h2>
            <p className="text-white/70 text-sm mt-1">Media tenders & briefs — score, triage, pitch</p>
          </div>
          <Link
            href={showAll ? "/opportunities" : "/opportunities?show=all"}
            className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/30 text-white/80 hover:text-white"
          >
            {showAll ? "Hide discard" : "Show all"}
          </Link>
        </div>
        <div className="flex flex-wrap gap-6 mt-4">
          {[
            { label: "Pipeline", value: stats.pipeline },
            { label: "New", value: stats.new },
            { label: "Pitch ≥70", value: stats.pitch },
            { label: "Review 40–69", value: stats.review },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/60 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {opportunities.length === 0 && (
          <div
            className="rounded-xl border p-8 text-center text-sm"
            style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
          >
            No opportunities in inbox. Run ingest from Settings or POST /api/opportunities/ingest.
          </div>
        )}
        {opportunities.map((opp) => {
          const score = opp.fit_score ?? 0;
          const band = scoreBand(score);
          const closing = opp.closing_at ? new Date(opp.closing_at).toLocaleDateString("en-ZA") : "—";
          return (
            <div
              key={opp.id}
              className="rounded-xl border p-5"
              style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${scoreColor(score)}20`, color: scoreColor(score) }}
                    >
                      {score} · {band}
                    </span>
                    {opp.triage_status !== "pending" && (
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.5)" }}>
                        {opp.triage_status}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {opp.reference}
                    </span>
                  </div>
                  <Link href={`/opportunities/${opp.id}`} className="font-semibold text-white hover:underline">
                    {opp.title}
                  </Link>
                  <div className="text-xs mt-1 flex flex-wrap gap-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span>{opp.issuer}</span>
                    <span>·</span>
                    <span>{opp.province}</span>
                    <span>·</span>
                    <span>Closes {closing}</span>
                    {opp.estimated_value != null && (
                      <>
                        <span>·</span>
                        <span>{fmt(opp.estimated_value)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {opp.triage_status === "pending" && <OpportunityRowActions opportunityId={opp.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
