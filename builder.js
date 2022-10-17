const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');
const server = require('./server.js');
const lint = require('./lint.js');

let firstBuildResult;
const getBuildResult = async (config) => {
  if (firstBuildResult)  return await firstBuildResult.rebuild().catch(() => {});

  firstBuildResult = await esbuild.build(config.esbuild).catch(() => {});
  return firstBuildResult;
};

const build = async (config, callback) => {
  const hrstart = process.hrtime();

  if (!config.buildOnly) {
    const files = fs.readdirSync(config.esbuild.outdir).filter(fn => fn.startsWith('index.') && fn.endsWith('.js'));
    for (const file of files) { await fs.removeSync(path.join(config.esbuild.outdir, file)); }
    await fs.removeSync(path.join(config.esbuild.outdir, 'index.html'));
  }

  let result = await getBuildResult(config);
  if (result === undefined) {
    if (callback) callback();
    return;
  }

  if (config.buildOnly && config.esbuild.metafile) {
    const metaText = await esbuild.analyzeMetafile(result.metafile);
    console.log(metaText);
  }

  const hashSum = crypto.createHash('md5');
  hashSum.update(result.outputFiles[0].contents);
  const hex = hashSum.digest('hex').slice(-8);
  fs.writeFileSync(result.outputFiles[0].path.replace('.js', `.${hex}.js`), result.outputFiles[0].contents);

  /* eslint-disable quotes */
  let html = await fs.readFileSync(config.entryPoint, 'utf8');
  html = html.replace(`src="./index.jsx"`, `src="${path.join(config.publicUrl, `index.${hex}.js`)}"`);
  if (!config.buildOnly) html = html.replace('</body>', `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script></body>`);
  await fs.writeFileSync(path.join(config.esbuild.outdir, 'index.html'), html, { encoding: 'utf8' });
  /* eslint-enable quotes */

  const hrend = process.hrtime(hrstart);
  console.info('Built in %d.%ss', hrend[0], parseInt(hrend[1] / 1000000, 10).toString().padStart(3, '0'));

  if (callback) callback();
};

const copyStaticFolder = async (config) => {
  if (fs.existsSync(config.staticFolder)) await fs.copySync(config.staticFolder, config.esbuild.outdir);
};

const init = async (config) => {
  if (fs.existsSync(config.esbuild.outdir)) {
    await fs.emptyDirSync(config.esbuild.outdir);
  } else {
    await fs.mkdirSync(config.esbuild.outdir);
  }

  await copyStaticFolder(config);

  if (!config.buildOnly) {
    const chokidar = require('chokidar');
    const livereload = require('livereload');
    const livereloadServer = livereload.createServer();

    chokidar.watch('./src', { ignoreInitial: true }).on('all', async (e, path) => {
      if (config.lint && e !== 'unlink' && (path.endsWith('.js') || path.endsWith('.jsx'))) {
        if (config.lintBlock) {
          const lintSuccess = await lint.lintFiles(config.lintType === 'all' ? './src/**/*.jsx' : path);
          lintSuccess ?
            await build(config, () => livereloadServer.refresh('/')) :
            livereloadServer.refresh('/');
        } else {
          await build(config, () => {
            livereloadServer.refresh('/');
            lint.lintFilesConsole(config.lintType === 'all' ? './src/**/*.jsx' : path);
          });
        }
      } else {
        await build(config, () => livereloadServer.refresh('/'));
      }
    });

    if (fs.existsSync(config.staticFolder)) {
      chokidar.watch(config.staticFolder, { ignoreInitial: true }).on('all', () => {
        copyStaticFolder(config);
      });
    } else {
      console.log(`ERROR: Static folder: '${config.staticFolder}' does not exists!`);
    }
  }

  if (config.lint) {
    await lint.setup(config);

    if (config.lintBlock) {
      const lintSuccess = await lint.lintFiles('./src/**/*.jsx');
      if (lintSuccess) await build(config);
    } else {
      await build(config, () => {
        lint.lintFilesConsole('./src/**/*.jsx');
      });
    }
  } else {
    await build(config);
  }

  if (!config.buildOnly) {
    server.start(config);

    if (config.open) {
      const cp = require('child_process');
      if (process.platform === 'darwin') cp.exec(`open http://localhost:${config.port}${config.publicUrl}`);
      if (process.platform === 'win32') cp.exec(`start http://localhost:${config.port}${config.publicUrl}`);
    }
  }
};

module.exports = { init, build };
