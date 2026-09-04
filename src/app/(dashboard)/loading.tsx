export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-lg" style={{ background: "#F3EBE7" }} />
        <div className="h-4 w-32 rounded-lg" style={{ background: "#F3EBE7" }} />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-5 h-32"
            style={{ background: "#fff", borderColor: "#E4D8D1" }}
          >
            <div className="h-9 w-9 rounded-lg mb-3" style={{ background: "#F3EBE7" }} />
            <div className="h-6 w-20 rounded mb-2" style={{ background: "#F3EBE7" }} />
            <div className="h-3 w-28 rounded" style={{ background: "#F3EBE7" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
