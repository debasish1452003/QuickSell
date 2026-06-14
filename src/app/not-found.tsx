import { Home, LogIn } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <main className="not-found-page">
        <section className="panel not-found-card">
          <p className="eyebrow">404 not found</p>
          <h1>That page does not exist.</h1>
          <p>
            The URL may be wrong, or the workspace route may have moved. Protected workspace data is available only after
            sign in.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/">
              <Home size={17} />
              Go home
            </Link>
            <Link className="secondary-action" href="/login">
              <LogIn size={17} />
              Sign in
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
