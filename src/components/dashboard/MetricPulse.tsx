"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface MetricPulseProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  subtitle?: string;
  urgent?: boolean;
}

export function MetricPulse({ label, value, icon: Icon, color, bg, subtitle, urgent }: MetricPulseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(26,18,20,0.12)" }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-5 border relative overflow-hidden"
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
          <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
        </div>
      </div>
      <div className="text-2xl font-bold mb-0.5" style={{ color: "#1A1214", fontFamily: "inherit" }}>
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
}
