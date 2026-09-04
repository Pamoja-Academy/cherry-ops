import { getStudioCapacity } from "@/lib/queries";
import { Clapperboard, Mic, MonitorPlay, Monitor, type LucideIcon } from "lucide-react";

const RESOURCE_ICONS: Record<string, LucideIcon> = {
  edit: Clapperboard,
  vo: Mic,
  green_screen: MonitorPlay,
  suite: Monitor,
};

export default async function StudioPage() {
  const resources = await getStudioCapacity();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#1A1214" }}>Studio Capacity</h2>
        <p className="text-sm mt-0.5" style={{ color: "#8C8078" }}>Today&rsquo;s allocations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {resources.map((r) => {
          const pct = Math.min(100, Math.round((r.allocated / r.capacity_hours_per_day) * 100));
          const isOver = r.allocated > r.capacity_hours_per_day;
          const isFull = pct >= 90;
          const Icon = RESOURCE_ICONS[r.type] ?? Monitor;
          return (
            <div key={r.id} className="rounded-xl border p-5" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FCE8EC" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#7A0B22" }} />
                </div>
                <div>
                  <div className="font-display font-bold text-sm" style={{ color: "#1A1214" }}>{r.name}</div>
                  <div className="text-xs capitalize" style={{ color: "#8C8078" }}>{r.type.replace("_", " ")}</div>
                </div>
              </div>

              {/* Capacity bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: "#8C8078" }}>
                  <span>{r.allocated}h allocated</span>
                  <span>{r.capacity_hours_per_day}h capacity</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "#F3EBE7" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isOver ? "#C4122F" : isFull ? "#D97706" : "#16A34A",
                    }}
                  />
                </div>
                <div className="mt-1 text-xs font-semibold" style={{ color: isOver ? "#C4122F" : isFull ? "#D97706" : "#16A34A" }}>
                  {pct}% {isOver ? "— OVER CAPACITY" : isFull ? "— Near capacity" : "— Available"}
                </div>
              </div>

              {/* Jobs using */}
              {r.jobsUsing.length > 0 ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8C8078" }}>Active jobs</div>
                  <div className="space-y-1">
                    {r.jobsUsing.filter(Boolean).map((job) => (
                      <div key={job!.id} className="text-xs px-2 py-1 rounded-lg" style={{ background: "#F3EBE7", color: "#1A1214" }}>
                        {job!.title}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs" style={{ color: "#8C8078" }}>No jobs allocated today</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
