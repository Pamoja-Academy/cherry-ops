import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { autopilot_actions, activity_events, jobs, invoices, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

const APPROVER_ROLES = new Set(["CEO", "FINANCE"]);

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Action = typeof autopilot_actions.$inferSelect;

// Approving a risky action executes its real-world effect under guardrails.
// Sync calls only — better-sqlite3 transactions cannot be async.
function executeApprovedAction(tx: Tx, action: Action) {
  const today = new Date().toISOString().split("T")[0];

  if (action.type === "mark_job_complete" && action.entity_type === "job" && action.entity_id) {
    tx.update(jobs).set({ stage: "complete" }).where(eq(jobs.id, action.entity_id)).run();
    return;
  }

  if (action.entity_type !== "invoice" || !action.entity_id) return;
  const invoice = tx.select().from(invoices).where(eq(invoices.id, action.entity_id)).get();
  if (!invoice) return;

  if (action.type === "send_invoice_reminder") {
    tx.insert(activity_events).values({
      entity_type: "invoice",
      entity_id: invoice.id,
      type: "invoice_reminder_sent",
      description: `📧 Overdue reminder for ${invoice.number} queued for delivery (approved via Autopilot)`,
    }).run();
  }

  if (action.type === "send_invoice" && invoice.status === "draft") {
    tx.update(invoices)
      .set({ status: "sent", issued_date: invoice.issued_date ?? today })
      .where(eq(invoices.id, invoice.id))
      .run();
    tx.insert(activity_events).values({
      entity_type: "invoice",
      entity_id: invoice.id,
      type: "invoice_sent",
      description: `📧 Invoice ${invoice.number} (${fmt(invoice.amount)}) sent to client (approved via Autopilot)`,
    }).run();
  }

  if (action.type === "mark_invoice_paid" && invoice.status !== "paid") {
    tx.update(invoices).set({ status: "paid", paid_date: today }).where(eq(invoices.id, invoice.id)).run();
    tx.insert(payments).values({
      invoice_id: invoice.id,
      amount: invoice.amount,
      method: "EFT",
      date: today,
    }).run();
    tx.insert(activity_events).values({
      entity_type: "invoice",
      entity_id: invoice.id,
      type: "invoice_paid",
      description: `✅ Invoice ${invoice.number} marked paid — ${fmt(invoice.amount)} settled (approved via Autopilot)`,
    }).run();
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

  const userId = Number(session.user.id);

  try {
    db.transaction((tx) => {
      if (status === "approved") {
        executeApprovedAction(tx, action);
      }

      tx.update(autopilot_actions)
        .set({
          status,
          resolved_at: new Date().toISOString(),
          resolved_by_id: userId,
        })
        .where(eq(autopilot_actions.id, id))
        .run();

      tx.insert(activity_events).values({
        entity_type: action.entity_type ?? "autopilot",
        entity_id: action.entity_id,
        type: status === "approved" ? "autopilot_approved" : "autopilot_rejected",
        description: `🤖 Autopilot: "${action.title}" ${status} by ${session.user.name}`,
        actor_id: userId,
      }).run();
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Autopilot resolve error:", error);
    return NextResponse.json({ success: false, error: "Failed to resolve action" }, { status: 500 });
  }
}
