import { getInvoices } from "@/lib/queries";
import { InvoiceActions } from "@/components/invoices/InvoiceActions";
import Link from "next/link";

const STATUSES = ["draft", "sent", "overdue", "paid"] as const;
type InvStatus = typeof STATUSES[number];

const STATUS_COLORS: Record<InvStatus, string> = {
  draft: "#8C8078",
  sent: "#1D4ED8",
  overdue: "#C4122F",
  paid: "#16A34A",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const byStatus = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: invoices.filter((i) => i.status === s) }),
    {} as Record<InvStatus, typeof invoices>
  );

  const totals = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: byStatus[s].reduce((sum, i) => sum + i.amount, 0) }),
    {} as Record<InvStatus, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#1A1214" }}>Invoice Pipeline</h2>
        <p className="text-sm mt-0.5" style={{ color: "#8C8078" }}>{invoices.length} invoices</p>
      </div>

      {/* Status pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUSES.map((s) => {
          const color = STATUS_COLORS[s];
          const count = byStatus[s].length;
          return (
            <div key={s} className="rounded-xl border p-4" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
              <div className="text-xl font-bold" style={{ color }}>{count}</div>
              <div className="text-xs font-bold uppercase tracking-wider capitalize mb-1" style={{ color }}>{s}</div>
              <div className="text-sm font-semibold" style={{ color: "#1A1214" }}>{fmt(totals[s])}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
        <table className="w-full min-w-[880px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #E4D8D1" }}>
              {["Number", "Client", "Job", "Amount", "Status", "Due Date", "Overdue", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#8C8078" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => {
              const color = STATUS_COLORS[inv.status as InvStatus] ?? "#8C8078";
              return (
                <tr key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? "1px solid #F3EBE7" : "none" }}>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold" style={{ color: "#1A1214" }}>{inv.number}</span>
                  </td>
                  <td className="px-5 py-4">
                    {inv.client ? (
                      <Link href={`/clients/${inv.client.id}`} className="text-sm hover:underline" style={{ color: "#1A1214" }}>
                        {inv.client.name}
                      </Link>
                    ) : (
                      <span className="text-sm" style={{ color: "#8C8078" }}>—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {inv.job ? (
                      <Link href={`/jobs/${inv.job.id}`} className="text-sm hover:underline" style={{ color: "#8C8078" }}>
                        {inv.job.title}
                      </Link>
                    ) : (
                      <span className="text-sm" style={{ color: "#8C8078" }}>—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold" style={{ color: "#1A1214" }}>{fmt(inv.amount)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                      style={{ background: `${color}15`, color }}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm" style={{ color: inv.status === "overdue" ? "#C4122F" : "#8C8078" }}>
                      {inv.due_date ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {inv.daysOverdue > 0 ? (
                      <span className="text-sm font-bold" style={{ color: "#C4122F" }}>
                        {inv.daysOverdue}d
                      </span>
                    ) : <span style={{ color: "#8C8078" }}>—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <InvoiceActions invoiceId={inv.id} status={inv.status} />
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
