/**
 * Stage registry. Each stage lives in its own folder (1–6).
 */
const stage1 = require("./1");
const stage2 = require("./2");
const stage3 = require("./3");
const stage4 = require("./4");
const stage5 = require("./5");
const stage6 = require("./6");

const STAGES = [stage1, stage2, stage3, stage4, stage5, stage6];

const GAME_STATE = {
  WAITING_FOR_START: "WAITING_FOR_START",
  NAME_ENTRY: "NAME_ENTRY",
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
