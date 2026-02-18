"use client";

import { useRouter } from "next/navigation";

export default function BuyPage() {
  const router = useRouter();

  async function handleCompletePayment() {
    await fetch("/api/payment/complete", { method: "POST" });
    router.push("/ready");
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Checkout</h1>
      <p>MVP: Mock payment. Click below to complete.</p>
      <button
        type="button"
        onClick={handleCompletePayment}
        style={{
          padding: "0.75rem 1.5rem",
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Complete payment
      </button>
    </main>
  );
}
