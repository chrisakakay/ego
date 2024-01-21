const { Builder } = require('./builderEsbuild.js');

class Orchestrator {
  constructor(config) {
    this.config = config;
    this.linter = undefined;
    this.builder = new Builder(config);
    this.sever = undefined;
  }

  async init() {
    if (!this.config.ego.buildOnly) {

      const livereload = require('livereload');
      this.livereloadServer = livereload.createServer();

      if (this.config.ego.host) {
        const { Server } = require('./server.js');
        this.server = new Server(this.config);
      }

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

      if (!fs.existsSync('./src')) {
        console.log(`ERROR: source folder: './src' does not exists!`); return;
      }

      const chokidar = require('chokidar');

      if (!this.config.ego.skipStaticFolder) {
        chokidar.watch(this.config.ego.staticFolder, { ignoreInitial: true }).on('all', async () => {
          await this.builder.copyStaticFolder();
        });
      }

      chokidar.watch('./src', { ignoreInitial: true }).on('all', async () => {
        console.clear();
        const fixed = await this.linter.run();
        if (fixed) return;
        await this.builder.devRun();
        this.livereloadServer.refresh('/');
      });

      if (this.config.ego.host) await this.server.start();

      if (this.config.ego.open) await this.openBrowser();
    }
  }
}

module.exports = {
  Orchestrator
};
