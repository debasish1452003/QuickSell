import { SESSION_COOKIE } from "@/lib/SessionCookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.get(SESSION_COOKIE)?.value) redirect("/login?next=/dashboard");
  return children;
}
