import { projectRepository } from "@/data/ProjectRepository";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const taskId = String(body.taskId ?? "");
  const employeeId = String(body.employeeId ?? "");
  if (!taskId || !employeeId) {
    return NextResponse.json({ error: "taskId and employeeId are required." }, { status: 400 });
  }
  const submission = projectRepository.submitTaskForReview(taskId, employeeId, String(body.notes ?? "Submitted for employer review."));
  return NextResponse.json({ submission }, { status: 201 });
}
