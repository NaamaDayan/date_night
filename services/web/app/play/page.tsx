import { Suspense } from "react";
import GameClient from "./GameClient";

export default function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; token?: string; role?: string; devStage?: string }>;
}) {
  return (
    <main style={{ padding: "1rem", minHeight: "100vh" }}>
      <Suspense fallback={<p>Loading…</p>}>
        <PlayWrapper searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function PlayWrapper({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; token?: string; role?: string; devStage?: string }>;
}) {
  const params = await searchParams;
  const session = params.session ?? "";
  const token = params.token ?? "";
  const role = params.role ?? "";
  const devStageParam = params.devStage;
  const devStage =
    devStageParam != null && devStageParam !== ""
      ? Math.max(1, Math.min(Number(devStageParam), 99)) || undefined
      : undefined;

  if (!session || !token || !role) {
    return (
      <p>
        Invalid link. Missing session, token, or role. Please use the links from
        your email or the links page.
      </p>
    );
  }

  const validRoles = ["player1", "player2", "tv"];
  if (!validRoles.includes(role)) {
    return <p>Invalid role. Use a valid game link.</p>;
  }

  return (
    <GameClient
      sessionId={session}
      token={token}
      role={role as "player1" | "player2" | "tv"}
      devStage={devStage}
    />
  );
}
