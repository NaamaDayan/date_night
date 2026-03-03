import "./globals.css";

export const metadata = {
  title: "Couples Game – A Date Night Experience",
  description:
    "A fun, personalized game for couples. Buy once, play together on your phones with a shared TV screen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Ambient background */}
        <div className="site-bg" aria-hidden />
        <div
          className="site-orb"
          aria-hidden
          style={{
            width: 280,
            height: 280,
            left: "8%",
            top: "18%",
            background:
              "radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          className="site-orb"
          aria-hidden
          style={{
            width: 200,
            height: 200,
            right: "12%",
            bottom: "22%",
            background:
              "radial-gradient(circle, rgba(252,211,77,0.25) 0%, transparent 70%)",
            animationDelay: "-3s",
          }}
        />
        <div
          className="site-orb"
          aria-hidden
          style={{
            width: 160,
            height: 160,
            left: "55%",
            bottom: "8%",
            background:
              "radial-gradient(circle, rgba(196,181,253,0.2) 0%, transparent 70%)",
            animationDelay: "-6s",
          }}
        />
        {children}
      </body>
    </html>
  );
}
