"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export function ScanBriefsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/opportunities/ingest", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Scan failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={scan}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 hover:bg-white/10 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Scan briefs
      </button>
      {error && <span className="text-[10px] text-[#fecaca]">{error}</span>}
    </div>
  );
}
