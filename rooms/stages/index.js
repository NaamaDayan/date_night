/**
 * Stage registry. Add new stage files here.
 */
const stage1 = require("./stage1Logic.js");
const stage2 = require("./stage2Logic.js");
const stage3 = require("./stage3Logic.js");

const STAGES = [stage1, stage2, stage3];

const GAME_STATE = {
  WAITING_FOR_START: "WAITING_FOR_START",
  IN_PROGRESS: "IN_PROGRESS",
  INTERIM_SCREEN: "INTERIM_SCREEN",
  ENDED: "ENDED",
};

function getStage(index) {
  return STAGES.find((s) => s.stageIndex === index) || null;
}

function getStageCount() {
  return STAGES.length;
}

module.exports = {
  STAGES,
  GAME_STATE,
  getStage,
  getStageCount,
};
