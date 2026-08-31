"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Profile } from "@/lib/supabase/types";

export function AgentsTable({ initialProfiles, canCreateAdmin }: { initialProfiles: Profile[]; canCreateAdmin: boolean }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"agent" | "admin">("agent");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const toast = useToast();

  const statusTone = (s: string) => (s === "active" ? "good" : s === "pending" ? "warn" : "bad");

  const createAccount = async () => {
    if (!name.trim() || !email.trim()) { setFormError("Name and email are required."); return; }
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName: name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Couldn't create the account."); return; }
      toast(`${role === "admin" ? "Admin" : "Agent"} invited.`);
      setProfiles((p) => [
        { id: crypto.randomUUID(), full_name: name, email, role, status: "pending", avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_login_at: null },
        ...p,
      ]);
      setShowForm(false); setName(""); setEmail(""); setRole("agent");
    } catch {
      setFormError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (p: Profile) => {
    const nextStatus = p.status === "active" ? "disabled" : "active";
    const res = await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: p.id, status: nextStatus }),
    });
    if (res.ok) {
      setProfiles((list) => list.map((x) => (x.id === p.id ? { ...x, status: nextStatus } : x)));
      toast(nextStatus === "active" ? "Account enabled." : "Account disabled.");
    } else {
      toast("Couldn't update that account.", "bad");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "Add account"}</Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-card border border-navy-line bg-navy-surface p-5 animate-fade-up">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
              className="focus-ring rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink placeholder:text-navy-ink-soft/60"
            />
            <input
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
              className="focus-ring rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink placeholder:text-navy-ink-soft/60"
            />
            {canCreateAdmin ? (
              <select
                value={role} onChange={(e) => setRole(e.target.value as "agent" | "admin")}
                className="focus-ring rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink"
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <div className="flex items-center text-sm text-navy-ink-soft">Role: Agent</div>
            )}
          </div>
          {formError && <p className="mt-3 text-sm text-brand">{formError}</p>}
          <Button onClick={createAccount} disabled={busy} className="mt-4">
            {busy ? "Creating…" : "Send invite"}
          </Button>
        </div>
      )}

      <div className="rounded-card border border-navy-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-line text-left text-xs uppercase tracking-wide text-navy-ink-soft">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-line">
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-navy-ink font-medium">{p.full_name}</td>
                <td className="px-4 py-3 text-navy-ink-soft hidden sm:table-cell">{p.email}</td>
                <td className="px-4 py-3 capitalize text-navy-ink-soft">{p.role}</td>
                <td className="px-4 py-3"><Badge tone={statusTone(p.status) as any}>{p.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleStatus(p)}
                    className="focus-ring text-xs font-semibold text-brand hover:text-brand-deep"
                  >
                    {p.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-navy-ink-soft">No accounts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
