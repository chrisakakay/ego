const fs = require('fs-extra');
const path = require('path');

let config, eslint, eslintFormatterPretty, eslintFormatterJSON;

const formatResults = (results) => {
  return {
    resultJSON: eslintFormatterJSON.format(results),
    resultText: eslintFormatterPretty.format(results),
    errorCount: results.reduce((p, c) => p + c.errorCount, 0)
  };
};

module.exports.setup = async (c) => {
  config = c;
  const { ESLint } = require('eslint');
  eslint = new ESLint();
  eslintFormatterPretty = await eslint.loadFormatter('stylish');
  eslintFormatterJSON = await eslint.loadFormatter('json');
};

module.exports.lintFiles = async (file) => {
  const hrstart = process.hrtime();

  await fs.removeSync(path.join(config.esbuild.outdir, 'eslint.json'));
  const results = await eslint.lintFiles([file]);
  let { resultJSON, resultText, errorCount } = formatResults(results);

  if (errorCount > 0) {
    console.log(resultText);
    await fs.removeSync(path.join(config.esbuild.outdir, 'index.html'));
    if (!config.buildOnly) await fs.writeFileSync(path.join(config.esbuild.outdir, 'eslint.json'), resultJSON, { encoding: 'utf8' });
  }

  const hrend = process.hrtime(hrstart);
  console.info('Linted in %d.%ss', hrend[0], parseInt(hrend[1] / 1000000, 10).toString().padStart(3, '0'));

  return errorCount === 0;
};

module.exports.lintFilesConsole = (file) => {
  const hrstart = process.hrtime();

  eslint.lintFiles([file]).then((results) => {
    let { resultText, errorCount } = formatResults(results);

    if (errorCount > 0) console.log(resultText);

    const hrend = process.hrtime(hrstart);
    console.info('Linted in %d.%ss', hrend[0], parseInt(hrend[1] / 1000000, 10).toString().padStart(3, '0'));
  });
};
