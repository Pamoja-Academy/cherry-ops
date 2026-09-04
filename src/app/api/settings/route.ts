import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { activity_events, workspace_settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getWorkspaceSettings } from "@/lib/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getWorkspaceSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    agency_name?: string;
    headquarters?: string;
    founded?: string;
    certification?: string;
    services?: string;
  };

  const current = await getWorkspaceSettings();
  const next = {
    agency_name: (body.agency_name ?? current.agency_name).trim(),
    headquarters: (body.headquarters ?? current.headquarters).trim(),
    founded: (body.founded ?? current.founded).trim(),
    certification: (body.certification ?? current.certification).trim(),
    services: (body.services ?? current.services).trim(),
    updated_at: new Date().toISOString(),
  };

  if (!next.agency_name) {
    return NextResponse.json({ error: "Agency name is required" }, { status: 400 });
  }

  let updated;
  if (current.id > 0) {
    [updated] = await db
      .update(workspace_settings)
      .set(next)
      .where(eq(workspace_settings.id, current.id))
      .returning();
  } else {
    [updated] = await db.insert(workspace_settings).values(next).returning();
  }

  await db.insert(activity_events).values({
    entity_type: "settings",
    entity_id: updated?.id ?? null,
    type: "settings_updated",
    description: `Workspace settings updated — ${next.agency_name}`,
    actor_id: parseInt(session.user.id, 10),
  });

  return NextResponse.json({ success: true, settings: updated });
}
