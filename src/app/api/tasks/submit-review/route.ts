import { projectRepository } from "@/data/ProjectRepository";
import { getRequestSession } from "@/lib/RequestSession";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (session.role !== "employee") {
    return NextResponse.json({ error: "Only employees can submit work for review." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const taskId = String(body.taskId ?? "");
  const employeeId = session.userId;
  if (!taskId || !employeeId) {
    return NextResponse.json({ error: "taskId and employeeId are required." }, { status: 400 });
  }
  const submission = projectRepository.submitTaskForReview(taskId, employeeId, String(body.notes ?? "Submitted for employer review."));
  return NextResponse.json({ submission }, { status: 201 });
}
