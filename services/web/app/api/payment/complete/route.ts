import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("couples_game_paid", "true", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
