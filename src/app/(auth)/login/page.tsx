"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const DEMO_ROLES = [
  { label: "CEO", email: "pheladi@redcherry.demo", password: "cherry-ceo-2026", initials: "PM", name: "Pheladi Mphahlele" },
  { label: "Creative Director", email: "creative@redcherry.demo", password: "cherry-cd-2026", initials: "TN", name: "Thabo Nkosi" },
  { label: "Production", email: "production@redcherry.demo", password: "cherry-prod-2026", initials: "LD", name: "Lerato Dlamini" },
  { label: "Media", email: "media@redcherry.demo", password: "cherry-media-2026", initials: "SM", name: "Sipho Molefe" },
  { label: "Finance", email: "finance@redcherry.demo", password: "cherry-fin-2026", initials: "ZK", name: "Zanele Khumalo" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingInRole, setSigningInRole] = useState<string | null>(null);
  const router = useRouter();

  async function doSignIn(e: string, p: string) {
    const result = await signIn("credentials", {
      email: e,
      password: p,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      return false;
    }
    router.push("/");
    router.refresh();
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    await doSignIn(email, password);
    setLoading(false);
  }

  async function quickSignIn(role: (typeof DEMO_ROLES)[0]) {
    setEmail(role.email);
    setPassword(role.password);
    setError("");
    setSigningInRole(role.email);
    await doSignIn(role.email, role.password);
    setSigningInRole(null);
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Left: full-bleed hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7A0B22 0%, #C4122F 45%, #9E0E26 100%)",
        }}
      >
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />
        {/* Top wordmark */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">●</span>
              </div>
              <span className="text-white/80 text-sm font-medium tracking-widest uppercase">Red Cherry Interactive</span>
            </div>
          </motion.div>
        </div>
        {/* Center hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="relative z-10"
        >
          <h1 className="font-display text-6xl xl:text-7xl font-bold text-white leading-none mb-4">
            Cherry<br />Ops
          </h1>
          <p className="text-white/70 text-lg font-light leading-relaxed max-w-xs">
            Red Cherry Interactive&rsquo;s Agency Operating System. Built for 30 years of excellence.
          </p>
        </motion.div>
        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="relative z-10"
        >
          <p className="text-white/40 text-xs tracking-wider uppercase">
            Strategy · Creative · Media · Production · PR
          </p>
        </motion.div>
      </motion.div>

      {/* Right: login form */}
      <div
        className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16"
        style={{ background: "#FBF6F2" }}
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-md mx-auto w-full"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <h1 className="font-display text-4xl font-bold text-cherry" style={{ color: "#C4122F" }}>Cherry Ops</h1>
            <p className="text-sm text-muted mt-1" style={{ color: "#8C8078" }}>Red Cherry Interactive</p>
          </div>

          <h2 className="font-display text-3xl font-bold mb-2" style={{ color: "#1A1214" }}>
            Welcome back
          </h2>
          <p className="mb-8 text-sm" style={{ color: "#8C8078" }}>
            Sign in to your agency workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8C8078" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@redcherry.co.za"
                className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: "#fff",
                  border: "1px solid #E4D8D1",
                  color: "#1A1214",
                  "--tw-ring-color": "#C4122F",
                } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8C8078" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: "#fff",
                  border: "1px solid #E4D8D1",
                  color: "#1A1214",
                  "--tw-ring-color": "#C4122F",
                } as React.CSSProperties}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm px-3 py-2 rounded-lg"
                style={{ background: "#FCE8EC", color: "#C4122F" }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #C4122F, #9E0E26)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo role cards — one-click sign in */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#8C8078" }}>
              Demo Access — click to sign in
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ROLES.map((role) => (
                <motion.button
                  key={role.email}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => quickSignIn(role)}
                  disabled={signingInRole !== null || loading}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all hover:border-cherry cursor-pointer disabled:opacity-70"
                  style={{
                    background: "#fff",
                    border: email === role.email ? "1px solid #C4122F" : "1px solid #E4D8D1",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: email === role.email ? "#C4122F" : "#8C8078" }}
                  >
                    {signingInRole === role.email ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      role.initials
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold" style={{ color: "#1A1214" }}>{role.name}</div>
                    <div className="text-xs" style={{ color: "#8C8078" }}>{role.label}</div>
                  </div>
                  {signingInRole === role.email && (
                    <span className="text-xs font-medium" style={{ color: "#C4122F" }}>Signing in…</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
