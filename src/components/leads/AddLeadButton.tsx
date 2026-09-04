"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

const STAGES = ["cold", "warm", "proposal", "won", "lost"] as const;

export function AddLeadButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company: "",
    sector: "Retail",
    contact_name: "",
    contact_email: "",
    source: "Outbound",
    status: "cold" as (typeof STAGES)[number],
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setOpen(false);
      setForm({
        company: "",
        sector: "Retail",
        contact_name: "",
        contact_email: "",
        source: "Outbound",
        status: "cold",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20"
      >
        <Plus className="h-3.5 w-3.5" /> Add lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-md space-y-3 rounded-xl border border-white/10 bg-[#111] p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">New lead</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-white/50">
                <X className="h-4 w-4" />
              </button>
            </div>

            {(
              [
                ["company", "Company", true],
                ["sector", "Sector", true],
                ["contact_name", "Contact", false],
                ["contact_email", "Email", false],
                ["source", "Source", false],
              ] as const
            ).map(([key, label, required]) => (
              <label key={key} className="block space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</span>
                <input
                  required={required}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#C4122F]"
                />
              </label>
            ))}

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Stage</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as (typeof STAGES)[number] }))
                }
                className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#C4122F]"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="text-xs text-[#fecaca]">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C4122F] py-2.5 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Creating…" : "Create lead"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
