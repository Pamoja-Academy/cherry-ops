"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

const SECTOR_COLORS: Record<string, string> = {
  "Financial Services": "#1D4ED8",
  "FMCG": "#16A34A",
  "Agriculture": "#65A30D",
  "Government": "#6366F1",
  "Retail": "#D97706",
  "Telecommunications": "#0891B2",
  "Media & Entertainment": "#7C3AED",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

interface ClientRow {
  id: number;
  name: string;
  sector: string;
  industry: string | null;
  contact_name: string | null;
  is_private_sector: boolean;
  active_jobs: number;
  outstanding: number;
  account_manager?: { name: string } | undefined;
}

export function ClientFilter({ clients }: { clients: ClientRow[] }) {
  const [sector, setSector] = useState<string>("all");
  const [privateOnly, setPrivateOnly] = useState(false);
  const [query, setQuery] = useState("");

  const sectors = useMemo(
    () => Array.from(new Set(clients.map((c) => c.sector))).sort(),
    [clients]
  );

  const filtered = clients.filter((c) => {
    if (sector !== "all" && c.sector !== sector) return false;
    if (privateOnly && !c.is_private_sector) return false;
    if (query && !`${c.name} ${c.contact_name ?? ""}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[200px]"
          style={{ background: "#fff", borderColor: "#E4D8D1" }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#8C8078" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients or contacts…"
            className="bg-transparent text-sm w-full focus:outline-none"
            style={{ color: "#1A1214" }}
          />
        </div>
        <button
          onClick={() => setSector("all")}
          className="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
          style={{
            background: sector === "all" ? "#1A1214" : "#fff",
            color: sector === "all" ? "#fff" : "#8C8078",
            borderColor: sector === "all" ? "#1A1214" : "#E4D8D1",
          }}
        >
          All sectors
        </button>
        {sectors.map((s) => {
          const active = sector === s;
          const color = SECTOR_COLORS[s] ?? "#8C8078";
          return (
            <button
              key={s}
              onClick={() => setSector(active ? "all" : s)}
              className="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
              style={{
                background: active ? `${color}15` : "#fff",
                color: active ? color : "#8C8078",
                borderColor: active ? color : "#E4D8D1",
              }}
            >
              {s}
            </button>
          );
        })}
        <button
          onClick={() => setPrivateOnly(!privateOnly)}
          className="px-3 py-2 rounded-lg text-xs font-bold border transition-colors"
          style={{
            background: privateOnly ? "#C4122F" : "#fff",
            color: privateOnly ? "#fff" : "#7A0B22",
            borderColor: privateOnly ? "#C4122F" : "#F4BEC8",
          }}
        >
          Private sector
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
        <table className="w-full min-w-[760px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #E4D8D1" }}>
              {["Client", "Sector", "Account Manager", "Active Jobs", "Outstanding", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#8C8078" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => {
              const color = SECTOR_COLORS[client.sector] ?? "#8C8078";
              return (
                <tr
                  key={client.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F3EBE7" : "none" }}
                  className="hover:bg-wash/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: color }}
                      >
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "#1A1214" }}>{client.name}</div>
                        <div className="text-xs" style={{ color: "#8C8078" }}>{client.contact_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${color}15`, color }}
                      >
                        {client.sector}
                      </span>
                      {client.is_private_sector && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "#FCE8EC", color: "#7A0B22" }}
                        >
                          Private
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm" style={{ color: "#1A1214" }}>
                      {client.account_manager?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: client.active_jobs > 0 ? "#1D4ED8" : "#8C8078" }}
                    >
                      {client.active_jobs}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: client.outstanding > 0 ? "#C4122F" : "#16A34A" }}
                    >
                      {client.outstanding > 0 ? fmt(client.outstanding) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/clients/${client.id}`} aria-label={`Open ${client.name}`}>
                      <ChevronRight className="w-4 h-4" style={{ color: "#8C8078" }} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "#8C8078" }}>
                  No clients match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
