/**
 * Stage 2 puzzle: base text and highlight indexes.
 * Edit baseText and the index arrays without touching game logic.
 * Combined highlighted letters (sorted by index) form the hidden sentence:
 * "עוד כמה דקות השעון יראה את שנת ההיכרות שלכם?"
 */

const HIDDEN_SENTENCE = "עוד כמה דקות השעון יראה את שנת ההיכרות שלכם?";
const HIDDEN_START_INDEX = 60;

function buildBaseText() {
  const before = "בואו נשחק יחד. יש כאן טקסט ארוך שמסתיר משפט סודי. תמצאו את האותיות המסומנות ותבינו מה הכתוב. ";
  const after = " בהצלחה!";
  const arr = [...before];
  while (arr.length < HIDDEN_START_INDEX) {
    arr.push(".");
  }
  for (let i = 0; i < HIDDEN_SENTENCE.length; i++) {
    arr[HIDDEN_START_INDEX + i] = HIDDEN_SENTENCE[i];
  }
  return arr.join("") + after;
}

export const baseText = buildBaseText();

const allIndexes = [];
for (let i = 0; i < HIDDEN_SENTENCE.length; i++) {
  allIndexes.push(HIDDEN_START_INDEX + i);
}
export const player1HighlightIndexes = allIndexes.filter((_, i) => i % 2 === 0);
export const player2HighlightIndexes = allIndexes.filter((_, i) => i % 2 === 1);
