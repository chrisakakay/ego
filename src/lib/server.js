const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const fs = require('fs-extra');
const path = require('path');

class Server {
  constructor(config) {
    this.app = new Koa();
    this.config = config;
  }

  start() {
    let { port, publicUrl } = this.config.server;
    let { outdir } = this.config.esbuild;

    this.app.use(publicUrl === '/' ? serve(outdir) : mount(publicUrl, serve(outdir)));

    this.app.use(async ctx => { // console.log(ctx.request.url);
      ctx.type = 'html';

      try {
        const indexHtml = path.join(outdir, 'index.html');
        ctx.body = fs.createReadStream(indexHtml);
      } catch (err) {
        ctx.body = 'Not Found';
      }
    });

    this.app.listen(port);

    console.log(`\nStarting dev server on port: ${port}`);
  }
}

module.exports = {
  Server
};
