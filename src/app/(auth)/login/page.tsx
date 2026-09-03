"use client";

import { useState, useEffect } from "react";
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

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${6 + ((i * 17) % 88)}%`,
  delay: i * 0.35,
  duration: 7 + (i % 5),
  size: 3 + (i % 4),
}));

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setEmail("");
    setPassword("");
    const t = setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 50);
    return () => clearTimeout(t);
  }, []);

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
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: brand gate — cinematic quality, still a CRM login */}
        <section className="relative hidden overflow-hidden bg-[#0a0a0a] lg:block">
          {/* Ambient cherry bloom (behind art) */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[38%] h-[55vmin] w-[55vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(196,18,47,0.45) 0%, rgba(196,18,47,0.12) 42%, transparent 70%)",
            }}
            animate={{ opacity: [0.35, 0.75, 0.45, 0.7, 0.35], scale: [0.92, 1.08, 0.98, 1.05, 0.92] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Figurine: Ken Burns + breath — PNG can't limb-animate; motion sells presence */}
          <motion.div
            className="absolute inset-[-8%]"
            animate={{
              scale: [1.08, 1.16, 1.11, 1.18, 1.08],
              x: [0, -18, 8, -10, 0],
              y: [0, 10, -6, 14, 0],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="h-full w-full"
              animate={{ y: [0, -10, 0, 6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero/cherry-ops-hero.png"
                alt="Red Cherry Interactive"
                className="h-full w-full object-cover object-[48%_10%]"
                draggable={false}
              />
            </motion.div>
          </motion.div>

          {/* Soft light sweep across cloak / chest */}
          <motion.div
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.14) 48%, transparent 62%)",
            }}
            animate={{ x: ["-40%", "55%", "-40%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,5,5,0.2) 0%, transparent 35%, rgba(5,5,5,0.45) 72%, rgba(5,5,5,0.92) 100%)",
            }}
          />

          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className="pointer-events-none absolute bg-[#C4122F]"
              style={{
                left: p.left,
                bottom: "-4%",
                width: p.size,
                height: p.size * 1.6,
                boxShadow: "0 0 8px rgba(196,18,47,0.6)",
              }}
              animate={{
                y: [0, -820],
                x: [0, (p.id % 2 === 0 ? 1 : -1) * (14 + p.id * 2)],
                opacity: [0, 0.85, 0],
                rotate: [0, 40 + p.id * 8],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          <div className="absolute inset-x-0 bottom-0 z-10 p-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#C4122F]">
              Red Cherry Interactive
            </p>
            <h1 className="mt-3 font-display text-6xl font-extrabold leading-[0.9] tracking-[-0.05em]">
              CHERRY
              <br />
              <span className="text-[#C4122F]">OPS</span>
            </h1>
            <p className="mt-4 max-w-xs text-sm text-white/40">
              Agency CRM — clients, jobs, production, media, finance.
            </p>
          </div>
        </section>

        {/* Right: sign-in only */}
        <section className="relative flex flex-col justify-center px-8 py-12 sm:px-12 lg:border-l lg:border-white/10 lg:px-16">
          <div className="mb-8 block lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/cherry-ops-hero.png"
              alt=""
              className="mb-6 h-48 w-full object-cover object-[50%_15%]"
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C4122F]">
              Red Cherry Interactive
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
              CHERRY <span className="text-[#C4122F]">OPS</span>
            </h1>
          </div>

          <div className="w-full max-w-md">
            <h2 className="font-display text-3xl font-bold tracking-tight">Enter workspace</h2>
            <p className="mt-2 text-sm text-white/45">Demo roles for the contest walkthrough</p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-4"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore
            >
              <input
                type="text"
                name="cherry-ops-username"
                autoComplete="username"
                className="hidden"
                tabIndex={-1}
                aria-hidden
                readOnly
                value=""
              />
              <input
                type="password"
                name="cherry-ops-password"
                autoComplete="new-password"
                className="hidden"
                tabIndex={-1}
                aria-hidden
                readOnly
                value=""
              />
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Email
                </label>
                <input
                  type="email"
                  name="cherry-ops-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="ceo@cherry-ops.demo"
                  className="w-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#C4122F]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Password
                </label>
                <input
                  type="password"
                  name="cherry-ops-pass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className="w-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#C4122F]"
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
                className="flex w-full items-center justify-center gap-2 bg-[#C4122F] py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white hover:bg-[#9E0E26] disabled:opacity-60"
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
                {DEMO_ROLES.map((role) => (
                  <button
                    key={role.email}
                    type="button"
                    onClick={() => fillRole(role)}
                    className="flex w-full items-center gap-3 border px-4 py-3 text-left transition hover:border-[#C4122F]/60"
                    style={{
                      borderColor: email === role.email ? "#C4122F" : "rgba(255,255,255,0.1)",
                      background:
                        email === role.email ? "rgba(196,18,47,0.12)" : "rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-xs font-bold text-white"
                      style={{ background: email === role.email ? "#C4122F" : "#1a1a1a" }}
                    >
                      {role.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{role.name}</div>
                      <div className="text-[11px] uppercase tracking-wider text-white/40">
                        {role.label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
