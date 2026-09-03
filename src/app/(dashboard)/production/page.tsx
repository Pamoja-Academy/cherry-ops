import { getProductionTasks } from "@/lib/queries";

const STATUSES = ["todo", "in_progress", "done"] as const;
type Status = typeof STATUSES[number];

const STATUS_LABELS: Record<Status, string> = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const STATUS_COLORS: Record<Status, string> = { todo: "#8C8078", in_progress: "#D97706", done: "#16A34A" };

function isOverdue(due_date: string | null, status: string) {
  if (!due_date || status === "done") return false;
  return new Date(due_date) < new Date();
}

export default async function ProductionPage() {
  const tasks = await getProductionTasks();
  const byStatus = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: tasks.filter((t) => t.status === s) }),
    {} as Record<Status, typeof tasks>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>Production Board</h2>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{tasks.length} tasks across all jobs</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => {
          const color = STATUS_COLORS[status];
          const statusTasks = byStatus[status];
          return (
            <div key={status} className="flex-shrink-0 w-72">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${color}15`, color }}>
                  {statusTasks.length}
                </span>
              </div>

              <div className="space-y-2 kanban-col">
                {statusTasks.map((task) => {
                  const overdue = isOverdue(task.due_date, task.status);
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl border transition-all"
                      style={{
                        background: "#111",
                        borderColor: overdue ? "#C4122F" : "#E4D8D1",
                        borderWidth: overdue ? 1.5 : 1,
                      }}
                    >
                      <div className="text-sm font-semibold mb-1" style={{ color: overdue ? "#C4122F" : "#F5F5F5" }}>
                        {task.title}
                      </div>
                      <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {task.job?.title ?? "—"}
                      </div>
                      <div className="flex items-center justify-between">
                        {task.assignee && (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: "#C4122F", fontSize: 9 }}
                            >
                              {task.assignee.avatar_initials}
                            </div>
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{task.assignee.name}</span>
                          </div>
                        )}
                        {task.due_date && (
                          <span className="text-xs" style={{ color: overdue ? "#C4122F" : "#8C8078" }}>
                            {overdue ? "⚠ " : ""}{task.due_date}
                          </span>
                        )}
                      </div>
                      {task.resource && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FCE8EC", color: "#7A0B22" }}>
                            {task.resource.name}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {statusTasks.length === 0 && (
                  <div className="h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
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
