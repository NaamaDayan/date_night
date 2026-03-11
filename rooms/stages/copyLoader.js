/**
 * Loads copy from repo-level config/copy/ (shared.json + stage_<id>.json).
 * Exports SHARED, applyTemplate, getStageCopy. Backend single source of truth.
 */
const path = require("path");
const fs = require("fs");

const CONFIG_DIR = path.join(process.cwd(), "config", "copy");
const STAGE_ORDER_PATH = path.join(process.cwd(), "config", "stageOrder.json");
const stageOrder = require(STAGE_ORDER_PATH);

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

function getStageCopy(stageIndexOrId) {
  let id;
  if (typeof stageIndexOrId === "number") {
    const n = stageIndexOrId;
    if (!Number.isInteger(n) || n < 1 || n > stageOrder.length) return {};
    id = stageOrder[n - 1];
  } else if (typeof stageIndexOrId === "string") {
    id = stageIndexOrId;
  } else {
    return {};
  }
  if (!stageCache[id]) stageCache[id] = loadJson(`stage_${id}.json`);
  return stageCache[id];
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
