import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { autopilot_actions, invoices } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const PROPOSALS = {
  send_invoice: (inv: typeof invoices.$inferSelect) => ({
    title: `Send invoice ${inv.number} to client`,
    description: `Propose issuing invoice ${inv.number} (${fmt(inv.amount)}) to the client. Approving marks it sent.`,
  }),
  mark_invoice_paid: (inv: typeof invoices.$inferSelect) => ({
    title: `Mark invoice ${inv.number} as paid`,
    description: `Propose recording payment of ${fmt(inv.amount)} against invoice ${inv.number}. Approving settles the invoice and logs the payment.`,
  }),
  send_invoice_reminder: (inv: typeof invoices.$inferSelect) => ({
    title: `Send overdue reminder for ${inv.number}`,
    description: `Invoice ${inv.number} is overdue (${fmt(inv.amount)}). Propose sending a formal overdue reminder to the client.`,
  }),
} as const;

type ProposalType = keyof typeof PROPOSALS;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { invoiceId?: unknown; type?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const invoiceId = Number(body.invoiceId);
  const type = body.type as ProposalType;
  if (!Number.isInteger(invoiceId) || !(type in PROPOSALS)) {
    return NextResponse.json(
      { success: false, error: "Expected { invoiceId: number, type: 'send_invoice' | 'mark_invoice_paid' | 'send_invoice_reminder' }" },
      { status: 400 }
    );
  }

  const invoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).get();
  if (!invoice) {
    return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
  }

  const existing = await db
    .select()
    .from(autopilot_actions)
    .where(
      and(
        eq(autopilot_actions.type, type),
        eq(autopilot_actions.entity_type, "invoice"),
        eq(autopilot_actions.entity_id, invoiceId),
        eq(autopilot_actions.status, "pending")
      )
    )
    .get();

  if (existing) {
    return NextResponse.json({ success: true, id: existing.id, alreadyProposed: true });
  }

  const proposal = PROPOSALS[type](invoice);
  const inserted = await db
    .insert(autopilot_actions)
    .values({
      type,
      classification: "risky",
      status: "pending",
      entity_type: "invoice",
      entity_id: invoiceId,
      title: proposal.title,
      description: proposal.description,
    })
    .returning()
    .get();

  return NextResponse.json({ success: true, id: inserted.id, alreadyProposed: false });
}
