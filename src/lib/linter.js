const { Stopper } = require('./stopper.js');

class Linter {
  constructor(config) {
    this.config = config;
    this.results = undefined;
  }

  async init() {
    const { ESLint } = require('eslint');
    this.eslint = new ESLint({ cache: true });
    this.eslintFix = new ESLint({ cache: true, fix: true });
    this.formatter = { pretty: await this.eslint.loadFormatter('stylish') };
    this.write = async (f) => await ESLint.outputFixes(f);
  }

  async format(results) {
    return {
      resultText: this.formatter.pretty.format(results),
      errorCount: results.reduce((p, c) => p + c.errorCount, 0)
    };
  }

  async lint(file) {
    this.results = await this.eslint.lintFiles([file]);
  }

  async fix(file) {
    if (this.config.ego.lint !== 'fix') return false;

    const fixable = this.results.reduce((p, c) => p + c.fixableErrorCount + c.fixableWarningCount, 0);

    if (fixable > 0) {
      await this.write(await this.eslintFix.lintFiles([file]));//ESLint.outputFixes(await this.eslintFix.lintFiles([file]));
      return true;
    }

    return false;
  }

  async showErrors() {
    let { resultText, errorCount } = await this.format(this.results);
    if (errorCount > 0) console.log(resultText);
  }

  async run(file = './src/**/*.jsx') {
    let stopper = new Stopper({total: 'Linted in (total) \t\t' }).start();

    await this.lint(file);
    const fixed = await this.fix(file);

    if (fixed) {
      stopper.cancel();
      return fixed;
    }

    await this.showErrors();
    stopper.stop();
    return fixed;
  }

  async cleanRun(file = './src/**/*.jsx') {
    let stopper = new Stopper({total: 'Linted in (total) \t\t' }).start();

    await this.lint(file);
    await this.showErrors();
    stopper.stop();
  }
}

module.exports = {
  Linter
};
