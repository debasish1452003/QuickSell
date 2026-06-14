import type { TaskNode } from "@/domain/workflow/TaskNode";

export class SpatialIndex {
  private readonly cells = new Map<string, string[]>();

  public constructor(private readonly cellSize = 180) {}

  public build(nodes: TaskNode[]): void {
    this.cells.clear();
    nodes.forEach((node) => {
      const key = this.getKey(node.position.x, node.position.y);
      const bucket = this.cells.get(key) ?? [];
      bucket.push(node.id);
      this.cells.set(key, bucket);
    });
  }

  public query(bounds: { minX: number; maxX: number; minY: number; maxY: number }): Set<string> {
    const ids = new Set<string>();
    const minX = Math.floor(bounds.minX / this.cellSize);
    const maxX = Math.floor(bounds.maxX / this.cellSize);
    const minY = Math.floor(bounds.minY / this.cellSize);
    const maxY = Math.floor(bounds.maxY / this.cellSize);

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        this.cells.get(`${x}:${y}`)?.forEach((id) => ids.add(id));
      }
    }

    return ids;
  }

  private getKey(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
  }
}
