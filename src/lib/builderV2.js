const fs = require('fs-extra');
const esbuild = require('esbuildM');
const { BuilderPrototype } = require('./builderPrototype.js');

class Builder extends BuilderPrototype {
  constructor(config) {
    super(config);
    this.result = undefined;
    this.context = undefined;
    console.log(`[esbuild v${esbuild.version}]`);
  }

  async cleanUp() {
    this.context.dispose();
  }

  async analyze() {
    if (this.result) console.log(await esbuild.analyzeMetafile(this.result.metafile));
  }

  async build() {
    if (this.result) {
      this.result = await this.context.rebuild().catch(() => {});
    } else {
      this.context = await esbuild.context(this.config.esbuild).catch(() => {});
      this.result = await this.context.rebuild();
    }
  }

  async writeResultsToFiles() {
    if (!this.result) {
      console.log('ERROR: Can not write build to fs'); return;
    }

    let hex = await this.getContentHash(this.result.outputFiles.find(file => file.path.endsWith('index.js')).contents);

    for (const file of this.result.outputFiles) {
      await fs.writeFileSync(this.config.ego.buildOnly ? file.path.replace('.js', `.${hex}.js`) : file.path, file.contents);
    }

    return hex;
  }
}

module.exports = {
  Builder
};
