"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QUESTIONNAIRE_FIELDS,
  QUESTIONNAIRE_TITLE,
  QUESTIONNAIRE_SUBTITLE,
} from "./questionnaire-config";

export default function QuestionnairePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const body: Record<string, string | number | string[]> = {};
    for (const field of QUESTIONNAIRE_FIELDS) {
      if (field.type === "multiselect" && field.options) {
        const checked = form.querySelectorAll<HTMLInputElement>(
          `input[name="${field.name}"]:checked`
        );
        body[field.name] = Array.from(checked).map((el) => el.value);
        continue;
      }
      const el = form.elements.namedItem(field.name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
        | null;
      const val = el?.value?.trim() ?? "";
      body[field.name] = field.type === "number" ? (val ? Number(val) : "") : val;
    }

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
    <main
      className="site-container"
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header */}
        <div
          className="animate-in"
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>
            💑
          </span>
          <h1
            style={{
              fontSize: "clamp(22px, 5vw, 30px)",
              fontWeight: 800,
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {QUESTIONNAIRE_TITLE}
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              color: "var(--text-muted)",
            }}
          >
            {QUESTIONNAIRE_SUBTITLE}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="site-card animate-in animate-in-d1"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {QUESTIONNAIRE_FIELDS.map((field, i) => (
            <div
              key={field.name}
              className={`animate-in animate-in-d${Math.min(i + 2, 5)}`}
            >
              <label className="site-label" htmlFor={field.name}>
                <span style={{ marginRight: 6 }}>{field.icon}</span>
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="site-input"
                  rows={3}
                  style={{ resize: "vertical", minHeight: 80 }}
                />
              ) : field.type === "select" && field.options ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  className="site-input"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {field.placeholder}
                  </option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "multiselect" && field.options ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {field.options.map((opt) => (
                    <label
                      key={opt}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 12px",
                        background: "var(--surface)",
                        borderRadius: "var(--radius)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        name={field.name}
                        value={opt}
                        className="site-input"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : field.type === "number" ? (
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  placeholder={field.placeholder}
                  required={field.required}
                  className="site-input"
                  min={1900}
                  max={2100}
                  step={1}
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder={field.placeholder}
                  required={field.required}
                  className="site-input"
                />
              )}
            </div>
          ))}

          {error && (
            <p
              style={{
                color: "var(--error)",
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
                padding: "10px 16px",
                background: "rgba(252,165,165,0.1)",
                borderRadius: "var(--radius)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="site-btn site-btn-primary"
            style={{ width: "100%", fontSize: 17, marginTop: 4 }}
          >
            {loading ? "Creating your game…" : "Start your game"}
          </button>
        </form>

        <p
          className="animate-in animate-in-d5"
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-muted)",
            marginTop: 16,
            opacity: 0.6,
          }}
        >
          Your answers are used only for the game and not stored permanently.
        </p>
      </div>
    </main>
  );
}
