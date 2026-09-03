import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { packFromOpportunity } from "@/lib/opportunity/pack-pdf";

export async function GET(_req: Request, ctx: RouteContext<"/api/opportunities/[id]/pack">) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const opportunityId = parseInt(id, 10);
  if (Number.isNaN(opportunityId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const opp = await db.select().from(opportunities).where(eq(opportunities.id, opportunityId)).get();
  if (!opp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pdf = packFromOpportunity(opp);
  const filename = `red-cherry-pack-${opp.reference ?? opp.id}.pdf`.replace(/[^\w.-]+/g, "-");

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(_req: Request, ctx: RouteContext<"/api/opportunities/[id]/pack">) {
  return GET(_req, ctx);
}
