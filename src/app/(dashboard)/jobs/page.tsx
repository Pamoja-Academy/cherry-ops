import { getJobs } from "@/lib/queries";
import Link from "next/link";
import { Calendar } from "lucide-react";

const STAGES = ["brief", "production", "review", "delivery", "complete"] as const;
type Stage = typeof STAGES[number];

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

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

function isOverdue(due_date: string | null) {
  if (!due_date) return false;
  return new Date(due_date) < new Date();
}

export default async function JobsPage() {
  const jobs = await getJobs();

  const byStage = STAGES.reduce(
    (acc, s) => ({ ...acc, [s]: jobs.filter((j) => j.stage === s) }),
    {} as Record<Stage, typeof jobs>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#1A1214" }}>Jobs & Campaigns</h2>
        <p className="text-sm mt-0.5" style={{ color: "#8C8078" }}>{jobs.length} total jobs</p>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const color = STAGE_COLORS[stage];
          const stageJobs = byStage[stage];
          return (
            <div key={stage} className="flex-shrink-0 w-64">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${color}15`, color }}>
                  {stageJobs.length}
                </span>
              </div>
              <div className="space-y-2 kanban-col">
                {stageJobs.map((job) => {
                  const overdue = job.stage !== "complete" && isOverdue(job.due_date);
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div
                        className="p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer"
                        style={{
                          background: "#fff",
                          borderColor: overdue ? "#C4122F" : "#E4D8D1",
                          borderWidth: overdue ? 1.5 : 1,
                        }}
                      >
                        <div className="text-sm font-semibold mb-1 leading-tight" style={{ color: "#1A1214" }}>
                          {job.title}
                        </div>
                        <div className="text-xs mb-3" style={{ color: "#8C8078" }}>
                          {job.client?.name ?? "—"}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs" style={{ color: overdue ? "#C4122F" : "#8C8078" }}>
                            <Calendar className="w-3 h-3" />
                            {job.due_date ?? "No date"}
                          </div>
                          {job.value != null && (
                            <span className="text-xs font-bold" style={{ color: "#1A1214" }}>
                              {fmt(job.value)}
                            </span>
                          )}
                        </div>
                        {job.owner && (
                          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "#8C8078" }}>
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: "#C4122F", fontSize: 9 }}
                            >
                              {job.owner.avatar_initials}
                            </div>
                            {job.owner.name}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {stageJobs.length === 0 && (
                  <div className="h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "#E4D8D1", color: "#8C8078" }}>
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
