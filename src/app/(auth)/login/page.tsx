"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const DEMO_ROLES = [
  {
    label: "CEO",
    email: "ceo@cherry-ops.demo",
    password: "cherry-ceo-2026",
    initials: "PM",
    name: "Pheladi Mphahlele",
  },
  {
    label: "Creative Director",
    email: "cd@cherry-ops.demo",
    password: "cherry-cd-2026",
    initials: "DV",
    name: "Danny van Vuuren",
  },
  {
    label: "Production",
    email: "production@cherry-ops.demo",
    password: "cherry-prod-2026",
    initials: "LD",
    name: "Lerato Dlamini",
  },
  {
    label: "Media",
    email: "media@cherry-ops.demo",
    password: "cherry-media-2026",
    initials: "SM",
    name: "Sipho Molefe",
  },
  {
    label: "Finance",
    email: "finance@cherry-ops.demo",
    password: "cherry-fin-2026",
    initials: "ZK",
    name: "Zanele Khumalo",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function fillRole(role: (typeof DEMO_ROLES)[0]) {
    setEmail(role.email);
    setPassword(role.password);
    setError("");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Full-bleed cinematic plane */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 20% 10%, rgba(196,18,47,0.45), transparent 55%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(122,11,34,0.35), transparent 50%), linear-gradient(180deg, #050505 0%, #0a0a0a 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* Brand hero — first viewport is brand + one line + CTA energy */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="flex flex-col justify-between px-8 py-10 sm:px-12 lg:px-16 lg:py-14"
        >
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#C4122F]"
            >
              Red Cherry Interactive
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="mt-6 font-display text-6xl font-extrabold leading-[0.88] tracking-[-0.05em] sm:text-7xl lg:text-8xl"
            >
              CHERRY
              <br />
              <span className="text-[#C4122F]">OPS</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-6 max-w-sm text-base leading-relaxed text-white/55"
            >
              The agency OS for work that sells — strategy, film, media, studio, cash.
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/30 lg:mt-0"
          >
            New Work · Private Sector · Measurable
          </motion.p>
        </motion.section>

        {/* Sign-in */}
        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="flex items-center border-t border-white/10 px-8 py-12 sm:px-12 lg:border-l lg:border-t-0 lg:px-16"
        >
          <div className="w-full max-w-md">
            <h2 className="font-display text-3xl font-bold tracking-tight">Enter workspace</h2>
            <p className="mt-2 text-sm text-white/45">Demo roles for the contest walkthrough</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ceo@cherry-ops.demo"
                  className="w-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#C4122F]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#C4122F]"
                />
              </div>

              {error && (
                <p className="border border-[#C4122F]/40 bg-[#C4122F]/15 px-3 py-2 text-sm text-[#fecaca]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-[#C4122F] py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#9E0E26] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-10">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
                Demo access
              </p>
              <div className="space-y-2">
                {DEMO_ROLES.map((role, i) => (
                  <motion.button
                    key={role.email}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    whileHover={{ x: 4 }}
                    onClick={() => fillRole(role)}
                    className="flex w-full items-center gap-3 border px-4 py-3 text-left transition"
                    style={{
                      borderColor: email === role.email ? "#C4122F" : "rgba(255,255,255,0.1)",
                      background: email === role.email ? "rgba(196,18,47,0.12)" : "rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-xs font-bold"
                      style={{
                        background: email === role.email ? "#C4122F" : "#1a1a1a",
                        color: "#fff",
                      }}
                    >
                      {role.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{role.name}</div>
                      <div className="text-[11px] uppercase tracking-wider text-white/40">
                        {role.label}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
