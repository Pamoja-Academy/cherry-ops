import { db } from "@/db";
import { opportunities, opportunity_reminders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { briefToOpportunityRow, getDemoBriefs } from "./ingest";
import { scoreBrief } from "./scorer";

/** Fresh demo media briefs — used by ingest API, cron, and empty-inbox recovery. */
export async function runDemoIngest(opts?: { clear?: boolean }) {
  if (opts?.clear !== false) {
    await db.delete(opportunity_reminders);
    await db.delete(opportunities);
  }

  const rows = getDemoBriefs().map(briefToOpportunityRow);
  const inserted = await db.insert(opportunities).values(rows).returning();

  let rescored = 0;
  for (const opp of inserted) {
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

  return { ingested: inserted.length, rescored };
}

export async function ensureOpportunitySeed() {
  const existing = await db.select({ id: opportunities.id }).from(opportunities).limit(1);
  if (existing.length > 0) return { seeded: false };
  const result = await runDemoIngest({ clear: false });
  return { seeded: true, ...result };
}
