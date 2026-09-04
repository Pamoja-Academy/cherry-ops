"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

const SECTORS = [
  "Financial Services",
  "FMCG",
  "Agriculture",
  "Government",
  "Retail",
  "Telecommunications",
  "Media & Entertainment",
  "Property",
  "Pharma",
  "Tech",
];

export function AddClientButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    sector: "Retail",
    industry: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    is_private_sector: true,
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setOpen(false);
      setForm({
        name: "",
        sector: "Retail",
        industry: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        is_private_sector: true,
        notes: "",
      });
      router.refresh();
      if (data.client?.id) router.push(`/clients/${data.client.id}`);
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
        className="inline-flex items-center gap-2 rounded-lg bg-[#C4122F] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E0E26]"
      >
        <Plus className="h-3.5 w-3.5" /> Add client
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-lg space-y-3 rounded-xl border border-white/10 bg-[#111] p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">New client</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {(
              [
                ["name", "Client name", "text", true],
                ["contact_name", "Contact name", "text", false],
                ["contact_email", "Contact email", "email", false],
                ["contact_phone", "Phone", "text", false],
                ["industry", "Industry", "text", false],
              ] as const
            ).map(([key, label, type, required]) => (
              <label key={key} className="block space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</span>
                <input
                  required={required}
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#C4122F]"
                />
              </label>
            ))}

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Sector</span>
              <select
                value={form.sector}
                onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
                className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#C4122F]"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.is_private_sector}
                onChange={(e) => setForm((f) => ({ ...f, is_private_sector: e.target.checked }))}
              />
              Private sector
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#C4122F]"
              />
            </label>

            {error && <p className="text-xs text-[#fecaca]">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C4122F] py-2.5 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Creating…" : "Create client"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
