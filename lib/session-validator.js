const http = require("http");
const https = require("https");
const { URL } = require("url");

function getWebBaseUrl() {
  return process.env.WEB_BASE_URL || "http://localhost:3000";
}

/**
 * Internal helper to perform an HTTP(S) request and parse JSON response.
 * Resolves with `{ status, json }`. Never throws on non-2xx status codes.
 * May throw only on network/parse errors.
 * @param {string} urlString
 * @param {{ method?: string; headers?: Record<string, string>; body?: string }} [options]
 * @returns {Promise<{ status: number; json: any }>}
 */
function requestJson(urlString, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const lib = url.protocol === "https:" ? https : http;

    const req = lib.request(
      url,
      {
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (!data) {
            return resolve({ status: res.statusCode || 0, json: {} });
          }
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode || 0, json });
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Validate a session token by calling the web app's `/api/session/validate` endpoint.
 * Returns `{ valid: boolean, questionnaire?: any }`.
 * Never throws; on any error it resolves to `{ valid: false }`.
 * @param {string} sessionId
 * @param {string} token
 * @param {string} role
 * @returns {Promise<{ valid: boolean; questionnaire?: any }>}
 */
async function validateToken(sessionId, token, role) {
  try {
    const baseUrl = getWebBaseUrl().replace(/\/+$/, "");
    const url =
      `${baseUrl}/api/session/validate` +
      `?sessionId=${encodeURIComponent(sessionId)}` +
      `&token=${encodeURIComponent(token)}` +
      `&role=${encodeURIComponent(role)}`;

    const { status, json } = await requestJson(url, { method: "GET" });

    if (status >= 200 && status < 300 && json && json.valid) {
      return {
        valid: true,
        questionnaire: json.questionnaire || null,
      };
    }

    return { valid: false };
  } catch (err) {
    console.error("[session-validator] validateToken error", err);
    return { valid: false };
  }
}

/**
 * Mark a session as used by calling the web app's `/api/session/used` endpoint.
 * Best-effort only; errors are logged and swallowed.
 * @param {string} sessionId
 * @returns {Promise<void>}
 */
async function setSessionUsed(sessionId) {
  try {
    if (!sessionId) return;
    const baseUrl = getWebBaseUrl().replace(/\/+$/, "");
    const url = `${baseUrl}/api/session/used`;
    await requestJson(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });
  } catch (err) {
    console.error("[session-validator] setSessionUsed error", err);
  }
}

module.exports = {
  validateToken,
  setSessionUsed,
};

