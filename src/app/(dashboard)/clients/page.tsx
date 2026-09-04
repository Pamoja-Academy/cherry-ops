import { getClients } from "@/lib/queries";
import { ClientFilter } from "@/components/clients/ClientFilter";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#1A1214" }}>Clients</h2>
          <p className="text-sm mt-0.5" style={{ color: "#8C8078" }}>{clients.length} accounts</p>
        </div>
      </div>

      <ClientFilter
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          sector: c.sector,
          industry: c.industry,
          contact_name: c.contact_name,
          is_private_sector: c.is_private_sector,
          active_jobs: c.active_jobs,
          outstanding: c.outstanding,
          account_manager: c.account_manager ? { name: c.account_manager.name } : undefined,
        }))}
      />
    </div>
  );
}
