import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-3">404</p>
      <h1 className="font-display text-2xl font-semibold text-ink">That page doesn't exist</h1>
      <p className="mt-2 text-ink-soft max-w-sm">It may have moved, or the link might be out of date.</p>
      <Link href="/home" className="mt-6"><Button>Back to workspace</Button></Link>
    </div>
  );
}
