const fs = require('fs-extra');
const esbuild = require('esbuild');
const { BuilderPrototype } = require('./builderPrototype.js');

class Builder extends BuilderPrototype {
  constructor(config) {
    super(config);
    this.result = undefined;
    console.log(`[esbuild v${esbuild.version}]`);
  }

  async cleanUp() {}

  async analyze() {
    if (!this.result) return;
    if (['save', 'all'].includes(this.config.ego.analyze)) await this.writeManifest(this.result.metafile);
    if (['print', 'all'].includes(this.config.ego.analyze)) console.log(await esbuild.analyzeMetafile(this.result.metafile));
  }

  async build() {
    if (this.result) {
      this.result = await this.result.rebuild().catch(() => {});
    } else {
      this.result = await esbuild.build(this.config.esbuild).catch(() => {});
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
