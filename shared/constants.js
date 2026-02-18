/**
 * Shared constants for session roles and game config.
 * Used by both Service 1 (web) and Service 2 (game).
 */

const ROLES = Object.freeze({
  PLAYER1: "player1",
  PLAYER2: "player2",
  TV: "tv",
});

const ROLES_LIST = Object.values(ROLES);

/** Token keys stored in session (one per role) */
const TOKEN_KEYS = Object.freeze({
  [ROLES.PLAYER1]: "player1Token",
  [ROLES.PLAYER2]: "player2Token",
  [ROLES.TV]: "tvToken",
});

/** Max clients per room: 2 players + 1 optional TV */
const MAX_CLIENTS_PER_ROOM = 3;

/** Session TTL in ms (optional; 24h) */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

module.exports = {
  ROLES,
  ROLES_LIST,
  TOKEN_KEYS,
  MAX_CLIENTS_PER_ROOM,
  SESSION_TTL_MS,
};
