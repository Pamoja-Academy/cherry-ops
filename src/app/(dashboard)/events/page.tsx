import { getActivations, getScheduleItems } from "@/lib/queries";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { ActivationStageSelect } from "@/components/events/ActivationStageSelect";

const STAGES = ["brief", "production", "review", "delivery", "complete"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_LABELS: Record<Stage, string> = {
  brief: "Brief",
  production: "Production",
  review: "Review",
  delivery: "Delivery",
  complete: "Complete",
};

const STAGE_COLORS: Record<Stage, string> = {
  brief: "#8C8078",
  production: "#1D4ED8",
  review: "#D97706",
  delivery: "#7A0B22",
  complete: "#16A34A",
};

const SCHEDULE_STATUSES = ["planned", "in_progress", "done", "cancelled"] as const;
type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

const SCHEDULE_STATUS_COLORS: Record<ScheduleStatus, string> = {
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

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);

function isOverdue(due_date: string | null) {
  if (!due_date) return false;
  return new Date(due_date) < new Date();
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "scheduling" ? "scheduling" : "activations";

  const [activations, scheduleItems] = await Promise.all([
    getActivations(),
    getScheduleItems(),
  ]);

  const byStage = STAGES.reduce(
    (acc, s) => ({ ...acc, [s]: activations.filter((a) => a.stage === s) }),
    {} as Record<Stage, typeof activations>
  );

  const byScheduleStatus = SCHEDULE_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: scheduleItems.filter((i) => i.status === s) }),
    {} as Record<ScheduleStatus, typeof scheduleItems>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>
            Events
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            Activations &amp; internal scheduling
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: "rgba(255,255,255,0.1)", background: "#0a0a0a" }}>
          <Link
            href="/events?tab=activations"
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
            style={{
              background: tab === "activations" ? "rgba(196,18,47,0.2)" : "transparent",
              color: tab === "activations" ? "#fff" : "rgba(255,255,255,0.45)",
            }}
          >
            Activations
          </Link>
          <Link
            href="/events?tab=scheduling"
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
            style={{
              background: tab === "scheduling" ? "rgba(196,18,47,0.2)" : "transparent",
              color: tab === "scheduling" ? "#fff" : "rgba(255,255,255,0.45)",
            }}
          >
            Scheduling
          </Link>
        </div>
      </div>

      {tab === "activations" && (
        <>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {activations.length} total activations — change stage on any card
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const color = STAGE_COLORS[stage];
              const stageItems = byStage[stage];
              return (
                <div key={stage} className="flex-shrink-0 w-64">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                      {STAGE_LABELS[stage]}
                    </span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-full ml-auto"
                      style={{ background: `${color}15`, color }}
                    >
                      {stageItems.length}
                    </span>
                  </div>
                  <div className="space-y-2 kanban-col">
                    {stageItems.map((activation) => {
                      const overdue = activation.stage !== "complete" && isOverdue(activation.due_date);
                      return (
                        <div
                          key={activation.id}
                          className="p-4 rounded-xl border transition-all"
                          style={{
                            background: "#111",
                            borderColor: overdue ? "#C4122F" : "rgba(255,255,255,0.1)",
                            borderWidth: overdue ? 1.5 : 1,
                          }}
                        >
                          <Link href={`/events/activations/${activation.id}`} className="block">
                            <div
                              className="text-sm font-semibold mb-1 leading-tight hover:underline"
                              style={{ color: "#f5f5f5" }}
                            >
                              {activation.title}
                            </div>
                            <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                              {activation.client?.name ?? "—"}
                            </div>
                          </Link>
                          <div className="flex items-center justify-between">
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: overdue ? "#C4122F" : "#8C8078" }}
                            >
                              <Calendar className="w-3 h-3" />
                              {activation.due_date ?? "No date"}
                            </div>
                            {activation.value && (
                              <span className="text-xs font-bold" style={{ color: "#f5f5f5" }}>
                                {fmt(activation.value)}
                              </span>
                            )}
                          </div>
                          {activation.owner && (
                            <div
                              className="flex items-center gap-1 mt-2 text-xs"
                              style={{ color: "rgba(255,255,255,0.45)" }}
                            >
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: "#C4122F", fontSize: 9 }}
                              >
                                {activation.owner.avatar_initials}
                              </div>
                              {activation.owner.name}
                            </div>
                          )}
                          <ActivationStageSelect
                            activationId={activation.id}
                            stage={activation.stage as Stage}
                          />
                        </div>
                      );
                    })}
                    {stageItems.length === 0 && (
                      <div
                        className="h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-xs"
                        style={{
                          borderColor: "rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.45)",
                        }}
                      >
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "scheduling" && (
        <>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {scheduleItems.length} schedule items — internal event planning
          </p>
          <div className="space-y-6">
            {SCHEDULE_STATUSES.map((status) => {
              const color = SCHEDULE_STATUS_COLORS[status];
              const items = byScheduleStatus[status];
              if (items.length === 0) return null;
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                      {SCHEDULE_STATUS_LABELS[status]}
                    </span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${color}15`, color }}
                    >
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const kindColor = KIND_COLORS[item.kind] ?? "#8C8078";
                      return (
                        <Link
                          key={item.id}
                          href={`/events/scheduling/${item.id}`}
                          className="flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors hover:bg-white/[0.03]"
                          style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                style={{ background: `${kindColor}20`, color: kindColor }}
                              >
                                {item.kind.replace("_", " ")}
                              </span>
                              <span className="text-sm font-semibold truncate" style={{ color: "#f5f5f5" }}>
                                {item.title}
                              </span>
                            </div>
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                              {item.related_activation?.title
                                ? `Linked: ${item.related_activation.title}`
                                : "No linked activation"}
                              {item.owner ? ` · ${item.owner.name}` : ""}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                            <div>{item.start_at ?? "—"}</div>
                            {item.end_at && <div>→ {item.end_at}</div>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {scheduleItems.length === 0 && (
              <div
                className="rounded-xl border p-8 text-center text-sm"
                style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
              >
                No schedule items yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
