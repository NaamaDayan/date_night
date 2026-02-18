import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ReadyPage() {
  const cookieStore = await cookies();
  const paid = cookieStore.get("couples_game_paid")?.value === "true";
  if (!paid) redirect("/");

  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Your date is ready!</h1>
      <p>Fill in the couple questionnaire to get your unique game links.</p>
      <Link
        href="/questionnaire"
        style={{
          display: "inline-block",
          padding: "0.75rem 1.5rem",
          background: "#333",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 6,
        }}
      >
        Fill couple questionnaire
      </Link>
      <p style={{ marginTop: "1.5rem", color: "#666", fontSize: 14 }}>
        You can also fill the questionnaire later. We&apos;ve sent a
        confirmation email with a reminder.
      </p>
    </main>
  );
}
