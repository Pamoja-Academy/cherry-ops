"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";

interface AutopilotAction {
  id: number;
  type: string;
  classification: string;
  status: string;
  entity_type: string | null;
  entity_id: number | null;
  title: string;
  description: string;
  proposed_at: string;
}

interface Props {
  action: AutopilotAction;
}

export function ApprovalCard({ action }: Props) {
  const [status, setStatus] = useState<"idle" | "approving" | "rejecting" | "done">("idle");
  const [result, setResult] = useState<"approved" | "rejected" | null>(null);

  async function handleAction(newStatus: "approved" | "rejected") {
    setStatus(newStatus === "approved" ? "approving" : "rejecting");
    try {
      await fetch("/api/autopilot/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: action.id, status: newStatus }),
      });
      setResult(newStatus);
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 1, height: "auto" }}
        animate={{ opacity: 0, height: 0 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="overflow-hidden"
      >
                      <div className="rounded-xl border p-4 flex items-center gap-3" style={{ background: result === "approved" ? "rgba(22,163,74,0.2)" : "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
          {result === "approved" ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/50" />}
          <span className="text-sm font-medium text-white">
            {result === "approved" ? "Approved" : "Rejected"} — {action.title}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-5"
      style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FCE8EC", color: "#C4122F" }}>
              ⚠ Risky
            </span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{action.type.replace(/_/g, " ")}</span>
          </div>
          <div className="font-semibold text-sm mb-1" style={{ color: "#f5f5f5" }}>{action.title}</div>
          <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{action.description}</div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => handleAction("rejected")}
            disabled={status !== "idle"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors hover:bg-wash disabled:opacity-50"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
          >
            {status === "rejecting" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            Reject
          </button>
          <button
            onClick={() => handleAction("approved")}
            disabled={status !== "idle"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "#C4122F" }}
          >
            {status === "approving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Approve
          </button>
        </div>
      </div>
    </motion.div>
  );
}
