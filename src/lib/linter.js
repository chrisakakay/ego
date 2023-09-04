const { Stopper } = require('./stopper.js');

class Linter {
  constructor(config) {
    this.config = config;
    this.results = undefined;
  }

  async init() {
    const { ESLint } = require('eslint');
    this.eslint = new ESLint(this.config.ego.buildOnly ? {} : { cache: true });
    this.formatter = {
      pretty: await this.eslint.loadFormatter('stylish'),
      //json: await eslint.loadFormatter('json')
    };
  }

  async format(results) {
    return {
      //resultJSON: eslintFormatterJSON.format(this.results),
      resultText: this.formatter.pretty.format(results),
      errorCount: results.reduce((p, c) => p + c.errorCount, 0)
    };
  }

  async run(file = './src/**/*.jsx') {
    if (!this.config.ego.lint) return;

    let stopper = new Stopper({ header: 'Lint log:', total: 'Linted in (total) \t\t' }).start();

    await this.eslint.lintFiles([file]).then(async (results) => {
      stopper.click('-> running lint \t\t');

      let { resultText, errorCount } = await this.format(results);
      stopper.click('-> formatting \t\t\t');
      if (errorCount > 0) console.log(resultText);

      stopper.stop();
    });
  }
}

module.exports = {
  Linter
};
