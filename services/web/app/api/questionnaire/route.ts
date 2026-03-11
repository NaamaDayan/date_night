import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createSession, setEmailSent } from "@/lib/session-store";
import { sendEmailMock } from "@/lib/email";

export async function POST(request: NextRequest) {
  const GENRES = ["Rock", "Classical", "Disney", "Middle Eastern", "Mainstream", "Pop", "Jazz", "Hip-Hop"];
  let body: {
    partner1Name?: string;
    partner2Name?: string;
    howLong?: string;
    howMet?: string;
    whereMet?: string;
    yearOfMeeting?: number;
    favoriteGenres?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { partner1Name, partner2Name, howLong, howMet, whereMet, yearOfMeeting, favoriteGenres } = body;
  if (
    typeof partner1Name !== "string" ||
    typeof partner2Name !== "string" ||
    typeof howLong !== "string" ||
    typeof howMet !== "string" ||
    typeof whereMet !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing or invalid questionnaire fields" },
      { status: 400 }
    );
  }
  const year =
    yearOfMeeting != null && yearOfMeeting !== ""
      ? Number(yearOfMeeting)
      : NaN;
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return NextResponse.json(
      { error: "Invalid year of meeting (use 1900–2100)" },
      { status: 400 }
    );
  }

  const sessionId = nanoid(12);
  const player1Token = nanoid(32);
  const player2Token = nanoid(32);
  const tvToken = nanoid(32);

  const genres =
    Array.isArray(favoriteGenres) && favoriteGenres.length > 0
      ? favoriteGenres.filter((g) => typeof g === "string" && GENRES.includes(g))
      : GENRES.slice(0, 2);

  createSession({
    sessionId,
    player1Token,
    player2Token,
    tvToken,
    questionnaire: {
      partner1Name: partner1Name.trim(),
      partner2Name: partner2Name.trim(),
      howLong: howLong.trim(),
      howMet: howMet.trim(),
      whereMet: whereMet.trim(),
      yearOfMeeting: year,
      favoriteGenres: genres,
    },
    createdAt: Date.now(),
    used: false,
  });

  const base = request.nextUrl.origin;
  const player1Link = `${base}/play?session=${sessionId}&token=${player1Token}&role=player1`;
  const player2Link = `${base}/play?session=${sessionId}&token=${player2Token}&role=player2`;
  const tvLink = `${base}/play?session=${sessionId}&token=${tvToken}&role=tv`;

  await sendEmailMock({ player1Link, player2Link, tvLink });
  setEmailSent(sessionId);

  return NextResponse.json({
    sessionId,
    player1Link,
    player2Link,
    tvLink,
  });
}
