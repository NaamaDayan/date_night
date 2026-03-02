/**
 * Stage 3 Vision Board – OpenAI image generation.
 * Uses process.env.OPENAI_API_KEY. Saves to public/generated/ and returns URL or error.
 */

const path = require("path");
const fs = require("fs");

/**
 * Generate a single 16:9 landscape vision board image via OpenAI, save to public/generated/.
 * @param {object} opts
 * @param {string} opts.partner1Name
 * @param {string} opts.partner2Name
 * @param {Array<{ id: string; label: string; assetKey: string }>} opts.mutualPicks
 * @returns {Promise<{ url: string | null; error: string | null }>}
 */
async function generateVisionBoardImage({ partner1Name, partner2Name, mutualPicks }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[stage3] OPENAI_API_KEY is missing from process.env");
    return { url: null, error: "OPENAI_API_KEY not configured" };
  }
  console.log("[stage3] Generating vision board image…");

  const labels = (mutualPicks || []).map((p) => p.label).filter(Boolean);
  const title = "Our Vision Board";
  const prompt = `A romantic, playful, modern mood board collage. Title: "${title}". Include these 5 elements as visual themes: ${labels.join(", ")}. Couple names: ${partner1Name} and ${partner2Name}. Style: collage aesthetic, soft warm lighting, clean and minimal but expressive. No real human faces. Suitable for TV screen display. High quality, 16:9 landscape.`;

  try {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      response_format: "b64_json",
      quality: "standard",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return { url: null, error: "No image data in response" };
    }

    const publicDir = path.join(process.cwd(), "public");
    const generatedDir = path.join(publicDir, "generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const filename = `vision-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.png`;
    const filePath = path.join(generatedDir, filename);
    const buffer = Buffer.from(b64, "base64");
    fs.writeFileSync(filePath, buffer);

    const url = `/generated/${filename}`;
    return { url, error: null };
  } catch (err) {
    const message = err?.message || String(err);
    console.error("[stage3] OpenAI image generation failed:", message);
    return { url: null, error: message };
  }
}

module.exports = { generateVisionBoardImage };
