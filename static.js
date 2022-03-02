const fs = require('fs-extra');
const { build } = require('esbuild');

module.exports.copy = (config) => {
  for (const folder of config.staticFolders) {
    fs.copy(folder.entryPoint, folder.outPoint);
  }
}
