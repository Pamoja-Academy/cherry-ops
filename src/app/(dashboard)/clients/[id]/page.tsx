import { getClientById } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const STAGE_COLORS: Record<string, string> = {
  brief: "#8C8078",
  production: "#1D4ED8",
  review: "#D97706",
  delivery: "#7A0B22",
  complete: "#16A34A",
};

const INV_COLORS: Record<string, string> = {
  paid: "#16A34A",
  sent: "#1D4ED8",
  overdue: "#C4122F",
  draft: "#8C8078",
};

export default async function ClientDetailPage(props: PageProps<"/clients/[id]">) {
  const params = await props.params;
  const id = parseInt(params.id);
  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/clients" className="text-sm flex items-center gap-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          <ArrowLeft className="w-4 h-4" /> Clients
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-xl border p-6" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white"
              style={{ background: "#C4122F" }}
            >
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>{client.name}</h2>
                {client.is_private_sector && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FCE8EC", color: "#7A0B22" }}>
                    Private Sector
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                <span>{client.sector}</span>
                {client.industry && <><span>·</span><span>{client.industry}</span></>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: "#f5f5f5" }}>{fmt(client.totalBilled)}</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Total billed</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4" style={{ borderColor: "#F3EBE7" }}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Key Contact</div>
            <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{client.contact_name ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Email</div>
            <div className="text-sm flex items-center gap-1" style={{ color: "#f5f5f5" }}>
              <Mail className="w-3.5 h-3.5" />{client.contact_email ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Account Manager</div>
            <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{client.manager?.name ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs */}
        <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "#f5f5f5" }}>Jobs ({client.jobs.length})</h3>
          <div className="space-y-2">
            {client.jobs.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>No jobs yet.</p>}
            {client.jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-wash" style={{ borderColor: "#F3EBE7" }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{job.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{job.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${STAGE_COLORS[job.stage]}15`, color: STAGE_COLORS[job.stage] }}>
                      {job.stage}
                    </span>
                    {job.value && <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>{fmt(job.value)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "#f5f5f5" }}>Invoices ({client.invoices.length})</h3>
          <div className="space-y-2">
            {client.invoices.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>No invoices yet.</p>}
            {client.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "#F3EBE7" }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#f5f5f5" }}>{inv.number}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{inv.issued_date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{fmt(inv.amount)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${INV_COLORS[inv.status]}15`, color: INV_COLORS[inv.status] }}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
