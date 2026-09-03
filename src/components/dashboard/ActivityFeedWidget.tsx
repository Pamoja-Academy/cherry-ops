"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ActivityEvent {
  id: number;
  type: string;
  description: string;
  created_at: string;
  actor?: { name: string; avatar_initials: string } | null;
}

interface Props {
  events: ActivityEvent[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_COLORS: Record<string, string> = {
  sla_flag: "#C4122F",
  overdue_flag: "#C4122F",
  pacing_alert: "#D97706",
  lead_nudge: "#7A0B22",
  invoice_paid: "#16A34A",
  invoice_sent: "#1D4ED8",
  stage_change: "#1D4ED8",
  job_created: "#16A34A",
  client_created: "#16A34A",
  lead_created: "#7A0B22",
  lead_updated: "#7A0B22",
  nudge: "#D97706",
};

export function ActivityFeedWidget({ events }: Props) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
      <h3 className="font-display font-bold text-base mb-4" style={{ color: "#1A1214" }}>
        Live Activity Feed
      </h3>
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 360 }}>
        <AnimatePresence>
          {events.map((event, i) => {
            const color = TYPE_COLORS[event.type] ?? "#8C8078";
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed" style={{ color: "#1A1214" }}>
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {event.actor && (
                      <span className="text-xs font-medium" style={{ color: "#8C8078" }}>
                        {event.actor.name}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "#8C8078" }}>
                      {event.actor ? "·" : ""} {timeAgo(event.created_at)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
