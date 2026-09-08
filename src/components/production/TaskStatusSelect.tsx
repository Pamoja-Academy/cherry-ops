"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const STATUSES = ["todo", "in_progress", "done"] as const;

export function TaskStatusSelect({
  taskId,
  status,
}: {
  taskId: number;
  status: (typeof STATUSES)[number];
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onChange(next: (typeof STATUSES)[number]) {
    const prev = value;
    setValue(next);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/event-tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.refresh();
    } catch (err) {
      setValue(prev);
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <select
          value={value}
          disabled={loading}
          onChange={(e) => onChange(e.target.value as (typeof STATUSES)[number])}
          className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-[10px] uppercase tracking-wide text-white outline-none focus:border-[#C4122F] disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-white/50" />}
      </div>
      {error && <p className="mt-1 text-[10px] text-[#fecaca]">{error}</p>}
    </div>
  );
}
