import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { autopilot_actions, activity_events, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";

const APPROVER_ROLES = new Set(["CEO", "FINANCE"]);

// Approving a risky action executes its real-world effect under guardrails.
async function executeApprovedAction(action: typeof autopilot_actions.$inferSelect) {
  if (action.type === "mark_job_complete" && action.entity_type === "job" && action.entity_id) {
    await db.update(jobs).set({ stage: "complete" }).where(eq(jobs.id, action.entity_id));
  }
  if (action.type === "send_invoice_reminder" && action.entity_type === "invoice" && action.entity_id) {
    await db.insert(activity_events).values({
      entity_type: "invoice",
      entity_id: action.entity_id,
      type: "invoice_reminder_sent",
      description: `📧 Overdue reminder queued for delivery (approved via Autopilot)`,
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!APPROVER_ROLES.has(session.user.role)) {
    return NextResponse.json(
      { success: false, error: "Only CEO or Finance can resolve autopilot actions" },
      { status: 403 }
    );
  }

  let body: { id?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const id = Number(body.id);
  const status = body.status;
  if (!Number.isInteger(id) || (status !== "approved" && status !== "rejected")) {
    return NextResponse.json(
      { success: false, error: "Expected { id: number, status: 'approved' | 'rejected' }" },
      { status: 400 }
    );
  }

  const action = await db.select().from(autopilot_actions).where(eq(autopilot_actions.id, id)).get();
  if (!action) {
    return NextResponse.json({ success: false, error: "Action not found" }, { status: 404 });
  }
  if (action.status !== "pending") {
    return NextResponse.json(
      { success: false, error: `Action already ${action.status}` },
      { status: 409 }
    );
  }

  try {
    if (status === "approved") {
      await executeApprovedAction(action);
    }

    await db
      .update(autopilot_actions)
      .set({
        status,
        resolved_at: new Date().toISOString(),
        resolved_by_id: Number(session.user.id),
      })
      .where(eq(autopilot_actions.id, id));

    await db.insert(activity_events).values({
      entity_type: action.entity_type ?? "autopilot",
      entity_id: action.entity_id,
      type: status === "approved" ? "autopilot_approved" : "autopilot_rejected",
      description: `🤖 Autopilot: "${action.title}" ${status} by ${session.user.name}`,
      actor_id: Number(session.user.id),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Autopilot resolve error:", error);
    return NextResponse.json({ success: false, error: "Failed to resolve action" }, { status: 500 });
  }
}
