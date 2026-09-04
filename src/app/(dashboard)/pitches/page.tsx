import Link from "next/link";
import { getPitches } from "@/lib/queries";
import { scoreBand } from "@/lib/opportunity/scorer";
import { ensureOpportunitySeed } from "@/lib/opportunity/ensure-seed";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const REMINDER_COLORS: Record<string, string> = {
  pending: "#D97706",
  sent: "#16A34A",
  cancelled: "#8C8078",
};

export default async function PitchesPage() {
  await ensureOpportunitySeed();
  const pitches = await getPitches();

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-6"
        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #111 100%)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <h2 className="font-display text-2xl font-bold text-white">Active Pitches</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          Approved briefs with 72 / 48 / 24h deadline reminders
        </p>
        <div className="mt-4 text-3xl font-bold text-[#C4122F]">{pitches.length}</div>
      </div>

      {pitches.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center text-sm"
          style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
        >
          No pitched briefs yet. Approve opportunities from the{" "}
          <Link href="/opportunities" className="text-[#C4122F] hover:underline">inbox</Link>.
        </div>
      ) : (
        <div className="grid gap-3">
          {pitches.map((p) => {
            const band = scoreBand(p.fit_score ?? 0);
            return (
              <div
                key={p.id}
                className="rounded-xl border p-5"
                style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/opportunities/${p.id}`} className="font-semibold text-white hover:underline">
                      {p.title}
                    </Link>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {p.issuer} · {p.reference} · {band} ({p.fit_score})
                      {p.estimated_value != null && ` · ${fmt(p.estimated_value)}`}
                    </div>
                    {p.closing_at && (
                      <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Closes {new Date(p.closing_at).toLocaleString("en-ZA")}
                      </div>
                    )}
                  </div>
                </div>
                {p.reminders.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.reminders
                      .filter((r) => r.kind === "deadline")
                      .sort((a, b) => b.offset_hours - a.offset_hours)
                      .map((r) => (
                        <span
                          key={r.id}
                          className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded"
                          style={{
                            background: `${REMINDER_COLORS[r.status] ?? "#8C8078"}18`,
                            color: REMINDER_COLORS[r.status] ?? "#8C8078",
                          }}
                        >
                          {r.offset_hours}h · {r.status}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
