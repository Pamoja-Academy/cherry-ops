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
  cold: "#E4D8D1",
  warm: "#FCD34D",
  proposal: "#C4122F",
  won: "#16A34A",
  lost: "#8C8078",
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
    <div className="rounded-xl border p-5" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
      <h3 className="font-display font-bold text-base mb-1" style={{ color: "#1A1214" }}>
        Private-Sector Win Funnel
      </h3>
      <p className="text-xs mb-4" style={{ color: "#8C8078" }}>
        Leads by pipeline stage
      </p>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.stage} className="flex items-center gap-3">
            <div className="w-16 text-xs font-semibold text-right flex-shrink-0" style={{ color: "#8C8078" }}>
              {STAGE_LABELS[item.stage]}
            </div>
            <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: "#F3EBE7" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / maxCount) * 100}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-lg flex items-center px-2"
                style={{ background: STAGE_COLORS[item.stage] ?? "#8C8078", minWidth: item.count > 0 ? 28 : 0 }}
              >
                {item.count > 0 && (
                  <span className="text-xs font-bold" style={{ color: item.stage === "cold" ? "#8C8078" : "#fff" }}>
                    {item.count}
                  </span>
                )}
              </motion.div>
            </div>
            {item.count === 0 && (
              <span className="text-xs" style={{ color: "#8C8078" }}>0</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
