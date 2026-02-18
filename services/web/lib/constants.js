/**
 * Session role and token constants (mirrors shared/constants for web app use).
 * Kept local so Next.js can resolve without requiring files outside services/web.
 */

const ROLES = Object.freeze({
  PLAYER1: "player1",
  PLAYER2: "player2",
  TV: "tv",
});

const ROLES_LIST = Object.values(ROLES);

const TOKEN_KEYS = Object.freeze({
  [ROLES.PLAYER1]: "player1Token",
  [ROLES.PLAYER2]: "player2Token",
  [ROLES.TV]: "tvToken",
});

const MAX_CLIENTS_PER_ROOM = 3;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

module.exports = {
  ROLES,
  ROLES_LIST,
  TOKEN_KEYS,
  MAX_CLIENTS_PER_ROOM,
  SESSION_TTL_MS,
};
