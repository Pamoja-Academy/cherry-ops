import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runDemoIngest } from "@/lib/opportunity/ensure-seed";

function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // local / open pilot
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearer === secret;
}

async function handleIngest(req: NextRequest) {
  const session = await auth();
  const isCron = cronAuthorized(req);
  if (!session?.user && !isCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDemoIngest({ clear: true });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleIngest(req);
}

/** Vercel Cron hits GET with Authorization: Bearer $CRON_SECRET */
export async function GET(req: NextRequest) {
  return handleIngest(req);
}
