import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Couples Game</h1>
      <p>A fun game for you and your partner. Buy once, play together.</p>
      <Link
        href="/buy"
        style={{
          display: "inline-block",
          padding: "0.75rem 1.5rem",
          background: "#333",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 6,
        }}
      >
        Buy Game
      </Link>
    </main>
  );
}
