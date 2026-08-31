import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Enable/disable an existing account, or change its role. Server-side
// role checks mirror create-user — never trust the client's claim.
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: callerProfile } = await supabase.from("profiles").select("role,status").eq("id", user.id).single();
  if (!callerProfile || callerProfile.status !== "active" || callerProfile.role === "agent") {
    return NextResponse.json({ error: "You don't have permission to do that." }, { status: 403 });
  }

  const { userId, status, role } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing user." }, { status: 400 });

  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("role").eq("id", userId).single();
  if (!target) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  if (target.role === "super_admin") {
    return NextResponse.json({ error: "Super Admin accounts can't be modified here." }, { status: 403 });
  }
  if (target.role === "admin" && callerProfile.role !== "super_admin") {
    return NextResponse.json({ error: "Only a Super Admin can manage Admin accounts." }, { status: 403 });
  }
  if (role === "admin" && callerProfile.role !== "super_admin") {
    return NextResponse.json({ error: "Only a Super Admin can promote to Admin." }, { status: 403 });
  }
  if (role === "super_admin") {
    return NextResponse.json({ error: "Super Admin can't be assigned through this flow." }, { status: 403 });
  }

  const patch: Record<string, string> = {};
  if (status) patch.status = status;
  if (role) patch.role = role;

  const { error } = await admin.from("profiles").update(patch).eq("id", userId);
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 400 });

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: `Updated account ${userId}: ${JSON.stringify(patch)}`,
    entity_type: "profile",
    entity_id: userId,
  });

  return NextResponse.json({ ok: true });
}
