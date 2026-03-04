/**
 * Stage 2: Year puzzle – hidden sentence + number input.
 * Winning: currentTime (HHMM as number) + enteredNumber === yearOfMeeting.
 * One correct submit advances all to next stage.
 */

const { setStageTexts, getQuestionnaire, setPayload, parsePayload } = require("./IStage.js");
const { ROLES } = require("../../shared/constants.js");

const STAGE_INDEX = 2;

function getNowHHMMAsNumber() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours * 100 + minutes;
}

function onEnter(room, state) {
  const q = getQuestionnaire(room);
  const title = `שנת ההיכרות — ${q.partner1Name} & ${q.partner2Name}`;
  setStageTexts(state, title, title, title);
  setPayload(state, { stageComplete: false });
}

function onMessage(room, client, type, data) {
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  const payload = parsePayload(room.state);
  if (payload.stageComplete) return false;

  if (type !== "submit" && type !== "numberSubmit") return false;

  const raw = data?.number ?? data?.value ?? data;
  const entered = Number(raw);
  if (!Number.isInteger(entered)) return false;

  const yearOfMeeting = room.state.yearOfMeeting ?? 0;
  const nowValue = getNowHHMMAsNumber();
  if (nowValue + entered !== yearOfMeeting) return true;

  payload.stageComplete = true;
  setPayload(room.state, payload);
  room.addToHistory(STAGE_INDEX, { solved: true });
  room.advanceToInterim(3);
  return true;
}

function getInterimTitle() {
  return "Get ready for Stage 3!";
}

module.exports = {
  stageIndex: STAGE_INDEX,
  onEnter,
  onMessage,
  getInterimTitle,
};
