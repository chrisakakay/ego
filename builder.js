const fs = require('fs-extra');
const { build } = require('esbuild');

module.exports.generate = async (config, callback) => {
  const hrstart = process.hrtime();

  if (fs.existsSync(config.buildPath)) {
    await fs.emptyDirSync(config.buildPath);
  } else {
    await fs.mkdirSync(config.buildPath);
  }

  for (const file of config.htmlFiles) {
    let html = await fs.readFileSync(file.entryPoint, 'utf8');

    html = html.replace('<script src="./index.jsx"></script>', `<script src="${config.publicUrl}index.js"></script>`);

    if (config.dev.livereload) html = html.replace('</body>', `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script></body>`);

    await fs.writeFileSync(file.outPoint, html, { encoding: 'utf8' });
  }

  await build(config.esbuild).catch(() => {

  });

  const hrend = process.hrtime(hrstart);
  console.info('Built in %d.%ss', hrend[0], parseInt(hrend[1] / 1000000, 10).toString().padStart(3, '0'));
  if (callback) callback();
}
