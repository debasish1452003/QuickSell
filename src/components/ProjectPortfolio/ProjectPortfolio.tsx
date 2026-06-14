import type { NexusProject } from "@/data/nexusDemoRepository";
import "./ProjectPortfolio.css";

export function ProjectPortfolio({ projects }: { projects: NexusProject[] }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <h2>Portfolio</h2>
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
            <small>Release {project.releaseDate}</small>
          </section>
        ))}
      </div>
    </article>
  );
}
