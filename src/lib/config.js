const fs = require('fs-extra');

class Config {
  constructor(argv) {
    const buildOnly = Array.isArray(argv._) && argv._[0] === 'build';
    const outdir = argv.outdir || './dist';
    const engine = argv.engine || 'esbuild-standard'; // esbuild-standard, esbuild-svelte
    const analyze = argv.analyze === true ? 'all' : (argv.analyze || '');
    const lint = argv.lint === undefined ? '' : (argv.lint || 'warn');

    this.ego = {
      entryPoint: './src/index.html',
      staticFolder: argv.staticdir || './static',
      outdir: outdir,
      buildOnly: buildOnly,
      liveReload: !buildOnly,
      open: argv.open !== undefined,
      lint: lint,
      analyze: analyze,
      engine: engine,
      publicUrl: argv.publicUrl || '/',
      port: argv.port || 8080,
      host: argv.host === 'false' || argv.host === false ? false : true,
      clearConsole: argv.clearConsole === 'false' || argv.clearConsole === false ? false : true,
    };

    if (!fs.existsSync(this.ego.staticFolder)) {
      this.ego.skipStaticFolder = true;
    }

    this.esbuild = {
      entryPoints: ['./src/index.jsx'],
      outdir: outdir,
      minify: buildOnly ? true : false,
      bundle: true,
      write: false,
      metafile: analyze !== '',
      sourcemap: argv.sourcemap === 'false' || argv.sourcemap === false ? false : true,
      define: {
        'process.env.NODE_ENV': buildOnly ? '"production"' : '"development"',
      },
    };

    if (engine === 'esbuild-svelte') {
      const { sveltePlugin } = require('./plugins/esbuildSvelte.js');
      this.esbuild.plugins = [sveltePlugin];
    }
  }
}

module.exports = {
  Config
};
