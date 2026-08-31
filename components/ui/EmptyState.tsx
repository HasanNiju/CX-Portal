export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-card border border-dashed border-line bg-surface/60">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description && <p className="mt-1.5 text-sm text-ink-soft max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
