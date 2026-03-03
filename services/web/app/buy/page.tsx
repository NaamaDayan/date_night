"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BuyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCompletePayment() {
    setLoading(true);
    try {
      await fetch("/api/payment/complete", { method: "POST" });
      router.push("/ready");
    } catch {
      setLoading(false);
    }
  }

  return (
    <main
      className="site-container"
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div className="animate-in" style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>
            💝
          </span>
          <h1
            style={{
              fontSize: "clamp(24px, 5vw, 32px)",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Get your game
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              color: "var(--text-muted)",
            }}
          >
            One purchase, unlimited memories
          </p>
        </div>

        <div className="site-card animate-in animate-in-d1">
          <div
            style={{
              textAlign: "center",
              paddingBottom: 24,
              borderBottom: "1px solid var(--border)",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Couples Game
            </p>
            <p
              style={{
                fontSize: "clamp(36px, 8vw, 48px)",
                fontWeight: 800,
                color: "var(--accent)",
                lineHeight: 1.2,
              }}
            >
              Free
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginTop: 4,
              }}
            >
              MVP – no payment required
            </p>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {[
              "4 unique game stages",
              "Personalized to your story",
              "Play on phones + TV",
              "No app download needed",
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: "clamp(14px, 2.5vw, 15px)",
                }}
              >
                <span style={{ color: "var(--success)", fontSize: 16 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="site-btn site-btn-primary"
            onClick={handleCompletePayment}
            disabled={loading}
            style={{ width: "100%", fontSize: 17 }}
          >
            {loading ? "Processing…" : "Continue"}
          </button>
        </div>

        <p
          className="animate-in animate-in-d2"
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-muted)",
            marginTop: 16,
            opacity: 0.7,
          }}
        >
          Secure checkout · Instant access
        </p>
      </div>
    </main>
  );
}
