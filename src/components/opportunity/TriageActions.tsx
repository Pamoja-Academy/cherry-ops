"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";

interface Props {
  opportunityId: number;
  currentStatus: string;
}

export function TriageActions({ opportunityId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "discard" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (currentStatus !== "pending") {
    return (
      <div className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
        Triage: <span className="font-semibold capitalize">{currentStatus}</span>
      </div>
    );
  }

  async function triage(status: "approved" | "discarded") {
    setLoading(status === "approved" ? "approve" : "discard");
    setError(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triage_status: status, triage_note: note || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Triage failed");
      }
      if (status === "approved") {
        router.push("/pitches");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Triage failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (required reason for Pass)"
        rows={2}
        className="w-full rounded-lg border bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30"
        style={{ borderColor: "rgba(255,255,255,0.15)" }}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => triage("approved")}
          disabled={loading !== null}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "#16A34A" }}
        >
          {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Pitch it
        </button>
        <button
          onClick={() => triage("discarded")}
          disabled={loading !== null}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
          style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
        >
          {loading === "discard" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Pass
        </button>
      </div>
    </div>
  );
}
