const path = require('path');
const express = require('express');

class Server {
  constructor(config) {
    this.app = new express();
    this.config = config;
    this.server = undefined;
  }

  async start() {
    let { port, publicUrl } = this.config.ego;
    let { outdir } = this.config.esbuild;

    (publicUrl === '/') ?
      this.app.use(express.static(outdir)) :
      this.app.use(publicUrl, express.static(outdir));

    this.app.get('*', (req, res) => {
      res.sendFile(path.resolve(outdir, 'index.html'));
    });

    this.server = await this.app.listen(port);
    console.log(`\nServer started on port: ${port}`);
  }
}

module.exports = {
  Server
};
