export default function AdminLoading() {
  return (
    <div className="animate-pulse dark-scope">
      <div className="h-3 w-24 rounded bg-navy-surface mb-3" />
      <div className="h-8 w-64 rounded bg-navy-surface mb-2" />
      <div className="h-4 w-80 max-w-full rounded bg-navy-surface mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-card border border-navy-line bg-navy-surface p-5">
            <div className="h-8 w-16 rounded bg-navy mb-2" />
            <div className="h-3 w-24 rounded bg-navy" />
          </div>
        ))}
      </div>
    </div>
  );
}
