import { getAutopilotActions } from "@/lib/queries";
import { ApprovalCard } from "@/components/autopilot/ApprovalCard";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_ICONS: Record<string, string> = {
  sla_flag: "⏰",
  pacing_alert: "📊",
  lead_nudge: "🎯",
  overdue_flag: "⚠️",
  send_invoice_reminder: "📧",
  mark_job_complete: "✅",
  mark_activation_complete: "✅",
};

export default async function AutopilotPage() {
  const { pending, history } = await getAutopilotActions();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>Autopilot</h2>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          Guardrailed AI actions — risky actions require your approval
        </p>
      </div>

      {/* Needs Approval */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-display font-bold" style={{ color: "#f5f5f5" }}>Needs Approval</h3>
          {pending.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FCE8EC", color: "#C4122F" }}>
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="rounded-xl border p-8 text-center" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="text-2xl mb-2">✅</div>
            <div className="font-semibold text-sm" style={{ color: "#f5f5f5" }}>All caught up</div>
            <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>No pending approvals</div>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((action) => (
              <ApprovalCard key={action.id} action={action} />
            ))}
          </div>
        )}
      </div>

      {/* Activity log */}
      <div>
        <h3 className="font-display font-bold mb-3" style={{ color: "#f5f5f5" }}>Activity Log</h3>
        <div className="rounded-xl border overflow-hidden" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
          {history.map((a, i) => (
            <div
              key={a.id}
              className="flex items-start gap-3 px-5 py-4"
              style={{ borderBottom: i < history.length - 1 ? "1px solid #F3EBE7" : "none" }}
            >
              <div className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[a.type] ?? "🤖"}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: "#f5f5f5" }}>{a.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{a.description}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: "#DCFCE7", color: "#16A34A" }}>
                  {a.status.replace("_", " ")}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{timeAgo(a.proposed_at)}</span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>No history yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
