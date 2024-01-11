class Orchestrator {
  constructor(config) {
    this.config = config;
    this.linter = undefined;
    if (config.ego.engine === 'esbuild-stable') {
      const { Builder } = require('./builderV1.js');
      this.builder = new Builder(config);
    }
    if (config.ego.engine === 'esbuild-experimental') {
      const { Builder } = require('./builderV2.js');
      this.builder = new Builder(config);
    }
  }

  async init() {
    if (!this.config.ego.buildOnly) {
      const { Server } = require('./server.js');
      const livereload = require('livereload');
      this.server = new Server(this.config);
      this.livereloadServer = livereload.createServer();

      if (this.config.ego.lint) {
        const { Linter } = require('./linter.js');

        this.linter = new Linter(this.config);
        await this.linter.init();
      }
    }
  }

  async openBrowser() {
    const cp = require('child_process');
    if (process.platform === 'darwin') cp.exec(`open http://localhost:${this.config.ego.port}${this.config.ego.publicUrl}`);
    if (process.platform === 'win32') cp.exec(`start http://localhost:${this.config.ego.port}${this.config.ego.publicUrl}`);
  }

  async run() {
    await this.init();

    if (this.config.ego.buildOnly) {
      await this.builder.cleanRun();
      await this.builder.cleanUp();

      return;
    } else {
      const fs = require('fs-extra');

      console.clear();

      await this.linter.cleanRun();
      await this.builder.cleanRun();

      const chokidar = require('chokidar');
      const { staticFolder } = this.config.ego;

      if (!fs.existsSync(staticFolder)) {
        console.log(`ERROR: Static folder: '${staticFolder}' does not exists!`); return;
      }

      if (!fs.existsSync('./src')) {
        console.log(`ERROR: source folder: './src' does not exists!`); return;
      }

      chokidar.watch(staticFolder, { ignoreInitial: true }).on('all', async () => {
        await this.builder.copyStaticFolder();
      });

      chokidar.watch('./src', { ignoreInitial: true }).on('all', async () => {
        console.clear();
        const fixed = await this.linter.run();
        if (fixed) return;
        await this.builder.devRun();
        this.livereloadServer.refresh('/');
      });

      await this.server.start();

      if (this.config.ego.open) await this.openBrowser();
    }
  }
}

module.exports = {
  Orchestrator
};
