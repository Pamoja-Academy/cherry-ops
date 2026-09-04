import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FBF6F2" }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold"
          style={{ background: "linear-gradient(135deg, #C4122F, #7A0B22)" }}
        >
          ●
        </div>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "#1A1214" }}>
          Page not found
        </h1>
        <p className="text-sm mb-8" style={{ color: "#8C8078" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #C4122F, #9E0E26)" }}
        >
          Back to Cherry Ops
        </Link>
      </div>
    </div>
  );
}
