"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const DEMO_ROLES = [
  {
    label: "CEO",
    email: "ceo@cherry-ops.demo",
    password: "cherry-ceo-2026",
    initials: "PM",
    name: "Pheladi Mphahlele",
    hero: "/hero/cherry-ops-hero.png",
  },
  {
    label: "Creative Director",
    email: "cd@cherry-ops.demo",
    password: "cherry-cd-2026",
    initials: "DV",
    name: "Danny van Vuuren",
    hero: "/hero/cherry-ops-hero-danny.png",
  },
  {
    label: "Director",
    email: "director@cherry-ops.demo",
    password: "cherry-dir-2026",
    initials: "JM",
    name: "Jenna Murray-Smith",
    hero: "/hero/cherry-ops-hero-jenna.png",
  },
  {
    label: "Production Director",
    email: "production@cherry-ops.demo",
    password: "cherry-prod-2026",
    initials: "RB",
    name: "Robbyn Burger",
    hero: "/hero/cherry-ops-hero-robbyn.png",
  },
  {
    label: "Media Director",
    email: "media@cherry-ops.demo",
    password: "cherry-media-2026",
    initials: "FD",
    name: "Faye Dawood",
    hero: "/hero/cherry-ops-hero-faye.png",
  },
  {
    label: "Finance Manager",
    email: "finance@cherry-ops.demo",
    password: "cherry-fin-2026",
    initials: "AF",
    name: "Aliki Frantzeskos",
    hero: "/hero/cherry-ops-hero-aliki.png",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
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

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % DEMO_ROLES.length);
    }, 5000);
    return () => clearInterval(id);
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

  function fillRole(role: (typeof DEMO_ROLES)[0], index: number) {
    setEmail(role.email);
    setPassword(role.password);
    setError("");
    setHeroIndex(index);
  }

  const activeHero = DEMO_ROLES[heroIndex];

  return (
    <div className="h-dvh max-h-dvh overflow-hidden bg-[#050505] text-white">
      <div className="grid h-full lg:grid-cols-2">
        {/* Left: full viewport height — face always in frame, no scroll */}
        <section className="relative hidden h-full overflow-hidden bg-[#0a0a0a] lg:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeHero.hero}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeHero.hero}
                alt={activeHero.name}
                className="h-full w-full object-cover object-[50%_18%]"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,5,5,0.25) 0%, transparent 28%, rgba(5,5,5,0.35) 62%, rgba(5,5,5,0.94) 100%)",
            }}
          />

          {/* Branding pinned in viewport bottom — never forces scroll */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-8 xl:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#C4122F]">
              Red Cherry Interactive
            </p>
            <h1 className="mt-2 font-display text-5xl font-extrabold leading-[0.9] tracking-[-0.05em] xl:text-6xl">
              CHERRY
              <br />
              <span className="text-[#C4122F]">OPS</span>
            </h1>
            <p className="mt-3 max-w-sm text-xs text-white/45 xl:text-sm">
              {activeHero.name} · {activeHero.label}
            </p>
          </div>
        </section>

        {/* Right: compact form — fits viewport, demo list scrolls internally if needed */}
        <section className="relative flex h-full min-h-0 flex-col justify-center overflow-hidden px-6 py-6 sm:px-10 lg:border-l lg:border-white/10 lg:px-12">
          <div className="mb-4 shrink-0 lg:hidden">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C4122F]">
              Red Cherry Interactive
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
              CHERRY <span className="text-[#C4122F]">OPS</span>
            </h1>
          </div>

          <div className="flex min-h-0 w-full max-w-md flex-col">
            <h2 className="shrink-0 font-display text-2xl font-bold tracking-tight xl:text-3xl">
              Enter workspace
            </h2>
            <p className="mt-1 shrink-0 text-xs text-white/45 sm:text-sm">
              Demo roles for the contest walkthrough
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-4 shrink-0 space-y-3"
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
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
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
                  className="w-full border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C4122F]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
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
                  className="w-full border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C4122F]"
                />
              </div>

              {error && (
                <p className="border border-[#C4122F]/40 bg-[#C4122F]/15 px-3 py-2 text-xs text-[#fecaca]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-[#C4122F] py-3 text-sm font-bold uppercase tracking-[0.15em] text-white hover:bg-[#9E0E26] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-5 flex min-h-0 flex-1 flex-col">
              <p className="mb-2 shrink-0 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
                Demo access
              </p>
              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                {DEMO_ROLES.map((role, i) => (
                  <button
                    key={role.email}
                    type="button"
                    onClick={() => fillRole(role, i)}
                    className="flex w-full items-center gap-2.5 border px-3 py-2 text-left transition hover:border-[#C4122F]/60"
                    style={{
                      borderColor: email === role.email ? "#C4122F" : "rgba(255,255,255,0.1)",
                      background:
                        email === role.email ? "rgba(196,18,47,0.12)" : "rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: email === role.email ? "#C4122F" : "#1a1a1a" }}
                    >
                      {role.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-white sm:text-sm">
                        {role.name}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40">
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
