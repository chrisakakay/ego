const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const { Stopper } = require('./stopper.js');

class BuilderPrototype {
  constructor(config) {
    this.config = config;
  }

  async build() {
    console.log('[BulderPrototype:build()] This is an empty method. Implement your logic.');
  }

  async analyze() {
    console.log('[BulderPrototype:analyze()] This is an empty method. Implement your logic.');
  }

  async writeResultsToFiles() {
    console.log('[BulderPrototype:writeResultsToFiles()] This is an empty method. Implement your logic. [Return a content hash]');
  }

  async cleanUp() {
    console.log('[BulderPrototype:cleanUp()] This is an empty method. Implement your logic.');
  }

  async createOrEmptyDist() {
    let { outdir } = this.config.ego;

    if (fs.existsSync(outdir)) {
      await fs.emptyDirSync(outdir);
    } else {
      await fs.mkdirSync(outdir);
    }
  }

  async copyStaticFolder() {
    if (fs.existsSync(this.config.ego.staticFolder)) await fs.copySync(this.config.ego.staticFolder, this.config.ego.outdir);
  }

  async getContentHash(content) {
    if (!this.config.ego.buildOnly) return undefined;
    return await crypto.createHash('md5').update(content).digest('hex').slice(-8);
  }

  async writeHTMLFile(hex) {
    let html = await fs.readFileSync(this.config.ego.entryPoint, 'utf8');
    html = html.replace(`src="./index.jsx"`, `src="${path.join(this.config.ego.publicUrl, this.config.ego.buildOnly ? `index.${hex}.js` : 'index.js')}"`);
    if (this.config.ego.liveReload) html = html.replace('</body>', `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script></body>`);
    await fs.writeFileSync(path.join(this.config.esbuild.outdir, 'index.html'), html, { encoding: 'utf8' });
  }

  async writeManifest(content) {
    await fs.writeFileSync(path.join(this.config.esbuild.outdir, 'asset-manifest.json'), JSON.stringify(content));
  }

  async cleanRun() {
    let stopper = new Stopper({ header: 'Build log:', total: 'Built in (total) \t\t' }).start();

    await this.createOrEmptyDist(); stopper.click('-> clean dist folder \t\t');
    await this.copyStaticFolder(); stopper.click('-> static folder copy \t\t');
    await this.build(); stopper.click('-> build js (esbuild) \t\t');
    const hex = await this.writeResultsToFiles(); stopper.click('-> write files to fs \t\t');
    await this.writeHTMLFile(hex); stopper.click('-> write html to fs \t\t');

    if (this.config.ego.analyze !== '') {
      await this.analyze(); stopper.click('-> analyze \t\t\t');
    }

    stopper.stop();
  }

  async devRun() {
    let stopper = new Stopper({ total: 'Built in (total) \t\t' }).start();

    await this.build();
    const hex = await this.writeResultsToFiles();
    await this.writeHTMLFile(hex);
    if (this.config.ego.analyze !== '') await this.analyze();

    stopper.stop();
  }
}

module.exports = {
  BuilderPrototype
};
