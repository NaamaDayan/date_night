/**
 * Dummy stages 6–9 for testing the 9-lock progress screen flow.
 * Each stage just shows a placeholder; "returnToProgress" is handled in GameRoom.
 */

const { setStageTexts, setPayload } = require("./IStage.js");

function createDummyStage(stageIndex) {
  return {
    stageIndex,
    onEnter(room, state) {
      setStageTexts(state, `Stage ${stageIndex}`, "Complete this step.", "Complete this step.");
      setPayload(state, { dummy: true, stageIndex });
    },
    onMessage(room, client, type) {
      if (type === "returnToProgress") {
        return true;
      }
      return false;
    },
    getInterimTitle() {
      return `Get ready for Stage ${stageIndex}`;
    },
  };
}

const stage6 = createDummyStage(6);
const stage7 = createDummyStage(7);
const stage8 = createDummyStage(8);
const stage9 = createDummyStage(9);

module.exports = { stage6, stage7, stage8, stage9 };
