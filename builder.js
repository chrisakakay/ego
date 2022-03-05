const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');

const build = async (config, callback) => {
  const hrstart = process.hrtime();

  if (!config.buildOnly) {
    const files = fs.readdirSync(config.esbuild.outdir).filter(fn => fn.endsWith('.js'));
    for (const file of files) { await fs.removeSync(path.join(config.esbuild.outdir, file)) }
  }

  let result = await esbuild.build(config.esbuild).catch(() => {});

  const hashSum = crypto.createHash('md5');
  hashSum.update(result.outputFiles[0].contents);
  const hex = hashSum.digest('hex').slice(-8);
  fs.writeFileSync(result.outputFiles[0].path.replace('.js', `.${hex}.js`), result.outputFiles[0].contents);

  let html = await fs.readFileSync(config.entryPoint, 'utf8');
  html = html.replace(`src="./index.jsx"`, `src="${path.join(config.publicUrl, `index.${hex}.js`)}"`);
  if (!config.buildOnly && config.dev.livereload) html = html.replace('</body>', `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script></body>`);
  await fs.writeFileSync(path.join(config.esbuild.outdir, 'index.html'), html, { encoding: 'utf8' });

  const hrend = process.hrtime(hrstart);
  console.info('Built in %d.%ss', hrend[0], parseInt(hrend[1] / 1000000, 10).toString().padStart(3, '0'));

  if (callback) callback();
}

const copyStaticFolder = async (config) => {
  await fs.copySync(config.staticFolder, config.esbuild.outdir);
}

const init = async (config) => {
  if (fs.existsSync(config.esbuild.outdir)) {
    await fs.emptyDirSync(config.esbuild.outdir);
  } else {
    await fs.mkdirSync(config.esbuild.outdir);
  }

  await copyStaticFolder(config);

  if (!config.buildOnly && config.dev.watch) {
    const chokidar = require('chokidar');
    const livereload = require('livereload');
    const livereloadServer = livereload.createServer();

    chokidar.watch('./src', { ignoreInitial: true }).on('all', (e, path) => {
      build(config, () => livereloadServer.refresh('/'));
    });

    chokidar.watch(config.staticFolder, { ignoreInitial: true }).on('all', (e, path) => {
      copyStaticFolder(config);
    });
  }
}

module.exports = { init, build };