import { getTeamMembers } from "@/lib/queries";

const ROLE_LABELS: Record<string, string> = {
  CEO: "Chief Executive Officer",
  CREATIVE_DIRECTOR: "Creative Director",
  PRODUCTION: "Production Manager",
  MEDIA: "Media Specialist",
  FINANCE: "Finance Manager",
};

const ROLE_COLORS: Record<string, string> = {
  CEO: "#C4122F",
  CREATIVE_DIRECTOR: "#7C3AED",
  PRODUCTION: "#1D4ED8",
  MEDIA: "#0891B2",
  FINANCE: "#16A34A",
};

export default async function SettingsPage() {
  const team = await getTeamMembers();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#1A1214" }}>Settings</h2>
        <p className="text-sm mt-0.5" style={{ color: "#8C8078" }}>Team & workspace configuration</p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#E4D8D1" }}>
          <h3 className="font-display font-bold" style={{ color: "#1A1214" }}>Team Members</h3>
          <p className="text-xs mt-0.5" style={{ color: "#8C8078" }}>5 demo accounts available</p>
        </div>
        <div>
          {team.map((member, i) => {
            const color = ROLE_COLORS[member.role] ?? "#8C8078";
            return (
              <div
                key={member.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: i < team.length - 1 ? "1px solid #F3EBE7" : "none" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: color }}
                >
                  {member.avatar_initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "#1A1214" }}>{member.name}</div>
                  <div className="text-xs" style={{ color: "#8C8078" }}>{member.email}</div>
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

      <div className="rounded-xl border p-5" style={{ background: "#fff", borderColor: "#E4D8D1" }}>
        <h3 className="font-display font-bold mb-3" style={{ color: "#1A1214" }}>Agency Info</h3>
        <div className="space-y-3">
          {[
            ["Agency", "Red Cherry Interactive"],
            ["Headquarters", "Rivonia, Sandton, Johannesburg"],
            ["Founded", "1996 · 30 Years"],
            ["Certification", "Level 1 BBBEE · Female-Owned"],
            ["Services", "Strategy · Creative · Media · Production · PR · Digital · Activations"],
            ["Demo Version", "Cherry Ops v1 · Contest Entry 2026"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4 text-sm">
              <span className="w-28 flex-shrink-0 font-semibold text-xs uppercase tracking-wider" style={{ color: "#8C8078" }}>{label}</span>
              <span style={{ color: "#1A1214" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
