"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const LINK_CARDS = [
  {
    key: "player1Link" as const,
    icon: "📱",
    title: "Player 1",
    subtitle: "Your phone",
    color: "var(--primary)",
  },
  {
    key: "player2Link" as const,
    icon: "📱",
    title: "Player 2",
    subtitle: "Partner's phone",
    color: "var(--accent)",
  },
  {
    key: "tvLink" as const,
    icon: "📺",
    title: "TV Screen",
    subtitle: "Big screen (optional)",
    color: "var(--text-muted)",
  },
];

type Links = { player1Link: string; player2Link: string; tvLink: string };

export default function LinksPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [links, setLinks] = useState<Links | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/session/links?sessionId=${encodeURIComponent(sessionId)}`)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Failed to load links"))
      )
      .then(setLinks)
      .catch(() => setErr("Could not load links. Please try again."));
  }, [sessionId]);

  const handleCopy = useCallback((key: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  if (!sessionId) {
    return (
      <main
        className="site-container"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div className="site-card" style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: 16 }}>
            Missing session. Please{" "}
            <a href="/questionnaire">complete the questionnaire</a> first.
          </p>
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main
        className="site-container"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div className="site-card" style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "var(--error)", fontSize: 16 }}>{err}</p>
        </div>
      </main>
    );
  }

  if (!links) {
    return (
      <main
        className="site-container"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "clamp(16px, 3vw, 20px)",
              color: "var(--text-muted)",
            }}
          >
            Loading your game links…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="site-container" style={{ alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Header */}
        <div
          className="animate-in"
          style={{
            textAlign: "center",
            paddingTop: "clamp(24px, 5vh, 48px)",
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>
            🎮
          </span>
          <h1
            className="text-glow"
            style={{
              fontSize: "clamp(24px, 5vw, 32px)",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Your game is ready!
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              color: "var(--text-muted)",
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Share each link with the right device.
            Open all three and the game begins automatically.
          </p>
        </div>

        {/* Link cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {LINK_CARDS.map((card, i) => {
            const url = links[card.key];
            const isCopied = copied === card.key;

            return (
              <div
                key={card.key}
                className={`site-card animate-in animate-in-d${Math.min(i + 1, 5)}`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "var(--surface-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: "clamp(16px, 3vw, 18px)",
                        fontWeight: 700,
                        margin: 0,
                        color: card.color,
                      }}
                    >
                      {card.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <code className="link-code">{url}</code>

                <button
                  type="button"
                  className={`site-btn ${isCopied ? "site-btn-ghost" : "site-btn-secondary"}`}
                  onClick={() => handleCopy(card.key, url)}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    color: isCopied ? "var(--success)" : undefined,
                  }}
                >
                  {isCopied ? "✓ Copied!" : "Copy link"}
                </button>
              </div>
            );
          })}
        </div>

        <p
          className="animate-in animate-in-d4"
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-muted)",
            marginTop: 24,
            marginBottom: 32,
            opacity: 0.7,
            lineHeight: 1.5,
          }}
        >
          These links have also been sent to your email.
          <br />
          They are unique to this game and expire after you finish.
        </p>
      </div>
    </main>
  );
}
