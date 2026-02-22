"use client";

import { useState } from "react";

type Links = {
  stage: number;
  sessionId: string;
  player1Link: string;
  player2Link: string;
  tvLink: string;
} | null;

export default function DevPlayPage() {
  const [stage, setStage] = useState(2);
  const [links, setLinks] = useState<Links>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDev = process.env.NODE_ENV === "development";

  const generate = async () => {
    setError("");
    setLinks(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/dev/play-links?stage=${stage}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate links");
      }
      const data = await res.json();
      setLinks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate links");
    } finally {
      setLoading(false);
    }
  };

  if (!isDev) {
    return (
      <main style={{ padding: 24 }}>
        <p>This page is only available in development (NODE_ENV=development).</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 560 }}>
      <h1>Dev: Play from Stage N</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Skip buying, questionnaire, and earlier stages. Generates a session with mock
        questionnaire and play links that open directly at the chosen stage.
      </p>

      <div style={{ marginBottom: 24 }}>
        <label htmlFor="stage" style={{ marginRight: 8 }}>
          Start at stage:
        </label>
        <select
          id="stage"
          value={stage}
          onChange={(e) => setStage(Number(e.target.value))}
          style={{ padding: "6px 10px" }}
        >
          {[1, 2, 3].map((n) => (
            <option key={n} value={n}>
              Stage {n}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        style={{ padding: "8px 16px", marginBottom: 24 }}
      >
        {loading ? "Generating…" : "Generate links"}
      </button>

      {error && (
        <p style={{ color: "#c00", marginBottom: 16 }}>{error}</p>
      )}

      {links && (
        <div style={{ border: "1px solid #333", padding: 16, borderRadius: 8 }}>
          <p style={{ marginBottom: 12 }}>
            <strong>Stage {links.stage}</strong> · Session: {links.sessionId}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <span style={{ marginRight: 8 }}>Player 1:</span>
              <a
                href={links.player1Link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: 8 }}
              >
                Open
              </a>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(links.player1Link)}
                style={{ padding: "2px 8px" }}
              >
                Copy
              </button>
            </div>
            <div>
              <span style={{ marginRight: 8 }}>Player 2:</span>
              <a
                href={links.player2Link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: 8 }}
              >
                Open
              </a>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(links.player2Link)}
                style={{ padding: "2px 8px" }}
              >
                Copy
              </button>
            </div>
            <div>
              <span style={{ marginRight: 8 }}>TV:</span>
              <a
                href={links.tvLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: 8 }}
              >
                Open
              </a>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(links.tvLink)}
                style={{ padding: "2px 8px" }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
