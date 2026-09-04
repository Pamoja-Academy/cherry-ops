import { getTeamMembers, getWorkspaceSettings } from "@/lib/queries";
import { AgencySettingsForm } from "@/components/settings/AgencySettingsForm";

const ROLE_LABELS: Record<string, string> = {
  CEO: "Chief Executive Officer",
  CREATIVE_DIRECTOR: "Creative Director",
  DIRECTOR: "Director",
  PRODUCTION: "Production Director",
  MEDIA: "Media Director",
  FINANCE: "Finance Manager",
};

const ROLE_COLORS: Record<string, string> = {
  CEO: "#C4122F",
  CREATIVE_DIRECTOR: "#7C3AED",
  DIRECTOR: "#B45309",
  PRODUCTION: "#1D4ED8",
  MEDIA: "#0891B2",
  FINANCE: "#16A34A",
};

export default async function SettingsPage() {
  const [team, workspace] = await Promise.all([getTeamMembers(), getWorkspaceSettings()]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#f5f5f5" }}>
          Settings
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          Team & workspace configuration — edit and save
        </p>
      </div>

      <AgencySettingsForm
        initial={{
          agency_name: workspace.agency_name,
          headquarters: workspace.headquarters,
          founded: workspace.founded,
          certification: workspace.certification,
          services: workspace.services,
        }}
      />

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <h3 className="font-display font-bold" style={{ color: "#f5f5f5" }}>
            Team Members
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            Demo accounts (roles locked for contest safety)
          </p>
        </div>
        <div>
          {team.map((member, i) => {
            const color = ROLE_COLORS[member.role] ?? "#8C8078";
            return (
              <div
                key={member.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  borderBottom: i < team.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: color }}
                >
                  {member.avatar_initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "#f5f5f5" }}>
                    {member.name}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {member.email}
                  </div>
                </div>
                <div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${color}15`, color }}
                  >
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
