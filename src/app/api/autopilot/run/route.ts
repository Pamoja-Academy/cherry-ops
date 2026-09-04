import { NextRequest, NextResponse } from "next/server";
import { runAutopilotRules } from "@/lib/autopilot";

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. When CRON_SECRET is
// unset (local dev/demo), the endpoint stays open so it can be triggered by hand.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runAutopilotRules();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Autopilot run error:", error);
    return NextResponse.json({ success: false, error: "Autopilot run failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
