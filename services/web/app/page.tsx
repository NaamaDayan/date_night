import Link from "next/link";

const FEATURES = [
  {
    icon: "📱",
    title: "Play on your phones",
    description: "Each player uses their own phone — no app download needed.",
  },
  {
    icon: "📺",
    title: "Shared TV screen",
    description: "Connect a TV for a shared experience with beautiful visuals.",
  },
  {
    icon: "💛",
    title: "Personalized for you",
    description: "Answer a quick questionnaire and the game adapts to your story.",
  },
];

export default function LandingPage() {
  return (
    <main className="site-container" style={{ justifyContent: "center" }}>
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          paddingTop: "clamp(40px, 10vh, 100px)",
          paddingBottom: "clamp(32px, 6vh, 64px)",
        }}
      >
        <p
          className="animate-in"
          style={{
            fontSize: "clamp(14px, 2.5vw, 16px)",
            fontWeight: 600,
            color: "var(--primary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Date Night Experience
        </p>

        <h1
          className="animate-in animate-in-d1 text-glow"
          style={{
            fontSize: "clamp(36px, 8vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Couples Game
        </h1>

        <p
          className="animate-in animate-in-d2"
          style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            color: "var(--text-muted)",
            maxWidth: 480,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          A fun, personalized game for you and your partner.
          Four stages of challenges that bring you closer together.
        </p>

        <Link
          href="/buy"
          className="site-btn site-btn-primary animate-in animate-in-d3"
          style={{ fontSize: 18, padding: "16px 40px", minHeight: 56 }}
        >
          Get Started
        </Link>
      </section>

      {/* Features */}
      <section
        className="features-grid"
        style={{
          paddingBottom: "clamp(32px, 6vh, 64px)",
        }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`site-card animate-in animate-in-d${i + 3}`}
            style={{ textAlign: "center" }}
          >
            <span
              style={{
                fontSize: 32,
                display: "block",
                marginBottom: 12,
              }}
            >
              {f.icon}
            </span>
            <h3
              style={{
                fontSize: "clamp(15px, 2.5vw, 17px)",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontSize: "clamp(13px, 2vw, 15px)",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              {f.description}
            </p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section
        className="animate-in animate-in-d5"
        style={{
          textAlign: "center",
          padding: "clamp(24px, 5vh, 48px) 0",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(20px, 4vw, 28px)",
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          How it works
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 400,
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          {[
            { n: "1", text: "Purchase the game" },
            { n: "2", text: "Fill out a quick couple questionnaire" },
            { n: "3", text: "Get unique links for each player + TV" },
            { n: "4", text: "Play together through 4 stages" },
          ].map((step) => (
            <div
              key={step.n}
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--surface-elevated)",
                  border: "2px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--primary)",
                  flexShrink: 0,
                }}
              >
                {step.n}
              </span>
              <span
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  color: "var(--text)",
                }}
              >
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
