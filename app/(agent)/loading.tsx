export default function AgentLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-24 rounded bg-sunken mb-3" />
      <div className="h-8 w-72 rounded bg-sunken mb-2" />
      <div className="h-4 w-96 max-w-full rounded bg-sunken mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-card border border-line bg-surface p-5">
            <div className="h-9 w-9 rounded-xl bg-sunken mb-4" />
            <div className="h-5 w-32 rounded bg-sunken mb-2" />
            <div className="h-3 w-full rounded bg-sunken mb-1.5" />
            <div className="h-3 w-2/3 rounded bg-sunken" />
          </div>
        ))}
      </div>
    </div>
  );
}
