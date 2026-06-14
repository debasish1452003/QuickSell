import type { NexusProject } from "@/data/nexusDemoRepository";
import type { PortfolioAnalytics } from "@/domain/workflow/ProjectAnalyticsEngine";
import "./ProjectPortfolio.css";

export function ProjectPortfolio({ projects, analytics }: { projects: NexusProject[]; analytics: PortfolioAnalytics }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <h2>Portfolio</h2>
        <span className="portfolio-health" data-health={analytics.health}>{analytics.health.replace("_", " ")}</span>
      </div>
      <div className="portfolio-list">
        {projects.map((project) => (
          <section className="portfolio-item" key={project.id}>
            <div>
              <h3>{project.name}</h3>
              <p>{project.client}</p>
            </div>
            <span data-health={project.health}>{project.health.replace("_", " ")}</span>
            <div className="budget-bar" aria-label={`${project.budgetUsed}% budget used`}>
              <div style={{ width: `${project.budgetUsed}%` }} />
            </div>
            <small>{analytics.completionRate}% complete - {analytics.delayedTasks} delayed tasks</small>
            <small>Release {project.releaseDate}</small>
          </section>
        ))}
      </div>
    </article>
  );
}
