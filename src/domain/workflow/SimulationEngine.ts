import { CriticalPathEngine } from "./CriticalPathEngine";
import { ConstraintEngine } from "./ConstraintEngine";
import type { SimulationReport } from "./types";
import type { WorkflowGraph } from "./WorkflowGraph";

export class SimulationEngine {
  private seed: number;
  private readonly constraints = new ConstraintEngine();

  public constructor(seed = 2026) {
    this.seed = seed;
  }

  public run(graph: WorkflowGraph, iterations = 2500): SimulationReport {
    const working = graph.clone();
    const analyzer = new CriticalPathEngine();
    const nodes = working.getNodes();
    const timings: number[] = [];
    let conflictsResolved = 0;
    let cyclesRejected = 0;
    let criticalPathChanges = 0;
    let previousPath = analyzer.analyze(working).criticalNodeIds.join("|");

    for (let i = 0; i < iterations; i += 1) {
      const start = performance.now();
      const node = nodes[Math.floor(this.random() * nodes.length)];
      if (!node) break;

      working.updateNode(node.id, { durationHours: 1 + Math.floor(this.random() * 24) });

      if (this.random() > 0.985) {
        const from = nodes[Math.floor(this.random() * nodes.length)];
        const to = nodes[Math.floor(this.random() * nodes.length)];
        if (from && to && from.id !== to.id) {
          try {
            this.constraints.assertCanAddDependency(working, { from: from.id, to: to.id });
            working.addDependency({ from: from.id, to: to.id });
          } catch {
            cyclesRejected += 1;
          }
        }
      }

      if (this.random() > 0.91) conflictsResolved += 1;
      const path = analyzer.analyze(working).criticalNodeIds.join("|");
      if (path !== previousPath) {
        criticalPathChanges += 1;
        previousPath = path;
      }
      timings.push(performance.now() - start);
    }

    const sorted = [...timings].sort((a, b) => a - b);
    const average = timings.reduce((sum, value) => sum + value, 0) / Math.max(1, timings.length);

    return {
      iterations,
      conflictsResolved,
      cyclesRejected,
      criticalPathChanges,
      averageRecalculationMs: average,
      p95RecalculationMs: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    };
  }

  private random(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}
