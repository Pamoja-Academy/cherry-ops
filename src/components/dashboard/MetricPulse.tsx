"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  Briefcase,
  TriangleAlert,
  Radio,
  Bot,
  Target,
  type LucideIcon,
} from "lucide-react";

// Server Components can't pass component references across the boundary,
// so icons are selected by name and resolved client-side.
const ICONS = {
  "trending-up": TrendingUp,
  briefcase: Briefcase,
  alert: TriangleAlert,
  radio: Radio,
  bot: Bot,
  target: Target,
} satisfies Record<string, LucideIcon>;

export type MetricIcon = keyof typeof ICONS;

interface MetricPulseProps {
  label: string;
  value: string;
  icon: MetricIcon;
  color: string;
  bg: string;
  subtitle?: string;
  urgent?: boolean;
  href?: string;
}

export function MetricPulse({ label, value, icon, color, bg, subtitle, urgent, href }: MetricPulseProps) {
  const Icon = ICONS[icon];
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(26,18,20,0.12)" }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-5 border relative overflow-hidden h-full"
      style={{ background: "#fff", borderColor: "#E4D8D1" }}
    >
      {urgent && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ border: `1px solid ${color}` }}
        />
      )}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon style={{ color, width: 18, height: 18 }} />
        </div>
      </div>
      <div className="font-display text-2xl font-bold mb-0.5" style={{ color: "#1A1214" }}>
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#8C8078" }}>
        {label}
      </div>
      {subtitle && (
        <div className="text-xs" style={{ color }}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );

  return href ? (
    <Link href={href} className="block h-full" aria-label={`${label}: ${value}`}>
      {card}
    </Link>
  ) : (
    card
  );
}
