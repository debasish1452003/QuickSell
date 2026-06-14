"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/AppShell/AppShell";

export default function SignOutPage() {
  useEffect(() => {
    window.localStorage.removeItem("nexusdag-role");
    window.localStorage.removeItem("nexusdag-user");
    window.location.replace("/api/auth/logout");
  }, []);

  return (
    <AppShell>
      <main className="loading-state">Signing you out...</main>
    </AppShell>
  );
}
