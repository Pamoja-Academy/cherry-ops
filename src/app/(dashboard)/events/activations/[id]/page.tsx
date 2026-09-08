import { getActivationById } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { ActivationStageSelect } from "@/components/events/ActivationStageSelect";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const STAGE_COLORS: Record<string, string> = {
  brief: "#8C8078", production: "#1D4ED8", review: "#D97706", delivery: "#7A0B22", complete: "#16A34A",
};
const TASK_COLORS: Record<string, string> = {
  todo: "#8C8078", in_progress: "#D97706", done: "#16A34A",
};
const DEL_COLORS: Record<string, string> = {
  draft: "#8C8078", review: "#D97706", approved: "#1D4ED8", delivered: "#16A34A",
};
const INV_COLORS: Record<string, string> = {
  paid: "#16A34A", sent: "#1D4ED8", overdue: "#C4122F", draft: "#8C8078",
};

export default async function ActivationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activation = await getActivationById(parseInt(id, 10));
  if (!activation) notFound();

  const TASK_STAGES = ["todo", "in_progress", "done"] as const;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/events?tab=activations" className="text-sm flex items-center gap-1" style={{ color: "rgba(255,255,255,0.45)" }}>
        <ArrowLeft className="w-4 h-4" /> Activations
      </Link>

      <div className="rounded-xl border p-6" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${STAGE_COLORS[activation.stage]}15`, color: STAGE_COLORS[activation.stage] }}>
                {activation.stage.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.45)" }}>
                {activation.type}
              </span>
              <ActivationStageSelect
                activationId={activation.id}
                stage={activation.stage as "brief" | "production" | "review" | "delivery" | "complete"}
                compact
              />
            </div>
            <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>{activation.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              <Link href={`/clients/${activation.client?.id}`} className="hover:underline">{activation.client?.name}</Link>
              {activation.due_date && <><span>·</span><Calendar className="w-3.5 h-3.5" /><span>Due {activation.due_date}</span></>}
              {activation.venue && <><span>·</span><span>{activation.venue}</span></>}
            </div>
          </div>
          <div className="text-right">
            {activation.value && <div className="text-2xl font-bold" style={{ color: "#f5f5f5" }}>{fmt(activation.value)}</div>}
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Activation value</div>
          </div>
        </div>
        {activation.brief && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", borderTop: "1px solid #F3EBE7", paddingTop: 16 }}>
            {activation.brief}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "#f5f5f5" }}>Tasks</h3>
          <div className="flex gap-3">
            {TASK_STAGES.map((s) => {
              const stageTasks = activation.tasks.filter((t) => t.status === s);
              return (
                <div key={s} className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase mb-2" style={{ color: TASK_COLORS[s] }}>{s.replace("_", " ")}</div>
                  <div className="space-y-1.5">
                    {stageTasks.map((t) => (
                      <div key={t.id} className="p-2 rounded-lg border text-xs" style={{ borderColor: "#F3EBE7" }}>
                        <div className="font-medium" style={{ color: "#f5f5f5" }}>{t.title}</div>
                        {t.assignee && <div style={{ color: "rgba(255,255,255,0.45)" }}>{t.assignee.avatar_initials}</div>}
                      </div>
                    ))}
                    {stageTasks.length === 0 && <div className="h-8" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "#f5f5f5" }}>Deliverables</h3>
          {activation.deliverables.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>None yet.</p>}
          <div className="space-y-2">
            {activation.deliverables.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "#F3EBE7" }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{d.title}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{d.type} · due {d.due_date}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${DEL_COLORS[d.status]}15`, color: DEL_COLORS[d.status] }}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {activation.allocs.length > 0 && (
          <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
            <h3 className="font-display font-bold mb-4" style={{ color: "#f5f5f5" }}>Studio Allocations</h3>
            <div className="space-y-2">
              {activation.allocs.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "#F3EBE7" }}>
                  <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{a.resource?.name ?? "—"}</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{a.date} · {a.hours}h</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activation.invoices.length > 0 && (
          <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
            <h3 className="font-display font-bold mb-4" style={{ color: "#f5f5f5" }}>Invoices</h3>
            <div className="space-y-2">
              {activation.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "#F3EBE7" }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{inv.number}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{inv.issued_date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{fmt(inv.amount)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${INV_COLORS[inv.status]}15`, color: INV_COLORS[inv.status] }}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
