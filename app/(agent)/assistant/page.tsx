import { AssistantWorkspace } from "./AssistantWorkspace";

export default function AssistantPage({ searchParams }: { searchParams: { preset?: string } }) {
  return (
    <div className="animate-fade-up flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-6.5rem)] -mb-8">
      <div className="mb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">AI Assistant</p>
        <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">Ask the assistant</h1>
      </div>
      <AssistantWorkspace presetId={searchParams?.preset} />
    </div>
  );
}
