"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${4 + ((i * 13) % 92)}%`,
  delay: i * 0.28,
  duration: 8 + (i % 6),
  size: 2 + (i % 5),
}));

const NEW_WORK = [
  {
    client: "Tiger Brands",
    title: "Jelly Tots — most loved",
    line: "Animated TVC voted 6th most loved ad in South Africa.",
  },
  {
    client: "FNB",
    title: "Smart Rewards Ride Show",
    line: "100k entries · 81% conversion lift in season two.",
  },
  {
    client: "Old Mutual",
    title: "Savings & Investments",
    line: "Radio & TV — conversion from 23% to 40%+ in 13 days.",
  },
  {
    client: "Tru-Cape",
    title: "Takeaways from Nature",
    line: "Digital campaign · page following up 256%.",
  },
];

const SERVICES = [
  "Strategy",
  "Creative",
  "Media",
  "Production",
  "Digital",
  "PR",
  "Activations",
  "Studios",
];

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section
        ref={heroRef}
        className="relative h-[100svh] min-h-[640px] w-full overflow-hidden"
      >
        <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0">
          <motion.div style={{ scale: heroScale }} className="absolute inset-0">
            <motion.div
              className="absolute inset-[-10%]"
              animate={{
                scale: [1, 1.1, 1.04],
                x: [0, -28, -12],
                y: [0, 14, 6],
              }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/hero/cherry-ops-hero.png"
                alt="Red Cherry Interactive"
                fill
                priority
                unoptimized
                className="object-cover object-[58%_12%]"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,5,5,0.35) 0%, transparent 28%, transparent 48%, rgba(5,5,5,0.75) 78%, #050505 100%), radial-gradient(ellipse 55% 45% at 75% 25%, rgba(196,18,47,0.28), transparent 60%)",
            }}
          />

          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className="pointer-events-none absolute bg-[#C4122F]"
              style={{
                left: p.left,
                bottom: "-5%",
                width: p.size,
                height: p.size * 1.8,
                opacity: 0.5,
              }}
              animate={{
                y: [0, -900],
                x: [0, (p.id % 2 === 0 ? 1 : -1) * (10 + p.id * 3)],
                opacity: [0, 0.75, 0],
                rotate: [0, 50 + p.id * 6],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </motion.div>

        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/80 sm:text-[11px]">
            Red Cherry Interactive
          </p>
          <Link
            href="/login"
            className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55 transition hover:text-white"
          >
            Enter
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-14 sm:px-10 sm:pb-16 lg:px-14 lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="max-w-4xl font-display text-[14vw] font-extrabold leading-[0.82] tracking-[-0.055em] sm:text-[10vw] lg:text-[7.5rem]">
              CHERRY
              <br />
              <span className="text-[#C4122F]">OPS</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
              The agency operating system — briefs that sell, work that lands, private-sector growth.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="bg-[#C4122F] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#9E0E26]"
              >
                Enter workspace
              </Link>
              <a
                href="#new-work"
                className="border border-white/25 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/60 hover:text-white"
              >
                New work
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="new-work" className="border-t border-white/10 px-6 py-24 sm:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#C4122F]">
            New Work
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Content that connects.
            <br />
            Results that sell.
          </h2>
        </motion.div>

        <div className="mt-16 divide-y divide-white/10 border-y border-white/10">
          {NEW_WORK.map((w, i) => (
            <motion.article
              key={w.client}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group grid gap-3 py-10 sm:grid-cols-[minmax(0,180px)_1fr] sm:gap-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition group-hover:text-[#C4122F]">
                {w.client}
              </p>
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {w.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
                  {w.line}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden border-t border-white/10 py-16">
        <p className="px-6 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/35 sm:px-10 lg:px-14">
          Full service
        </p>
        <motion.div
          className="mt-8 flex gap-10 whitespace-nowrap px-6 sm:px-10 lg:px-14"
          animate={{ x: [0, -600] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {[...SERVICES, ...SERVICES, ...SERVICES].map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="font-display text-4xl font-bold tracking-tight text-white/20 sm:text-5xl"
            >
              {s}
              <span className="mx-8 text-[#C4122F]">·</span>
            </span>
          ))}
        </motion.div>
      </section>

      <section className="border-t border-white/10 px-6 py-28 text-center sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Run the agency.
            <br />
            <span className="text-[#C4122F]">Win the brief.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm text-white/50">
            Clients · activations · scheduling · production · media · invoices · private-sector pipeline — one OS.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-block bg-[#C4122F] px-10 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#9E0E26]"
          >
            Enter Cherry Ops
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-[10px] uppercase tracking-[0.25em] text-white/30 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Red Cherry Interactive · Rivonia, Sandton</span>
          <span>+27 11 807 2531 · info@redcherry.co.za</span>
        </div>
      </footer>
    </div>
  );
}
