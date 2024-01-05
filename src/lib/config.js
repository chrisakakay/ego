const yargs = require('yargs/yargs');

class Config {
  constructor() {
    const argv = yargs(process.argv.slice(2)).argv;
    const buildOnly = argv._[0] === 'build';
    const outdir = argv.outdir || './dist';
    const engine = argv.engine || 'esbuild-stable';

    this.ego = {
      entryPoint: './src/index.html',
      staticFolder: argv.staticdir || './static',
      outdir: outdir,
      buildOnly: buildOnly,
      liveReload: !buildOnly,
      analyze: argv.analyze !== undefined,
      open: argv.open !== undefined,
      lint: argv.lint !== undefined,
      lintFix: argv.lintFix !== undefined,
      engine: engine
    };

    this.server = {
      publicUrl: argv.publicUrl || '/',
      port: argv.port || 8080,
    };

    if (engine === 'esbuild-stable') {
      this.esbuild = {
        entryPoints: ['./src/index.jsx'],
        outdir: outdir,
        minify: argv.minify === undefined ? true : argv.minify !== 'false',
        bundle: true,
        write: false,
        incremental: buildOnly ? false : true,
        metafile: argv.analyze !== undefined,
        define: {
          'process.env.NODE_ENV': buildOnly ? '"production"' : '"development"'
        },
        sourcemap: argv.sourcemap === undefined ? false :  argv.sourcemap !== 'false'
      };
    }

    if (engine === 'esbuild-experimental') {
      this.esbuild = {
        entryPoints: ['./src/index.jsx'],
        outdir: outdir,
        minify: argv.minify === undefined ? true : argv.minify !== 'false',
        bundle: true,
        write: false,
        metafile: argv.analyze !== undefined,
        define: {
          'process.env.NODE_ENV': buildOnly ? '"production"' : '"development"'
        },
        sourcemap: argv.sourcemap === undefined ? false :  argv.sourcemap !== 'false'
      };
    }
  }
}

module.exports = {
  Config
};
