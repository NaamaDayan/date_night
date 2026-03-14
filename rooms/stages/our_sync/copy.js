/** Stage copy – from config/copy/stage_our_sync.json */
const path = require("path");
module.exports = require("../copyLoader.js").getStageCopy(path.basename(__dirname));
