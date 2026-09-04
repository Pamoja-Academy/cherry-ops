import { getMediaBuys } from "@/lib/queries";

const STATUS_COLORS: Record<string, string> = {
  planned: "#8C8078",
  live: "#16A34A",
  complete: "#1D4ED8",
  paused: "#D97706",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

export default async function MediaPage() {
  const buys = await getMediaBuys();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>Media Buys</h2>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{buys.length} placements</p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              {["Buy", "Channel / Placement", "Budget", "Spent", "Pacing", "Status", "Period"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {buys.map((buy, i) => {
              const pct = buy.budget > 0 ? Math.round((buy.spent / buy.budget) * 100) : 0;
              const barColor =
                buy.pacing_status === "over" ? "#C4122F" :
                buy.pacing_status === "under" ? "#D97706" : "#16A34A";
              const statusColor = STATUS_COLORS[buy.status] ?? "#8C8078";

              return (
                <tr key={buy.id} style={{ borderBottom: i < buys.length - 1 ? "1px solid #F3EBE7" : "none" }}>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold" style={{ color: "#f5f5f5" }}>{buy.title}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{buy.job?.title ?? "—"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{buy.channel}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{buy.placement ?? "—"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold" style={{ color: "#f5f5f5" }}>{fmt(buy.budget)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold" style={{ color: barColor }}>{fmt(buy.spent)}</span>
                  </td>
                  <td className="px-5 py-4" style={{ minWidth: 120 }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                        />
                      </div>
                      <span className="text-xs font-semibold flex-shrink-0" style={{ color: barColor }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="text-xs mt-0.5 capitalize" style={{ color: barColor }}>
                      {buy.pacing_status}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                      style={{ background: `${statusColor}15`, color: statusColor }}
                    >
                      {buy.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {buy.start_date ?? "—"} → {buy.end_date ?? "—"}
                    </div>
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
