import { ArrowRight, BarChart3, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell/AppShell";
import { HeroGraph } from "@/components/HeroGraph/HeroGraph";

export default function Home() {
  return (
    <AppShell>
      <main className="landing-page">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Project intelligence for graph-shaped work</p>
            <h1>NexusDAG</h1>
            <p>
              Plan dependencies, track task reviews, spot delays, and give clients a clean live view of progress from one
              typed workflow command center.
            </p>
            <div className="hero-actions">
              <Link className="primary-action" href="/login">Open demo dashboard <ArrowRight size={17} /></Link>
              <Link className="secondary-action" href="/signup">Create demo account</Link>
            </div>
            <div className="hero-stats">
              <span><CheckCircle2 size={16} /> Role-aware delivery views</span>
              <span><Clock3 size={16} /> Delay and overdue analysis</span>
              <span><ShieldCheck size={16} /> Client-safe reporting</span>
            </div>
          </div>
          <div className="hero-visual">
            <HeroGraph />
          </div>
        </section>
        <section className="feature-band">
          {[
            ["Critical Path", "See dependency chains, slack, and project duration before risk becomes surprise."],
            ["Review Queue", "Employees submit tasks, employers review, and clients see approved progress."],
            ["Portfolio Health", "Track blocked work, delayed-by time, budget use, and release confidence."],
          ].map(([title, body]) => (
            <article key={title}>
              <BarChart3 size={20} />
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
