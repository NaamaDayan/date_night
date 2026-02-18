import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken } from "@/lib/session-store";

/**
 * Called by Colyseus game server to validate join.
 * Query: sessionId, token, role.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const token = request.nextUrl.searchParams.get("token");
  const role = request.nextUrl.searchParams.get("role");
  if (!sessionId || !token || !role) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  const result = getSessionByToken(sessionId, token, role);
  if (!result.valid || !result.session) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({
    valid: true,
    sessionId: result.session.sessionId,
    questionnaire: result.session.questionnaire,
  });
}
