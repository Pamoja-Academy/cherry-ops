import { getOpportunityById } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Calendar, Building2 } from "lucide-react";
import { TriageActions } from "@/components/opportunity/TriageActions";
import { scoreBand } from "@/lib/opportunity/scorer";
import { parseScoreBreakdown } from "@/lib/opportunity/pack-pdf";
import { COMPANY_IDENTITY } from "@/lib/opportunity/profile";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const BAND_COLORS = { pursue: "#16A34A", review: "#D97706", discard: "#8C8078" };

export default async function OpportunityDetailPage(props: PageProps<"/opportunities/[id]">) {
  const params = await props.params;
  const opp = await getOpportunityById(parseInt(params.id, 10));
  if (!opp) notFound();

  const score = opp.fit_score ?? 0;
  const band = scoreBand(score);
  const breakdown = parseScoreBreakdown(opp.score_breakdown);

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/opportunities" className="text-sm flex items-center gap-1" style={{ color: "rgba(255,255,255,0.45)" }}>
        <ArrowLeft className="w-4 h-4" /> Opportunities
      </Link>

      <div className="rounded-xl border p-6" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${BAND_COLORS[band]}20`, color: BAND_COLORS[band] }}
              >
                {score}/100 · {band}
              </span>
              <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.5)" }}>
                {opp.triage_status}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">{opp.title}</h2>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{opp.reference}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{opp.issuer}</span>
              <span>{opp.province}</span>
              {opp.closing_at && (
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Closes {new Date(opp.closing_at).toLocaleString("en-ZA")}</span>
              )}
            </div>
          </div>
          {opp.estimated_value != null && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{fmt(opp.estimated_value)}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Estimated value</div>
            </div>
          )}
        </div>
        {opp.description && (
          <p className="mt-4 text-sm leading-relaxed border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
            {opp.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
          <h3 className="font-display font-bold mb-4 text-white">Score breakdown</h3>
          <dl className="space-y-2 text-sm">
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="capitalize" style={{ color: "rgba(255,255,255,0.45)" }}>{k.replace(/([A-Z])/g, " $1")}</dt>
                <dd className="font-medium text-white text-right">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border p-5 space-y-4" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
          <h3 className="font-display font-bold text-white">Triage</h3>
          <TriageActions opportunityId={opp.id} currentStatus={opp.triage_status} />
          {opp.reminders.length > 0 && (
            <div className="border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Reminders</h4>
              <ul className="space-y-1 text-xs">
                {opp.reminders.map((r) => (
                  <li key={r.id} className="flex justify-between" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <span>{r.offset_hours}h before close</span>
                    <span className="capitalize">{r.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-white">Credentials pack</h3>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              {COMPANY_IDENTITY.legalName} · {COMPANY_IDENTITY.beeLevel}
            </p>
          </div>
          <a
            href={`/api/opportunities/${opp.id}/pack`}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "#C4122F" }}
          >
            <Download className="w-4 h-4" /> Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
