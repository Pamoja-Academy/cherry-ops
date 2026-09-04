"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

type ClientFields = {
  id: number;
  name: string;
  sector: string;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_private_sector: boolean;
  notes: string | null;
  status: "active" | "inactive";
};

export function EditClientPanel({ client }: { client: ClientFields }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: client.name,
    sector: client.sector,
    industry: client.industry ?? "",
    contact_name: client.contact_name ?? "",
    contact_email: client.contact_email ?? "",
    contact_phone: client.contact_phone ?? "",
    is_private_sector: client.is_private_sector,
    notes: client.notes ?? "",
    status: client.status,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage({ type: "ok", text: "Saved" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSave}
      className="rounded-xl border p-5 space-y-3"
      style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-white">Edit client</h3>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C4122F] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
      </div>

      {(
        [
          ["name", "Name"],
          ["sector", "Sector"],
          ["industry", "Industry"],
          ["contact_name", "Contact"],
          ["contact_email", "Email"],
          ["contact_phone", "Phone"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</span>
          <input
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#C4122F]"
          />
        </label>
      ))}

      <label className="block space-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Status</span>
        <select
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))
          }
          className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#C4122F]"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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

      {message && (
        <p className="text-xs" style={{ color: message.type === "ok" ? "#4ADE80" : "#fecaca" }}>
          {message.text}
        </p>
      )}
    </form>
  );
}
