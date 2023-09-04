const yargs = require('yargs/yargs');

class Config {
  constructor() {
    const argv = yargs(process.argv.slice(2)).argv;
    const buildOnly = argv._[0] === 'build';

    this.ego = {
      entryPoint: './src/index.html',
      staticFolder: argv.staticdir || './static',
      buildOnly: buildOnly,
      liveReload: !buildOnly,
      open: argv.open !== undefined,
      lint: argv.lint !== undefined
    };

    this.server = {
      publicUrl: argv.publicUrl || '/',
      port: argv.port || 8080,
    }

    this.esbuild = {
      entryPoints: ['./src/index.jsx'],
      outdir: argv.outdir || './dist',
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
}

module.exports = {
  Config
};
