/**
 * Shared copy – re-export from repo-level config/copy/ via copyLoader.
 * No duplicate string literals; all from config/copy/shared.json.
 */
const loader = require("./copyLoader.js");
module.exports = {
  get SHARED() {
    return loader.SHARED;
  },
  applyTemplate: loader.applyTemplate,
  getStageCopy: loader.getStageCopy,
};
