/**
 * In-memory session store for MVP.
 * Implements: createSession, getSession(sessionId), getSessionByToken(sessionId, token, role), setSessionUsed(sessionId).
 */

const { TOKEN_KEYS } = require("./constants");

// Use globalThis so the same Map is shared across all API route bundles (Next.js may load this module multiple times).
const STORE_KEY = "__couples_game_sessions";
if (typeof globalThis[STORE_KEY] === "undefined") {
  globalThis[STORE_KEY] = new Map();
}
const sessions = globalThis[STORE_KEY];

/**
 * @param {import("../../../shared/session-schema").Session} session
 * @returns {import("../../../shared/session-schema").Session}
 */
function createSession(session) {
  sessions.set(session.sessionId, { ...session, createdAt: Date.now() });
  return sessions.get(session.sessionId);
}

/**
 * @param {string} sessionId
 * @returns {import("../../../shared/session-schema").Session | undefined}
 */
function getSession(sessionId) {
  return sessions.get(sessionId);
}

/**
 * Validate token for a given session and role; return session if valid.
 * @param {string} sessionId
 * @param {string} token
 * @param {string} role
 * @returns {{ valid: boolean; session?: import("../../../shared/session-schema").Session }}
 */
function getSessionByToken(sessionId, token, role) {
  const session = sessions.get(sessionId);
  if (!session || session.used) {
    return { valid: false };
  }
  const tokenKey = TOKEN_KEYS[role];
  if (!tokenKey || session[tokenKey] !== token) {
    return { valid: false };
  }
  return { valid: true, session };
}

/**
 * @param {string} sessionId
 */
function setSessionUsed(sessionId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.used = true;
  }
}

/**
 * Mark email as sent for session.
 * @param {string} sessionId
 */
function setEmailSent(sessionId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.emailSent = true;
  }
}

module.exports = {
  createSession,
  getSession,
  getSessionByToken,
  setSessionUsed,
  setEmailSent,
};
