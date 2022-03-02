const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const app = new Koa();
const fs = require('fs');

module.exports.start = (config) => {
  if (config.publicUrl && config.publicUrl !== '/') {
    app.use(mount(config.publicUrl, serve(config.buildPath)));
  } else {
    app.use(serve(config.buildPath));
  }

  app.use(async ctx => {
    // console.log(ctx.request.url);
    ctx.type = 'html';
    ctx.body = fs.createReadStream(config.htmlFiles[0].outPoint);
  });

  app.listen(config.dev.port|| 8080);

  console.log(`Starting dev server on port: ${config.dev.port || 8080}`);
}
