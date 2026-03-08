/**
 * Loads copy from repo-level config/copy/ (shared.json + stage1..6.json).
 * Exports SHARED, applyTemplate, getStageCopy. Backend single source of truth.
 */
const path = require("path");
const fs = require("fs");

const CONFIG_DIR = path.join(process.cwd(), "config", "copy");

function loadJson(filename) {
  const filePath = path.join(CONFIG_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("[copyLoader] Failed to load", filename, e.message);
    return {};
  }
}

let sharedCache = null;
const stageCache = {};

function getSHARED() {
  if (sharedCache == null) sharedCache = loadJson("shared.json");
  return sharedCache;
}

function getStageCopy(stageIndex) {
  const n = Number(stageIndex);
  if (!Number.isInteger(n) || n < 1 || n > 6) return {};
  if (!stageCache[n]) stageCache[n] = loadJson(`stage${n}.json`);
  return stageCache[n];
}

function applyTemplate(str, vars = {}) {
  if (str == null || typeof str !== "string") return "";
  let out = str;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = "{{" + key + "}}";
    out = out.split(placeholder).join(String(value ?? ""));
  }
  return out;
}

module.exports = {
  get SHARED() {
    return getSHARED();
  },
  getStageCopy,
  applyTemplate,
};
