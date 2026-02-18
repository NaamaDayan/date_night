"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LinksPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [links, setLinks] = useState<{ player1Link: string; player2Link: string; tvLink: string } | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/session/links?sessionId=${encodeURIComponent(sessionId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load links"))))
      .then(setLinks)
      .catch(() => setErr("Could not load links"));
  }, [sessionId]);

  if (!sessionId) {
    return (
      <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
        <p>Missing session. Complete the questionnaire first.</p>
      </main>
    );
  }

  if (err) return <main style={{ padding: "2rem" }}>{err}</main>;
  if (!links) return <main style={{ padding: "2rem" }}>Loading…</main>;

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Your game links</h1>
      <p>Share Link 1 with one phone and Link 2 with the other. Use the TV link on a big screen (optional).</p>
      <section style={{ marginTop: "1.5rem" }}>
        <p><strong>Link 1 – Your phone</strong></p>
        <code style={{ wordBreak: "break-all", display: "block", background: "#f0f0f0", padding: 8 }}>{links.player1Link}</code>
        <button type="button" onClick={() => copy(links.player1Link)} style={{ marginTop: 4 }}>Copy</button>
      </section>
      <section style={{ marginTop: "1.5rem" }}>
        <p><strong>Link 2 – Partner&apos;s phone</strong></p>
        <code style={{ wordBreak: "break-all", display: "block", background: "#f0f0f0", padding: 8 }}>{links.player2Link}</code>
        <button type="button" onClick={() => copy(links.player2Link)} style={{ marginTop: 4 }}>Copy</button>
      </section>
      <section style={{ marginTop: "1.5rem" }}>
        <p><strong>TV / big screen (optional)</strong></p>
        <code style={{ wordBreak: "break-all", display: "block", background: "#f0f0f0", padding: 8 }}>{links.tvLink}</code>
        <button type="button" onClick={() => copy(links.tvLink)} style={{ marginTop: 4 }}>Copy</button>
      </section>
      <p style={{ marginTop: "1.5rem", color: "#666", fontSize: 14 }}>
        These links have also been sent to your email. They are unique to this game and expire after you finish.
      </p>
    </main>
  );
}
