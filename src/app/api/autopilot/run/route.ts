import { NextResponse } from "next/server";
import { runAutopilotRules } from "@/lib/autopilot";

export async function POST() {
  try {
    const result = await runAutopilotRules();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Autopilot run error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await runAutopilotRules();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Autopilot run error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
