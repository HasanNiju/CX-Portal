import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/activate"];
const ADMIN_PATHS = ["/admin"];
const SUPER_ADMIN_PATHS = ["/admin/super"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Role checks — this is a UX shortcut only. The real enforcement
  // is Postgres RLS + role checks inside each server action /
  // route handler, since headers/cookies can't be trusted alone.
  if (user && (path.startsWith("/admin"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .single();

    if (!profile || profile.status !== "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
    if (profile.role === "agent") {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
    if (SUPER_ADMIN_PATHS.some((p) => path.startsWith(p)) && profile.role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
