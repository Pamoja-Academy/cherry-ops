"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-24">
      <div
        className="rounded-xl border p-8 max-w-md text-center"
        style={{ background: "#fff", borderColor: "#E4D8D1" }}
      >
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: "#FCE8EC" }}
        >
          <TriangleAlert className="w-5 h-5" style={{ color: "#C4122F" }} />
        </div>
        <h2 className="font-display text-xl font-bold mb-2" style={{ color: "#1A1214" }}>
          Something went wrong
        </h2>
        <p className="text-sm mb-6" style={{ color: "#8C8078" }}>
          This view failed to load. Your data is safe — try again.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #C4122F, #9E0E26)" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
