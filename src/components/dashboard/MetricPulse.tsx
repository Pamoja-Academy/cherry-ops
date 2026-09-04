"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Radio,
  Bot,
  Target,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Radio,
  Bot,
  Target,
};

interface MetricPulseProps {
  label: string;
  value: string;
  iconName: keyof typeof ICONS;
  color: string;
  subtitle?: string;
  urgent?: boolean;
}

export function MetricPulse({
  label,
  value,
  iconName,
  color,
  subtitle,
  urgent,
}: MetricPulseProps) {
  const Icon = ICONS[iconName] ?? Target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative group overflow-hidden border border-white/10 bg-[#111] p-6"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      {urgent && (
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="absolute inset-0"
          style={{ background: `${color}18` }}
        />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            {label}
          </p>
          <p
            className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-2 text-xs font-medium" style={{ color }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center border border-white/10 bg-black/40"
          style={{ color }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}
