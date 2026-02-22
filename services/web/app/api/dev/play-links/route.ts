import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createSession } from "@/lib/session-store";

const MOCK_QUESTIONNAIRE = {
  partner1Name: "Dev Partner 1",
  partner2Name: "Dev Partner 2",
  howLong: "1 year",
  howMet: "Online",
  whereMet: "At home",
};

/**
 * Dev-only: create a session with mock questionnaire and return play links
 * that include devStage=N so the game server skips to stage N.
 * Only available when NODE_ENV === "development".
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const stageParam = request.nextUrl.searchParams.get("stage");
  const stage = Math.max(1, Math.min(99, Number(stageParam) || 1));

  const sessionId = nanoid(12);
  const player1Token = nanoid(32);
  const player2Token = nanoid(32);
  const tvToken = nanoid(32);

  createSession({
    sessionId,
    player1Token,
    player2Token,
    tvToken,
    questionnaire: { ...MOCK_QUESTIONNAIRE },
    createdAt: Date.now(),
    used: false,
  });

  const base = request.nextUrl.origin;
  const player1Link = `${base}/play?session=${sessionId}&token=${player1Token}&role=player1&devStage=${stage}`;
  const player2Link = `${base}/play?session=${sessionId}&token=${player2Token}&role=player2&devStage=${stage}`;
  const tvLink = `${base}/play?session=${sessionId}&token=${tvToken}&role=tv&devStage=${stage}`;

  return NextResponse.json({
    stage,
    sessionId,
    player1Link,
    player2Link,
    tvLink,
  });
}
