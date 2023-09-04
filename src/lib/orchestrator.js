const fs = require('fs-extra');
const { Server } = require('./server.js');
const { Builder } = require('./builder.js');
const { Linter } = require('./linter.js');

class Orchestrator {
  constructor(config) {
    this.config = config;
    this.builder = new Builder(config);
    this.linter = new Linter(config);
  }

  async init() {
    if (!this.config.ego.buildOnly) {
      const livereload = require('livereload');
      this.server = new Server(this.config);
      this.livereloadServer = livereload.createServer();
    }

    if (this.config.ego.lint) await this.linter.init();
  }

  openBrowser() {
    const cp = require('child_process');
    if (process.platform === 'darwin') cp.exec(`open http://localhost:${this.config.server.port}${this.config.server.publicUrl}`);
    if (process.platform === 'win32') cp.exec(`start http://localhost:${this.config.server.port}${this.config.server.publicUrl}`);
  }

  async run() {
    await this.init();

    if (this.config.ego.buildOnly) {
      await this.builder.cleanRun();
      await this.linter.run();

      return;
    } else {
      console.clear();

      await this.builder.cleanRun();
      await this.linter.run();

      this.server.start();

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
        console.clear()
        await this.builder.devRun();
        await this.linter.run();
        this.livereloadServer.refresh('/');
      });

      if (this.config.ego.open) this.openBrowser();
    }
  }
}

module.exports = {
  Orchestrator
};
