import { getClientById } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

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
        <Link href="/clients" className="text-sm flex items-center gap-1" style={{ color: "#8C8078" }}>
          <ArrowLeft className="w-4 h-4" /> Clients
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-xl border p-6" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
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
                <h2 className="font-display text-2xl font-bold" style={{ color: "#1A1214" }}>{client.name}</h2>
                {client.is_private_sector && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FCE8EC", color: "#7A0B22" }}>
                    Private Sector
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#8C8078" }}>
                <span>{client.sector}</span>
                {client.industry && <><span>·</span><span>{client.industry}</span></>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold" style={{ color: "#1A1214" }}>{fmt(client.totalBilled)}</div>
            <div className="text-xs" style={{ color: "#8C8078" }}>Total billed</div>
            {client.outstanding > 0 && (
              <div className="mt-1 text-sm font-bold" style={{ color: "#C4122F" }}>
                {fmt(client.outstanding)} outstanding
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4" style={{ borderColor: "#F3EBE7" }}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#8C8078" }}>Key Contact</div>
            <div className="text-sm font-medium" style={{ color: "#1A1214" }}>{client.contact_name ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#8C8078" }}>Email</div>
            <div className="text-sm flex items-center gap-1" style={{ color: "#1A1214" }}>
              <Mail className="w-3.5 h-3.5" />{client.contact_email ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#8C8078" }}>Account Manager</div>
            <div className="text-sm font-medium" style={{ color: "#1A1214" }}>{client.manager?.name ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts */}
        <div className="rounded-xl border p-5" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "#1A1214" }}>Contacts ({client.contacts.length})</h3>
          <div className="space-y-2">
            {client.contacts.length === 0 && <p className="text-sm" style={{ color: "#8C8078" }}>No contacts on record.</p>}
            {client.contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: "#F3EBE7" }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: c.is_primary ? "#FCE8EC" : "#F3EBE7", color: c.is_primary ? "#7A0B22" : "#8C8078" }}
                >
                  {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2" style={{ color: "#1A1214" }}>
                    {c.name}
                    {c.is_primary === true && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#FCE8EC", color: "#7A0B22" }}>
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs truncate" style={{ color: "#8C8078" }}>
                    {[c.role, c.email].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BD notes */}
        <div className="rounded-xl border p-5" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "#1A1214" }}>Account Notes</h3>
          {client.notes ? (
            <p className="text-sm leading-relaxed" style={{ color: "#1A1214" }}>{client.notes}</p>
          ) : (
            <p className="text-sm" style={{ color: "#8C8078" }}>No notes captured yet.</p>
          )}
          {client.is_private_sector && (
            <div className="mt-4 pt-4 border-t text-xs" style={{ borderColor: "#F3EBE7", color: "#7A0B22" }}>
              Private-sector account — part of the growth portfolio. Keep BD history current after every touchpoint.
            </div>
          )}
        </div>

        {/* Jobs */}
        <div className="rounded-xl border p-5" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "#1A1214" }}>Jobs ({client.jobs.length})</h3>
          <div className="space-y-2">
            {client.jobs.length === 0 && <p className="text-sm" style={{ color: "#8C8078" }}>No jobs yet.</p>}
            {client.jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-wash" style={{ borderColor: "#F3EBE7" }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#1A1214" }}>{job.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#8C8078" }}>{job.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${STAGE_COLORS[job.stage]}15`, color: STAGE_COLORS[job.stage] }}>
                      {job.stage}
                    </span>
                    {job.value && <span className="text-xs font-semibold" style={{ color: "#8C8078" }}>{fmt(job.value)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border p-5" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "#1A1214" }}>Invoices ({client.invoices.length})</h3>
          <div className="space-y-2">
            {client.invoices.length === 0 && <p className="text-sm" style={{ color: "#8C8078" }}>No invoices yet.</p>}
            {client.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "#F3EBE7" }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#1A1214" }}>{inv.number}</div>
                  <div className="text-xs" style={{ color: "#8C8078" }}>{inv.issued_date}</div>
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
