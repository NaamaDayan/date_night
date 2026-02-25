export const COPY = {
  // TV
  tvTitle: "He Said · She Said",
  tvSubtitle: "כל תשובה זהה חושפת עוד חלק מהתמונה",
  tvFinalPrompt: "התמונה כמעט ברורה. כתבו מה לדעתכם מופיע בה.",
  tvResultsWin: "WIN",
  tvResultsLose: "כמעט…",

  // Shared labels
  statsLabel: "תוצאות",
  blurLabel: "רמת טשטוש",
  matchesLabel: "תואמים",

  // Phone – questions
  phoneStageTitle: "He Said · She Said",
  phoneQuestionIntro: "מי מכם יותר...",
  meOption: "אני",
  guessButton: "יש לי ניחוש",

  // Phone – final prompt
  finalPromptTitle: "מה יש בתמונה?",
  finalPromptSub: "תכתבו מה אתם חושבים שמסתתר שם",
  finalPromptPlaceholder: "",
  finalPromptSubmit: "שליחה",

  // Phone – results
  resultsTitleWin: "אתם על אותו גל 💛",
  resultsTitleLose: "כמעט…",
  resultsWhoGuessed: (name: string) => `מי שניחש/ה נכון: ${name}`,
  resultsNoWinner: "לא היה ניחוש נכון",
  continueButton: "המשך",

  // Guess toast
  guessWrong: "לא הפעם",
  guessCorrect: "נכון! 💛",
} as const;

