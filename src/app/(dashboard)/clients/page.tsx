import { getClients } from "@/lib/queries";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AddClientButton } from "@/components/clients/AddClientButton";

const SECTOR_COLORS: Record<string, string> = {
  "Financial Services": "#1D4ED8",
  "FMCG": "#16A34A",
  "Agriculture": "#65A30D",
  "Government": "#6366F1",
  "Retail": "#D97706",
  "Telecommunications": "#0891B2",
  "Media & Entertainment": "#7C3AED",
};

function getSectorColor(sector: string) {
  return SECTOR_COLORS[sector] ?? "#8C8078";
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>Clients</h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{clients.length} accounts</p>
        </div>
        <AddClientButton />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              {["Client", "Sector", "Account Manager", "Active Activations", "Outstanding", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client, i) => {
              const color = getSectorColor(client.sector);
              return (
                <tr
                  key={client.id}
                  style={{ borderBottom: i < clients.length - 1 ? "1px solid #F3EBE7" : "none" }}
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
                        <div className="text-sm font-semibold" style={{ color: "#f5f5f5" }}>{client.name}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{client.contact_name}</div>
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
                    <span className="text-sm" style={{ color: "#f5f5f5" }}>
                      {client.account_manager?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: (client.active_activations as number) > 0 ? "#1D4ED8" : "#8C8078" }}
                    >
                      {client.active_activations as number}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: (client.outstanding as number) > 0 ? "#C4122F" : "#16A34A" }}
                    >
                      {(client.outstanding as number) > 0 ? fmt(client.outstanding as number) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/clients/${client.id}`}>
                      <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.45)" }} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
