import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { activity_events, event_tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

const STATUSES = ["todo", "in_progress", "done"] as const;

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const taskId = parseInt(id, 10);
  if (Number.isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await db.select().from(event_tasks).where(eq(event_tasks.id, taskId)).get();
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json()) as { status?: (typeof STATUSES)[number] };
  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "status must be todo, in_progress, or done" }, { status: 400 });
  }

  const [updated] = await db
    .update(event_tasks)
    .set({
      status: body.status,
      completed_at: body.status === "done" ? new Date().toISOString() : null,
    })
    .where(eq(event_tasks.id, taskId))
    .returning();

  await db.insert(activity_events).values({
    entity_type: "event_task",
    entity_id: taskId,
    type: "task_status_change",
    description: `Task "${updated.title}" → ${updated.status}`,
    actor_id: parseInt(session.user.id, 10),
  });

  return NextResponse.json({ success: true, task: updated });
}
