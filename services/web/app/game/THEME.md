# Date Night Game – UI Theme

## 1. Color palette

| Role | Hex | Usage |
|------|-----|--------|
| **Background** | `#1a1625` | Main app background (warm purple-black) |
| **Surface** | `#2d2640` | Cards, modals, inputs, secondary areas |
| **Surface elevated** | `#3d3550` | Hover states for secondary buttons |
| **Primary** | `#ec4899` | Main CTAs (pink), love/action |
| **Primary hover** | `#f472b6` | Primary button hover |
| **Secondary** | `#c4b5fd` | Lavender – word highlights, secondary actions |
| **Accent** | `#fcd34d` | Gold – success, final reveal, special highlights |
| **Text** | `#fef3c7` | Warm cream – body and headings |
| **Text muted** | `#a78bfa` | Soft purple – hints, labels |
| **Border** | `#4c3d6b` | Soft purple – borders, dividers |
| **Success** | `#6ee7b7` | Mint – correct guess, positive feedback |
| **Error** | `#fca5a5` | Soft red – wrong guess, gentle failure |

Contrast: Text on background and surface meets WCAG AA. Primary and accent on dark backgrounds are used for large, bold elements and remain readable.

---

## 2. Theme description: “Warm romantic with playful pops”

- **Buttons (primary):** Pink (`primary`), 2px border, rounded (12px), soft pink glow on hover. White text for contrast.
- **Buttons (secondary):** Surface background, lavender border, no glow; hover → surface elevated.
- **Cards / modals:** Surface background, border color for outline, optional `shadows.card`.
- **Map (TV):** Gradient from surface to background; inner “zoom” circle uses border + surface. No cold grays.
- **Highlights:** Secret word and special text use **secondary** (lavender). Success messages use **accent** (gold) or **success** (mint). Wrong guess uses **error** (soft red).
- **Inputs:** Surface background, border; focus ring uses primary glow.
- **TV screens:** Headlines use **text** (warm cream). Subtext uses **textMuted**. Final reveal and positive feedback use **accent** with optional soft glow.

Apply the same palette on both TV and phone screens so the experience feels cohesive and romantic rather than sterile.

---

## 3. Optional accent effects

- **Primary button:** Soft pink glow (`box-shadow: 0 0 20px rgba(236, 72, 153, 0.35)`). Slightly stronger on hover.
- **Selected option (stage 4):** Same primary glow so the chosen answer feels “lit up”.
- **Final reveal (TV):** Light gold glow on the “פריז. יפה לכם.” text for a celebratory feel.
- **Hearts / sparkles:** For future polish, add a light CSS animation (e.g. subtle floating hearts or sparkles in the background) using `primary` or `accent` at low opacity so the game feels playful without distracting from readability.

All effects stay subtle so the UI remains gamey, cheerful, and romantic without feeling noisy.
