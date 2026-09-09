"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

function roleHome(role: string | undefined): string {
  switch (role) {
    case "CEO":
      return "/dashboard";
    case "CREATIVE_DIRECTOR":
      return "/events";
    case "DIRECTOR":
      return "/clients";
    case "PRODUCTION":
      return "/production";
    case "MEDIA":
      return "/media";
    case "FINANCE":
      return "/invoices";
    default:
      return "/dashboard";
  }
}

const DEMO_ROLES = [
  {
    label: "CEO",
    email: "ceo@cherry-ops.demo",
    password: "cherry-ceo-2026",
    initials: "PM",
    name: "Pheladi Mphahlele",
    hero: "/hero/cherry-ops-hero-pheladi-locked.png",
    focus: "48% 12%",
  },
  {
    label: "Creative Director",
    email: "cd@cherry-ops.demo",
    password: "cherry-cd-2026",
    initials: "DV",
    name: "Danny van Vuuren",
    hero: "/hero/cherry-ops-hero-danny-locked.png",
    focus: "50% 10%",
  },
  {
    label: "Director",
    email: "director@cherry-ops.demo",
    password: "cherry-dir-2026",
    initials: "JM",
    name: "Jenna Murray-Smith",
    hero: "/hero/cherry-ops-hero-jenna.png",
    focus: "50% 16%",
  },
  {
    label: "Production Director",
    email: "production@cherry-ops.demo",
    password: "cherry-prod-2026",
    initials: "RB",
    name: "Robbyn Burger",
    hero: "/hero/cherry-ops-hero-robbyn-locked.png",
    focus: "50% 14%",
  },
  {
    label: "Media Director",
    email: "media@cherry-ops.demo",
    password: "cherry-media-2026",
    initials: "FD",
    name: "Faye Dawood",
    hero: "/hero/cherry-ops-hero-faye-locked.png",
    focus: "50% 18%",
  },
  {
    label: "Finance Manager",
    email: "finance@cherry-ops.demo",
    password: "cherry-fin-2026",
    initials: "AF",
    name: "Aliki Frantzeskos",
    hero: "/hero/cherry-ops-hero-aliki.png",
    focus: "50% 16%",
  },
];

const TEAM_SLIDE = {
  label: "Leadership",
  name: "Red Cherry Cast",
  // Group wallpaper has baked face-glitch bars — keep selectable, never default
  hero: "/hero/cherry-ops-team-wallpaper-locked.png",
  focus: "50% 38%",
};

/** Rotation: clean individual locked heroes first; glitched group shot last only */
const HERO_SLIDES = [
  ...DEMO_ROLES.map((r) => ({
    label: r.label,
    name: r.name,
    hero: r.hero,
    focus: r.focus,
  })),
  TEAM_SLIDE,
];

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
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
  const [heroIndex, setHeroIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const userPicked = useRef(false);
  const router = useRouter();

  // Clear autofill once on mount — do not race-clear after a demo role is picked.
  useEffect(() => {
    if (userPicked.current) return;
    setEmail("");
    setPassword("");
  }, []);

  useEffect(() => {
    if (paused || userPicked.current) return;
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(id);
  }, [paused]);

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
      const session = await getSession();
      router.push(roleHome(session?.user?.role));
      router.refresh();
    }
  }

  function applyRoleCredentials(role: (typeof DEMO_ROLES)[0]) {
    userPicked.current = true;
    setPaused(true);
    setEmail(role.email);
    setPassword(role.password);
    setError("");
  }

  function selectSlide(index: number, lock = false) {
    setHeroIndex(index);
    if (lock) {
      userPicked.current = true;
      setPaused(true);
    }
    // Individuals are indices 0..n-1; team wallpaper is last — no credentials.
    const role = DEMO_ROLES[index];
    if (role) applyRoleCredentials(role);
  }

  function fillRole(role: (typeof DEMO_ROLES)[0], roleIndex: number) {
    applyRoleCredentials(role);
    setHeroIndex(roleIndex);
  }

  const active = HERO_SLIDES[heroIndex];

  return (
    <div className="h-dvh max-h-dvh overflow-hidden bg-[#050505] text-white">
      <div className="grid h-full lg:grid-cols-2">
        {/* Left: cinematic interactive hero */}
        <section
          className="relative hidden h-full overflow-hidden bg-[#0a0a0a] lg:block"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            if (!userPicked.current) setPaused(false);
          }}
        >
          {/* Ambient cherry bloom */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[38%] h-[55vmin] w-[55vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(196,18,47,0.45) 0%, rgba(196,18,47,0.12) 42%, transparent 70%)",
            }}
            animate={{ opacity: [0.35, 0.75, 0.45, 0.7, 0.35], scale: [0.92, 1.08, 0.98, 1.05, 0.92] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute inset-x-[-8%] bottom-[-8%] top-14 xl:top-16"
            animate={{
              scale: [1.06, 1.12, 1.08, 1.14, 1.06],
              x: [0, -14, 6, -8, 0],
              y: [0, 8, -4, 10, 0],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.hero}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.hero}
                  alt={active.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: active.focus }}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Soft light sweep — faint so it does not stripe faces */}
          <motion.div
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background:
                "linear-gradient(115deg, transparent 36%, rgba(255,255,255,0.05) 50%, transparent 64%)",
            }}
            animate={{ x: ["-35%", "45%", "-35%"] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Face-safe mid zone: scrims only at top (strip) and bottom (brand) */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.15) 12%, transparent 22%, transparent 58%, rgba(5,5,5,0.55) 78%, rgba(5,5,5,0.94) 100%)",
            }}
          />

          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className="pointer-events-none absolute rounded-full bg-[#C4122F]"
              style={{
                left: p.left,
                bottom: "-4%",
                width: p.size,
                height: p.size,
                boxShadow: "0 0 6px rgba(196,18,47,0.45)",
              }}
              animate={{
                y: [0, -820],
                x: [0, (p.id % 2 === 0 ? 1 : -1) * (10 + p.id * 2)],
                opacity: [0, 0.55, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Cast strip at TOP — never across the face mid-zone */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-center gap-2 px-6 py-5 xl:gap-3 xl:px-8 xl:py-6">
            <button
              type="button"
              aria-label="Previous hero"
              onClick={() =>
                selectSlide((heroIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length, true)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 bg-black/55 text-lg text-white backdrop-blur-sm transition hover:border-[#C4122F] hover:text-[#C4122F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4122F]"
            >
              ‹
            </button>
            <div className="flex items-end justify-center gap-1.5 xl:gap-2">
              {HERO_SLIDES.map((slide, i) => {
                const selected = heroIndex === i;
                return (
                  <button
                    key={slide.hero}
                    type="button"
                    aria-label={`Show ${slide.name}`}
                    aria-pressed={selected}
                    onClick={() => selectSlide(i, true)}
                    className="group relative block overflow-hidden border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4122F]"
                    style={{
                      width: selected ? 48 : 36,
                      height: selected ? 60 : 46,
                      borderColor: selected ? "#C4122F" : "rgba(255,255,255,0.2)",
                      boxShadow: selected ? "0 0 0 1px rgba(196,18,47,0.5)" : "none",
                      flex: "none",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.hero}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: slide.focus }}
                      draggable={false}
                    />
                    <span
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: selected
                          ? "transparent"
                          : "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label="Next hero"
              onClick={() => selectSlide((heroIndex + 1) % HERO_SLIDES.length, true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 bg-black/55 text-lg text-white backdrop-blur-sm transition hover:border-[#C4122F] hover:text-[#C4122F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4122F]"
            >
              ›
            </button>
          </div>

          {/* Brand only at bottom — compact so it stays in the gradient, not the face */}
          <div className="absolute inset-x-0 bottom-0 z-20 px-8 pb-8 pt-16 xl:px-10 xl:pb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#C4122F]">
              Red Cherry Interactive
            </p>
            <h1 className="mt-2 font-display text-5xl font-extrabold leading-[0.9] tracking-[-0.05em] xl:text-6xl">
              CHERRY
              <br />
              <span className="text-[#C4122F]">OPS</span>
            </h1>
            <p className="mt-3 max-w-sm text-xs text-white/45 xl:text-sm">
              {active.name} · {active.label}
            </p>
          </div>
        </section>

        {/* Right: compact form */}
        <section className="relative flex h-full min-h-0 flex-col justify-center overflow-hidden px-6 py-6 sm:px-10 lg:border-l lg:border-white/10 lg:px-12">
          <div className="mb-4 shrink-0 lg:hidden">
            {/* Mobile: show active hero including team wallpaper */}
            <div className="relative mb-4 h-36 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.hero}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: active.focus }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </div>
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

            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <p className="mb-2 shrink-0 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
                Demo access
              </p>
              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1">
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
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={role.hero}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ objectPosition: role.focus }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-white sm:text-sm">
                        {role.name}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40">
                        {role.label}
                      </div>
                      {email === role.email && (
                        <div className="mt-1.5 space-y-0.5 border-t border-white/10 pt-1.5">
                          <p className="truncate font-mono text-[10px] text-white/70">
                            {role.email}
                          </p>
                          <p className="truncate font-mono text-[10px] text-white/55">
                            {role.password}
                          </p>
                        </div>
                      )}
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
