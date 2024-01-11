const yargs = require('yargs/yargs');

class Config {
  constructor() {
    const argv = yargs(process.argv.slice(2)).argv;
    const buildOnly = argv._[0] === 'build';
    const outdir = argv.outdir || './dist';
    const engine = argv.engine || 'esbuild-stable'; // esbuild-stable, esbuild-experimental
    const analyze = argv.analyze === true ? 'all' : (argv.analyze || '');

    console.log(analyze);

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

    if (engine.startsWith('esbuild')) {
      this.esbuild = {
        entryPoints: ['./src/index.jsx'],
        outdir: outdir,
        minify: argv.minify === undefined ? true : argv.minify !== 'false',
        bundle: true,
        write: false,
        metafile: analyze !== '',
        sourcemap: argv.sourcemap === undefined ? false :  argv.sourcemap !== 'false',
        define: {
          'process.env.NODE_ENV': buildOnly ? '"production"' : '"development"',
        },
      };

      if (engine === 'esbuild-stable') {
        this.esbuild.incremental = buildOnly ? false : true;
      }
    }
  }
}

module.exports = {
  Config
};
