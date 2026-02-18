"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuestionnairePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const body = {
      partner1Name: (form.elements.namedItem("partner1Name") as HTMLInputElement).value,
      partner2Name: (form.elements.namedItem("partner2Name") as HTMLInputElement).value,
      howLong: (form.elements.namedItem("howLong") as HTMLInputElement).value,
      howMet: (form.elements.namedItem("howMet") as HTMLInputElement).value,
      whereMet: (form.elements.namedItem("whereMet") as HTMLInputElement).value,
    };
    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit");
      }
      const data = await res.json();
      router.push(`/links?sessionId=${encodeURIComponent(data.sessionId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Couple questionnaire</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>
          Name of partner 1
          <input name="partner1Name" type="text" required style={{ display: "block", width: "100%", padding: 8 }} />
        </label>
        <label>
          Name of partner 2
          <input name="partner2Name" type="text" required style={{ display: "block", width: "100%", padding: 8 }} />
        </label>
        <label>
          How long together
          <input name="howLong" type="text" required style={{ display: "block", width: "100%", padding: 8 }} />
        </label>
        <label>
          How they met
          <input name="howMet" type="text" required style={{ display: "block", width: "100%", padding: 8 }} />
        </label>
        <label>
          Where they met
          <input name="whereMet" type="text" required style={{ display: "block", width: "100%", padding: 8 }} />
        </label>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: "0.75rem", cursor: loading ? "wait" : "pointer" }}>
          {loading ? "Submitting…" : "Submit"}
        </button>
      </form>
    </main>
  );
}
