export interface OurSoundtrackSong {
  songName: string;
  artist: string;
  genre: string;
}

export interface OurSoundtrackPayload {
  phase?: "welcome" | "conveying" | "betweenTurns" | "stageComplete";
  welcomeStatus?: string;
  welcomeP1Ready?: boolean;
  welcomeP2Ready?: boolean;
  currentTurn?: 1 | 2;
  currentSong?: OurSoundtrackSong;
  correctGuesses?: number;
  totalAttempts?: number;
  guessedSongs?: string[];
  timerEndAt?: number;
  timeUp?: boolean;
  favoriteGenres?: string[];
  lastGuessResult?: "correct" | "wrong" | null;
}

export function parseOurSoundtrackPayload(json: string): OurSoundtrackPayload {
  try {
    const p = JSON.parse(json || "{}");
    return {
      phase: p.phase,
      welcomeStatus: p.welcomeStatus,
      welcomeP1Ready: p.welcomeP1Ready,
      welcomeP2Ready: p.welcomeP2Ready,
      currentTurn: p.currentTurn,
      currentSong: p.currentSong,
      correctGuesses: p.correctGuesses,
      totalAttempts: p.totalAttempts,
      guessedSongs: p.guessedSongs,
      timerEndAt: p.timerEndAt,
      timeUp: p.timeUp,
      favoriteGenres: p.favoriteGenres,
      lastGuessResult: p.lastGuessResult,
    };
  } catch {
    return {};
  }
}
