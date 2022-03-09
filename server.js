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
      ctx.body = `<html style="font-family: Arial; padding: 50px;">
        <p style="text-align: center;">Something went wrong!</p>
        <p style="text-align: center;">Check if the build was successful.</p>
        <p style="text-align: center;">This page only shows if the 'index.html' is missing from the build folder.</p>
      </html>`;
    }
  });

  app.listen(config.port);

  console.log(`Starting dev server on port: ${config.port}`);
}
