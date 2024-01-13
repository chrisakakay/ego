const yargs = require('yargs/yargs');
const fs = require('fs-extra');

class Config {
  constructor() {
    const argv = yargs(process.argv.slice(2)).argv;
    const buildOnly = argv._[0] === 'build';
    const outdir = argv.outdir || './dist';
    const engine = argv.engine || 'esbuild-standard'; // esbuild-standard, esbuild-svelte
    const analyze = argv.analyze === true ? 'all' : (argv.analyze || '');

    this.ego = {
      entryPoint: './src/index.html',
      staticFolder: argv.staticdir || './static',
      outdir: outdir,
      buildOnly: buildOnly,
      liveReload: !buildOnly,
      open: argv.open !== undefined,
      lint: argv.lint !== undefined,
      lintFix: argv.lintFix !== undefined,
      analyze: analyze,
      engine: engine,
      publicUrl: argv.publicUrl || '/',
      port: argv.port || 8080,
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
      sourcemap: argv.sourcemap === 'false' ? false : true,
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
