/**
 * Stage: Our Soundtrack
 * Turn-based guessing: one player conveys a song (pantomime, humming), the other guesses.
 * 30s per turn, skip song option, 5 correct or 30 attempts to finish.
 */

const { setStageTexts, getQuestionnaire, setPayload, parsePayload, addWelcomeState, handleWelcomeReady } = require("../IStage.js");
const { ROLES } = require("../../../shared/constants.js");
const COPY = require("./copy.js");
const { songDatabase } = require("./data/songs.js");

const TURN_SECONDS = 30;
const MAX_ATTEMPTS = 30;
const TARGET_CORRECT = 5;

function getGenres(room) {
  const q = getQuestionnaire(room);
  const genres = q.favoriteGenres;
  if (Array.isArray(genres) && genres.length > 0) return genres;
  return ["Rock", "Pop"];
}

function getSongsForGenres(genres) {
  return songDatabase.filter((s) => genres.includes(s.genre));
}

function pickSong(genres, guessedKeys) {
  const pool = getSongsForGenres(genres);
  const available = pool.filter((s) => {
    const key = `${s.songName}|${s.artist}`;
    return !guessedKeys.includes(key);
  });
  const source = available.length > 0 ? available : pool;
  const song = source[Math.floor(Math.random() * source.length)];
  return song;
}

function normalizeGuess(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isGuessCorrect(guess, song) {
  const g = normalizeGuess(guess);
  const name = normalizeGuess(song.songName);
  if (g === name) return true;
  if (name.includes(g) || g.includes(name)) return true;
  return false;
}

function buildPayload(room) {
  const genres = getGenres(room);
  const guessedKeys = [];
  const song = pickSong(genres, guessedKeys);
  return {
    phase: "conveying",
    currentTurn: 1,
    currentSong: song,
    correctGuesses: 0,
    totalAttempts: 0,
    guessedSongs: guessedKeys,
    timerEndAt: Date.now() + TURN_SECONDS * 1000,
    timeUp: false,
    favoriteGenres: genres,
    welcomeStatus: "welcome",
    welcomeP1Ready: false,
    welcomeP2Ready: false,
  };
}

function startPlaying(room, state, payload) {
  payload.welcomeStatus = "playing";
  const genres = getGenres(room);
  payload.favoriteGenres = genres;
  payload.guessedSongs = payload.guessedSongs || [];
  const song = pickSong(genres, payload.guessedSongs);
  payload.currentSong = song;
  payload.currentTurn = 1;
  payload.phase = "conveying";
  payload.correctGuesses = 0;
  payload.totalAttempts = 0;
  payload.timerEndAt = Date.now() + TURN_SECONDS * 1000;
  payload.timeUp = false;
  setPayload(state, payload);
  applyTexts(room.state, payload);
  scheduleTimer(room, payload);
}

function applyTexts(state, payload) {
  const msg = payload.phase === "stageComplete" ? COPY.movingToNextStage : COPY.tvTitle;
  const sub = `${COPY.correctGuessesLabel}: ${payload.correctGuesses || 0} / ${COPY.attemptsLabel}: ${payload.totalAttempts || 0}`;
  setStageTexts(state, msg, sub, sub);
}

function scheduleTimer(room, payload) {
  const delay = Math.max(0, (payload.timerEndAt || 0) - Date.now());
  room.clock.clear();
  room.clock.setTimeout(() => {
    const p = parsePayload(room.state);
    if (p.phase !== "conveying" && p.phase !== "guessing") return;
    p.timeUp = true;
    p.phase = "betweenTurns";
    p.totalAttempts = (p.totalAttempts || 0) + 1;
    p.lastGuessResult = null;
    setPayload(room.state, p);
    applyTexts(room.state, p);
  }, delay);
}

function onEnter(room, state) {
  const payload = addWelcomeState(buildPayload(room));
  setPayload(state, payload);
  applyTexts(state, payload);
}

function onMessage(room, client, type, data, stageIndex) {
  const role = client.userData?.role;
  if (role === "tv") return false;

  if (type === "playerReady") {
    return handleWelcomeReady(room, client, startPlaying);
  }

  const payload = parsePayload(room.state);
  if (payload.welcomeStatus === "welcome") return false;

  if (payload.phase === "stageComplete") return false;

  if (type === "nextGuess" || type === "nextRound") {
    if (payload.phase !== "betweenTurns") return false;
    const nextTurn = payload.currentTurn === 1 ? 2 : 1;
    const genres = payload.favoriteGenres || getGenres(room);
    const guessedSongs = payload.guessedSongs || [];
    const song = pickSong(genres, guessedSongs);
    payload.currentTurn = nextTurn;
    payload.currentSong = song;
    payload.phase = "conveying";
    payload.timerEndAt = Date.now() + TURN_SECONDS * 1000;
    payload.timeUp = false;
    payload.lastGuessResult = null;
    setPayload(room.state, payload);
    applyTexts(room.state, payload);
    scheduleTimer(room, payload);
    return true;
  }

  if (type === "skipSong") {
    if (payload.phase !== "conveying" && payload.phase !== "guessing") return false;
    const conveyer = payload.currentTurn === 1 ? ROLES.PLAYER1 : ROLES.PLAYER2;
    if (role !== conveyer) return false;
    const genres = payload.favoriteGenres || getGenres(room);
    const guessedSongs = payload.guessedSongs || [];
    const song = pickSong(genres, guessedSongs);
    payload.currentSong = song;
    payload.timerEndAt = Date.now() + TURN_SECONDS * 1000;
    payload.timeUp = false;
    setPayload(room.state, payload);
    scheduleTimer(room, payload);
    return true;
  }

  if (type === "submitGuess" || type === "guess") {
    if (payload.phase !== "guessing" && payload.phase !== "conveying") return false;
    const guesser = payload.currentTurn === 1 ? ROLES.PLAYER2 : ROLES.PLAYER1;
    if (role !== guesser) return false;
    const guess = (data && data.guess) ?? (data && data.text) ?? (data && data.songName) ?? "";
    if (typeof guess !== "string" || !guess.trim()) return false;

    const correct = isGuessCorrect(guess, payload.currentSong || {});

    if (correct) {
      payload.totalAttempts = (payload.totalAttempts || 0) + 1;
      payload.correctGuesses = (payload.correctGuesses || 0) + 1;
      payload.lastGuessResult = "correct";
      const key = `${payload.currentSong.songName}|${payload.currentSong.artist}`;
      if (!payload.guessedSongs) payload.guessedSongs = [];
      payload.guessedSongs.push(key);
      payload.phase = "betweenTurns";
      payload.timeUp = false;
      room.clock.clear();
    } else {
      payload.lastGuessResult = "wrong";
    }

    setPayload(room.state, payload);
    applyTexts(room.state, payload);

    if (payload.correctGuesses >= TARGET_CORRECT || payload.totalAttempts >= MAX_ATTEMPTS) {
      payload.phase = "stageComplete";
      setPayload(room.state, payload);
      applyTexts(room.state, payload);
      room.addToHistory(stageIndex, {
        correctGuesses: payload.correctGuesses,
        totalAttempts: payload.totalAttempts,
      });
      room.advanceToInterim(4);
      return true;
    }

    if (correct) return true;
    return true;
  }

  return false;
}

function getInterimTitle() {
  return COPY.getReadyStage4;
}

module.exports = {
  stageIndex: 3,
  onEnter,
  onMessage,
  getInterimTitle,
};
