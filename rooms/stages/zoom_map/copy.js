/** Stage copy – from config/copy/stage_<id>.json */
const path = require("path");
module.exports = require("../copyLoader.js").getStageCopy(path.basename(__dirname));
