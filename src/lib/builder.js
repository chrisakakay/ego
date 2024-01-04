const fs = require('fs-extra');
const esbuild = require('esbuild');
const crypto = require('crypto');
const path = require('path');
const { Stopper } = require('./stopper.js');

class Builder {
  constructor(config) {
    this.config = config;
    this.result = undefined;
  }

  async createOrEmptyDist() {
    let { outdir } = this.config.esbuild;

    if (fs.existsSync(outdir)) {
      await fs.emptyDirSync(outdir);
    } else {
      await fs.mkdirSync(outdir);
    }
  }

  async copyStaticFolder() {
    if (fs.existsSync(this.config.ego.staticFolder)) await fs.copySync(this.config.ego.staticFolder, this.config.esbuild.outdir);
  }

  async analyze() {
    if (this.result) {
      const metaText = await esbuild.analyzeMetafile(this.result.metafile);
      console.log(metaText);
    } else {
      console.log('ERROR: Can not analyze build');
    }
  }

  async writeResultsToFiles() {
    if (!this.result) {
      console.log('ERROR: Can not write build to fs'); return;
    }

    let { buildOnly, liveReload } = this.config.ego;
    let { outputFiles } = this.result;
    let hex = buildOnly ? crypto.createHash('md5').update(outputFiles.find(f => f.path.endsWith('index.js')).contents).digest('hex').slice(-8) : undefined;

    for (const file of outputFiles) {
      await fs.writeFileSync(buildOnly ? file.path.replace('.js', `.${hex}.js`) : file.path, file.contents);
    }

    let html = await fs.readFileSync(this.config.ego.entryPoint, 'utf8');
    html = html.replace(`src="./index.jsx"`, `src="${path.join(this.config.server.publicUrl, buildOnly ? `index.${hex}.js` : 'index.js')}"`);
    if (liveReload) html = html.replace('</body>', `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script></body>`);
    await fs.writeFileSync(path.join(this.config.esbuild.outdir, 'index.html'), html, { encoding: 'utf8' });
  }

  async build() {
    if (this.result) {
      this.result = await this.result.rebuild().catch(() => {});
    } else {
      this.result = await esbuild.build(this.config.esbuild).catch(() => {});
    }
  }

  async cleanRun() {
    let stopper = new Stopper({ header: 'Build log:', total: 'Built in (total) \t\t' }).start();

    await this.createOrEmptyDist(); stopper.click('-> clean dist folder \t\t');
    await this.copyStaticFolder(); stopper.click('-> static folder copy \t\t');
    await this.build(); stopper.click('-> build js (esbuild) \t\t');
    await this.writeResultsToFiles(); stopper.click('-> write files to fs \t\t');

    if (this.config.esbuild.metafile && this.config.ego.buildOnly) {
      await this.analyze(); stopper.click('-> analyze \t\t\t');
    }

    stopper.stop();
  }

  async devRun() {
    let stopper = new Stopper({ total: 'Built in (total) \t\t' }).start();

    await this.build();
    await this.writeResultsToFiles();

    stopper.stop();
  }
}

module.exports = {
  Builder
};
