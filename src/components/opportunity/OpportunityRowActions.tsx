"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  opportunityId: number;
}

export function OpportunityRowActions({ opportunityId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "discard" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function triage(status: "approved" | "discarded") {
    setLoading(status === "approved" ? "approve" : "discard");
    setError(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triage_status: status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Triage failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Triage failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3 space-y-1.5">
      {error && <p className="text-[10px] text-[#fecaca]">{error}</p>}
      <div className="flex gap-1.5">
      <button
        onClick={(e) => {
          e.preventDefault();
          triage("approved");
        }}
        disabled={loading !== null}
        className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white disabled:opacity-50"
        style={{ background: "#16A34A" }}
      >
        {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Pitch it"}
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          triage("discarded");
        }}
        disabled={loading !== null}
        className="rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wide disabled:opacity-50"
        style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}
      >
        {loading === "discard" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Pass"}
      </button>
      <Link
        href={`/opportunities/${opportunityId}`}
        className="ml-auto text-[10px] uppercase tracking-wide"
        style={{ color: "#C4122F" }}
      >
        Details →
      </Link>
      </div>
    </div>
  );
}
