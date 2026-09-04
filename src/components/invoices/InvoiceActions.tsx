"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, CircleCheck, BellRing, Loader2 } from "lucide-react";

type ProposalType = "send_invoice" | "mark_invoice_paid" | "send_invoice_reminder";

interface Props {
  invoiceId: number;
  status: string;
}

export function InvoiceActions({ invoiceId, status }: Props) {
  const [busy, setBusy] = useState<ProposalType | null>(null);
  const [proposed, setProposed] = useState(false);
  const [failed, setFailed] = useState(false);
  const router = useRouter();

  async function propose(type: ProposalType) {
    setBusy(type);
    setFailed(false);
    try {
      const res = await fetch("/api/invoices/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setFailed(true);
        return;
      }
      setProposed(true);
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  if (proposed) {
    return (
      <Link
        href="/autopilot"
        className="text-xs font-semibold flex items-center gap-1 hover:underline"
        style={{ color: "#C4122F" }}
      >
        <CircleCheck className="w-3.5 h-3.5" /> Queued for approval
      </Link>
    );
  }

  if (status === "paid") {
    return <span className="text-xs" style={{ color: "#8C8078" }}>—</span>;
  }

  const btn =
    "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border transition-colors hover:bg-white/5 disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5">
      {status === "draft" && (
        <button
          onClick={() => propose("send_invoice")}
          disabled={busy !== null}
          className={btn}
          style={{ borderColor: "rgba(255,255,255,0.15)", color: "#93C5FD" }}
          title="Propose sending this invoice to the client (Autopilot approval)"
        >
          {busy === "send_invoice" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          Send
        </button>
      )}
      {(status === "sent" || status === "overdue") && (
        <>
          <button
            onClick={() => propose("send_invoice_reminder")}
            disabled={busy !== null}
            className={btn}
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "#FBBF24" }}
            title="Propose an overdue reminder (Autopilot approval)"
          >
            {busy === "send_invoice_reminder" ? <Loader2 className="w-3 h-3 animate-spin" /> : <BellRing className="w-3 h-3" />}
            Remind
          </button>
          <button
            onClick={() => propose("mark_invoice_paid")}
            disabled={busy !== null}
            className={btn}
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "#4ADE80" }}
            title="Propose marking this invoice paid (Autopilot approval)"
          >
            {busy === "mark_invoice_paid" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CircleCheck className="w-3 h-3" />}
            Paid
          </button>
        </>
      )}
      {failed && <span className="text-xs font-medium" style={{ color: "#C4122F" }}>Failed</span>}
    </div>
  );
}
