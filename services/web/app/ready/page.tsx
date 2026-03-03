import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ReadyPage() {
  const cookieStore = await cookies();
  const paid = cookieStore.get("couples_game_paid")?.value === "true";
  if (!paid) redirect("/");

  return (
    <main
      className="site-container"
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          textAlign: "center",
        }}
      >
        <div className="animate-in" style={{ marginBottom: 32 }}>
          <span
            style={{
              fontSize: "clamp(48px, 10vw, 72px)",
              display: "block",
              marginBottom: 16,
            }}
          >
            🎉
          </span>
          <h1
            className="text-glow"
            style={{
              fontSize: "clamp(26px, 6vw, 36px)",
              fontWeight: 800,
              marginBottom: 12,
              lineHeight: 1.2,
            }}
          >
            You&apos;re all set!
          </h1>
          <p
            style={{
              fontSize: "clamp(15px, 3vw, 18px)",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              maxWidth: 360,
              margin: "0 auto",
            }}
          >
            One quick step left — fill in a short questionnaire so we can
            personalize the game for you and your partner.
          </p>
        </div>

        <Link
          href="/questionnaire"
          className="site-btn site-btn-primary animate-in animate-in-d1"
          style={{
            width: "100%",
            maxWidth: 360,
            fontSize: 17,
            padding: "16px 32px",
            minHeight: 56,
          }}
        >
          Fill couple questionnaire
        </Link>

        <p
          className="animate-in animate-in-d2"
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "var(--text-muted)",
            opacity: 0.7,
            lineHeight: 1.5,
          }}
        >
          You can also fill the questionnaire later.
          <br />
          We&apos;ve sent a confirmation email with a reminder.
        </p>
      </div>
    </main>
  );
}
