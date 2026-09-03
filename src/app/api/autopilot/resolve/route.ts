import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { autopilot_actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { id, status } = await req.json() as { id: number; status: "approved" | "rejected" };

    await db
      .update(autopilot_actions)
      .set({
        status,
        resolved_at: new Date().toISOString(),
      })
      .where(eq(autopilot_actions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
