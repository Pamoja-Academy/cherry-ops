import { getScheduleItemById } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  planned: "#8C8078",
  in_progress: "#D97706",
  done: "#16A34A",
  cancelled: "#6B7280",
};

const KIND_COLORS: Record<string, string> = {
  shoot: "#1D4ED8",
  pitch_prep: "#7C3AED",
  deadline: "#C4122F",
  crew: "#D97706",
  studio_block: "#0891B2",
  other: "#8C8078",
};

const TASK_COLORS: Record<string, string> = {
  todo: "#8C8078",
  in_progress: "#D97706",
  done: "#16A34A",
};

export default async function ScheduleItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getScheduleItemById(parseInt(id, 10));
  if (!item) notFound();

  const statusColor = STATUS_COLORS[item.status] ?? "#8C8078";
  const kindColor = KIND_COLORS[item.kind] ?? "#8C8078";

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/events?tab=scheduling" className="text-sm flex items-center gap-1" style={{ color: "rgba(255,255,255,0.45)" }}>
        <ArrowLeft className="w-4 h-4" /> Scheduling
      </Link>

      <div className="rounded-xl border p-6" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold uppercase"
            style={{ background: `${kindColor}20`, color: kindColor }}
          >
            {item.kind.replace("_", " ")}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold uppercase"
            style={{ background: `${statusColor}15`, color: statusColor }}
          >
            {item.status.replace("_", " ")}
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>{item.title}</h2>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          {(item.start_at || item.end_at) && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {item.start_at ?? "—"}
              {item.end_at ? ` → ${item.end_at}` : ""}
            </span>
          )}
          {item.owner && <span>· {item.owner.name}</span>}
        </div>
        {item.notes && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
            {item.notes}
          </p>
        )}
      </div>

      {item.related_activation && (
        <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            Related activation
          </h3>
          <Link
            href={`/events/activations/${item.related_activation.id}`}
            className="text-sm font-semibold hover:underline"
            style={{ color: "#f5f5f5" }}
          >
            {item.related_activation.title}
          </Link>
        </div>
      )}

      <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
        <h3 className="font-display font-bold mb-4" style={{ color: "#f5f5f5" }}>Tasks ({item.tasks.length})</h3>
        {item.tasks.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>No tasks linked.</p>
        )}
        <div className="space-y-2">
          {item.tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <div>
                <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{t.title}</div>
                {t.assignee && (
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{t.assignee.name}</div>
                )}
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                style={{ background: `${TASK_COLORS[t.status]}15`, color: TASK_COLORS[t.status] }}
              >
                {t.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
