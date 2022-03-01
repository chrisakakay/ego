const args = process.argv.slice(2);
const isDev = args[0] !== 'build';
const fs = require('fs-extra');
const { build } = require('esbuild');
let livereloadServer;

const config = {
  buildPath: './dist',
  publicUrl: '/',
  htmlFiles: [
    { entryPoint: './src/index.html', outPoint: './dist/index.html' }
  ],
  esbuild: {
    entryPoints: ["./src/index.jsx"],
    outdir: './dist',
    minify: true,
    bundle: true
  },
  dev: {
    livereload: true,
    watch: true,
    serve: true,
    port: 8080
  }
};

const generateBuild = async () => {
  const hrstart = process.hrtime();

  if (fs.existsSync(config.buildPath)) {
    await fs.emptyDirSync(config.buildPath);
  } else {
    await fs.mkdirSync(config.buildPath);
  }

  for (const file of config.htmlFiles) {
    if (config.dev && config.dev.livereload) {
      let html = await fs.readFileSync(file.entryPoint, 'utf8');
      html = html.replace('</body>', `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script></body>`);
      await fs.writeFileSync(file.outPoint, html, { encoding: 'utf8' });
    } else {
      await fs.copySync(file.entryPoint, file.outPoint);
    }
  }

  await build({
    entryPoints: config.esbuild.entryPoints,
    outdir: config.esbuild.outdir,
    minify: config.esbuild.minify || true,
    bundle: config.esbuild.bundle || true
  }).catch(() => {});

  const hrend = process.hrtime(hrstart);
  console.info('Built in %d.%ss', hrend[0], parseInt(hrend[1] / 1000000, 10).toString().padStart(3, '0'));
  if (livereloadServer) livereloadServer.refresh('/');
}

if (isDev && config.dev.livereload) {
  const livereload = require('livereload');
  livereloadServer = livereload.createServer();
}

if (isDev && config.dev.watch) {
  const chokidar = require('chokidar');
  chokidar.watch('./src', { ignoreInitial: true }).on('all', (e, path) => {
    // console.log(e, path);
    generateBuild();
  });
}

if (isDev && config.dev.serve) {
  const serve = require('koa-static');
  const Koa = require('koa');
  const app = new Koa();

  app.use(serve(config.buildPath));
  app.listen(config.dev.port || 8080);

  console.log(`Starting dev server on port: ${config.dev.port || 8080}`);

  if (config.dev.open) {
    require('child_process').exec(`start http://localhost:${config.dev.port || 8080}${config.publicUrl}`);
  }
}

generateBuild();
