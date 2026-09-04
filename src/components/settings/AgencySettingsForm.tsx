"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

type Settings = {
  agency_name: string;
  headquarters: string;
  founded: string;
  certification: string;
  services: string;
};

const FIELDS: { key: keyof Settings; label: string }[] = [
  { key: "agency_name", label: "Agency" },
  { key: "headquarters", label: "Headquarters" },
  { key: "founded", label: "Founded" },
  { key: "certification", label: "Certification" },
  { key: "services", label: "Services" },
];

export function AgencySettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setForm({
        agency_name: data.settings.agency_name,
        headquarters: data.settings.headquarters,
        founded: data.settings.founded,
        certification: data.settings.certification,
        services: data.settings.services,
      });
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
      className="rounded-xl border p-5 space-y-4"
      style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display font-bold" style={{ color: "#f5f5f5" }}>
          Agency Info
        </h3>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C4122F] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E0E26] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {FIELDS.map(({ key, label }) => (
        <label key={key} className="block space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</span>
          <input
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#C4122F]"
          />
        </label>
      ))}

      {message && (
        <p
          className="text-xs"
          style={{ color: message.type === "ok" ? "#4ADE80" : "#fecaca" }}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
