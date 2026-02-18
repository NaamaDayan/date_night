import { NextRequest, NextResponse } from "next/server";
import { setSessionUsed } from "@/lib/session-store";

/**
 * Called by Colyseus when game ends to invalidate links.
 */
export async function POST(request: NextRequest) {
  let body: { sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const sessionId = body.sessionId;
  if (typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  setSessionUsed(sessionId);
  return NextResponse.json({ ok: true });
}
