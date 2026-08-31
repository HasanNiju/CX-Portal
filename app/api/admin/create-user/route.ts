import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Privileged account creation. Runs server-side only, using the
// service-role key — never exposed to the browser. Re-checks the
// caller's role from the database (never trusts the client) and
// enforces the privilege ladder: Admin can only create Agents,
// Super Admin can create Agents or Admins. Nobody can create a
// Super Admin through this route.
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: callerProfile } = await supabase.from("profiles").select("role,status").eq("id", user.id).single();
  if (!callerProfile || callerProfile.status !== "active" || callerProfile.role === "agent") {
    return NextResponse.json({ error: "You don't have permission to create accounts." }, { status: 403 });
  }

  const { fullName, email, role } = await req.json();
  if (!fullName || !email || !role) {
    return NextResponse.json({ error: "Name, email, and role are required." }, { status: 400 });
  }
  if (role === "super_admin") {
    return NextResponse.json({ error: "Super Admin accounts can't be created through this flow." }, { status: 403 });
  }
  if (role === "admin" && callerProfile.role !== "super_admin") {
    return NextResponse.json({ error: "Only a Super Admin can create Admin accounts." }, { status: 403 });
  }
  if (!["agent", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Create the auth user with a temporary password and require them
  // to set their own on first sign-in via a password recovery link.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createErr || !created?.user) {
    return NextResponse.json({ error: createErr?.message || "Couldn't create the account." }, { status: 400 });
  }

  const { error: profileErr } = await admin.from("profiles").upsert({
    id: created.user.id,
    full_name: fullName,
    email,
    role,
    status: "",
  });
  if (profileErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "Couldn't set up the profile. Try again." }, { status: 400 });
  }

  const { data: link } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
  });

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: `Created ${role} account for ${email}`,
    entity_type: "profile",
    entity_id: created.user.id,
  });

  return NextResponse.json({ ok: true, actionLink: link?.properties?.action_link || null });
}
