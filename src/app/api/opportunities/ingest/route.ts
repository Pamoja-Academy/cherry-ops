import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { opportunities, opportunity_reminders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { briefToOpportunityRow, getDemoBriefs } from "@/lib/opportunity/ingest";
import { scoreBrief } from "@/lib/opportunity/scorer";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Clear and re-seed demo media briefs
  await db.delete(opportunity_reminders);
  await db.delete(opportunities);

  const rows = getDemoBriefs().map(briefToOpportunityRow);
  const inserted = await db.insert(opportunities).values(rows).returning();

  // Re-score any still-pending (all are pending after fresh ingest)
  let rescored = 0;
  for (const opp of inserted) {
    if (opp.triage_status === "pending") {
      const scored = scoreBrief({
        title: opp.title,
        description: opp.description,
        issuer: opp.issuer,
        province: opp.province,
        category: opp.category,
        estimatedValue: opp.estimated_value,
      });
      await db
        .update(opportunities)
        .set({
          fit_score: scored.score,
          score_breakdown: JSON.stringify(scored.breakdown),
          updated_at: new Date().toISOString(),
        })
        .where(eq(opportunities.id, opp.id));
      rescored++;
    }
  }

  return NextResponse.json({
    success: true,
    ingested: inserted.length,
    rescored,
  });
}
