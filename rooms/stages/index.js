/**
 * Stage registry. Each stage lives in its own folder (named by id).
 * Order is defined in config/stageOrder.json.
 */
const path = require("path");

const STAGE_ORDER_PATH = path.join(process.cwd(), "config", "stageOrder.json");
const stageOrder = require(STAGE_ORDER_PATH);

const STAGES = stageOrder.map((id, i) => {
  const mod = require("./" + id);
  return { ...mod, stageIndex: i + 1 };
});

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
