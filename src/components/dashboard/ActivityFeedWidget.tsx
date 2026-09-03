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
  pacing_alert: "#FBBF24",
  lead_nudge: "#F87171",
  invoice_paid: "#4ADE80",
  invoice_sent: "#FCA5A5",
  stage_change: "#FCA5A5",
  job_created: "#4ADE80",
  client_created: "#4ADE80",
  lead_created: "#F87171",
  lead_updated: "#F87171",
  nudge: "#FBBF24",
};

export function ActivityFeedWidget({ events }: Props) {
  return (
    <div className="border border-white/10 bg-[#111] p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C4122F]">
        Live
      </p>
      <h3 className="mt-1 font-display text-xl font-bold text-white">Activity Feed</h3>
      <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto">
        <AnimatePresence>
          {events.map((event, i) => {
            const color = TYPE_COLORS[event.type] ?? "#777";
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex gap-3 border-b border-white/5 pb-3 last:border-0"
              >
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-white/85">{event.description}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-white/35">
                    {event.actor && <span>{event.actor.name}</span>}
                    <span>
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
