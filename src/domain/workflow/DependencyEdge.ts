import type { DependencyEdgeInput } from "./types";

export class DependencyEdge {
  public readonly id: string;
  public readonly from: string;
  public readonly to: string;
  public readonly lagHours: number;
  public readonly kind: NonNullable<DependencyEdgeInput["kind"]>;

  public constructor(input: DependencyEdgeInput) {
    this.from = input.from;
    this.to = input.to;
    this.lagHours = input.lagHours ?? 0;
    this.kind = input.kind ?? "finish_to_start";
    this.id = `${this.from}->${this.to}`;
  }
}
