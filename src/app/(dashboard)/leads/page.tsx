import { getLeads } from "@/lib/queries";
import { AddLeadButton } from "@/components/leads/AddLeadButton";
import { LeadStageSelect } from "@/components/leads/LeadStageSelect";

const STAGES = ["cold", "warm", "proposal", "won", "lost"] as const;
type LeadStage = (typeof STAGES)[number];

const STAGE_COLORS: Record<LeadStage, string> = {
  cold: "#8C8078",
  warm: "#D97706",
  proposal: "#C4122F",
  won: "#16A34A",
  lost: "#E4D8D1",
};

const STAGE_LABELS: Record<LeadStage, string> = {
  cold: "Cold",
  warm: "Warm",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export default async function LeadsPage() {
  const leads = await getLeads();

  const byStage = STAGES.reduce(
    (acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s) }),
    {} as Record<LeadStage, typeof leads>
  );

  const inPipeline = leads.filter((l) => ["cold", "warm", "proposal"].includes(l.status)).length;
  const won = leads.filter((l) => l.status === "won").length;
  const total = leads.filter((l) => l.status !== "cold").length;
  const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7A0B22 0%, #C4122F 100%)",
        }}
      >
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Private-Sector Pipeline</h2>
            <p className="text-white/70 text-sm mt-1">Create leads and move stages — live pipeline</p>
            <div className="flex gap-6 mt-4">
              <div>
                <div className="text-3xl font-bold text-white">{inPipeline}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">In Pipeline</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{winRate}%</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Win Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{won}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Won</div>
              </div>
            </div>
          </div>
          <AddLeadButton />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const color = STAGE_COLORS[stage];
          const stageLeads = byStage[stage];
          return (
            <div key={stage} className="flex-shrink-0 w-56">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                  {STAGE_LABELS[stage]}
                </span>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full ml-auto"
                  style={{ background: `${color}20`, color }}
                >
                  {stageLeads.length}
                </span>
              </div>
              <div className="space-y-2 kanban-col">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl border"
                    style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
                  >
                    <div className="text-sm font-semibold mb-0.5" style={{ color: "#f5f5f5" }}>
                      {lead.company}
                    </div>
                    <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {lead.sector}
                    </div>
                    {lead.contact_name && (
                      <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {lead.contact_name}
                      </div>
                    )}
                    {lead.source && (
                      <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {lead.source}
                      </div>
                    )}
                    {lead.assigned_to && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "#C4122F", fontSize: 8 }}
                        >
                          {lead.assigned_to.avatar_initials}
                        </div>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {lead.assigned_to.name}
                        </span>
                      </div>
                    )}
                    <LeadStageSelect leadId={lead.id} status={lead.status as LeadStage} />
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div
                    className="h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-xs"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
                  >
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
