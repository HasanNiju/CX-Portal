import { redirect } from "next/navigation";

// Middleware guarantees a session exists by the time this renders
// (unauthenticated requests are redirected to /login already).
export default function RootPage() {
  redirect("/home");
}
