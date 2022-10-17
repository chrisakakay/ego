const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const app = new Koa();
const fs = require('fs-extra');
const path = require('path');

module.exports.start = (config) => {
  if (config.publicUrl && config.publicUrl !== '/') {
    app.use(mount(config.publicUrl, serve(config.esbuild.outdir)));
  } else {
    app.use(serve(config.esbuild.outdir));
  }

  const indexPath = path.join(config.esbuild.outdir, 'index.html');

  app.use(async ctx => {
    // console.log(ctx.request.url);
    ctx.type = 'html';
    if (fs.existsSync(indexPath)) {
      ctx.body = fs.createReadStream(indexPath);
    } else {
      ctx.body = fs.createReadStream(path.join(__dirname, 'error.html'));
    }
  });

  app.listen(config.port);

  console.log(`Starting dev server on port: ${config.port}`);
};
