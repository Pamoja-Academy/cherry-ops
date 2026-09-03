"use client";

import { motion } from "framer-motion";

interface FunnelStage {
  stage: string;
  count: number;
}

interface Props {
  data: FunnelStage[];
}

const STAGE_COLORS: Record<string, string> = {
  cold: "#3a3a3a",
  warm: "#FBBF24",
  proposal: "#C4122F",
  won: "#4ADE80",
  lost: "#555",
};

const STAGE_LABELS: Record<string, string> = {
  cold: "Cold",
  warm: "Warm",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export function LeadFunnelWidget({ data }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="border border-white/10 bg-[#111] p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C4122F]">
        Growth
      </p>
      <h3 className="mt-1 font-display text-xl font-bold text-white">Private-Sector Funnel</h3>
      <p className="mt-1 text-xs text-white/40">Leads by pipeline stage</p>
      <div className="mt-6 space-y-3">
        {data.map((item, i) => (
          <div key={item.stage} className="flex items-center gap-3">
            <div className="w-16 flex-shrink-0 text-right text-[11px] font-semibold uppercase tracking-wider text-white/45">
              {STAGE_LABELS[item.stage]}
            </div>
            <div className="h-8 flex-1 overflow-hidden bg-black/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / maxCount) * 100}%` }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.55, ease: "easeOut" }}
                className="flex h-full items-center px-2"
                style={{
                  background: STAGE_COLORS[item.stage] ?? "#555",
                  minWidth: item.count > 0 ? 28 : 0,
                }}
              >
                {item.count > 0 && (
                  <span className="text-xs font-bold text-black">{item.count}</span>
                )}
              </motion.div>
            </div>
            {item.count === 0 && <span className="text-xs text-white/30">0</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
