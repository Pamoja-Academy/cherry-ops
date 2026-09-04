import { NextRequest, NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/opportunity/reminders";

function getCronSecret(req: NextRequest): string | null {
  return req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const result = await dispatchDueReminders(getCronSecret(req));
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Reminder dispatch error:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
