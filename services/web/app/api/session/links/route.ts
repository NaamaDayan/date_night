import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session-store";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  const base = request.nextUrl.origin;
  return NextResponse.json({
    player1Link: `${base}/play?session=${sessionId}&token=${session.player1Token}&role=player1`,
    player2Link: `${base}/play?session=${sessionId}&token=${session.player2Token}&role=player2`,
    tvLink: `${base}/play?session=${sessionId}&token=${session.tvToken}&role=tv`,
  });
}
