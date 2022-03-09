#!/usr/bin/env node

const yargs = require('yargs/yargs');
const argv = yargs(process.argv.slice(2)).argv;
const builder = require('./builder.js');

const buildOnly = argv._[0] === 'build';
let livereloadServer;

const config = {
  publicUrl: argv.publicUrl || '/',
  entryPoint: './src/index.html',
  staticFolder: argv.staticdir || './static',
  buildOnly: buildOnly,
  port: argv.port || 8080,
  lint: argv.lint !== undefined,
  open: argv.open,
  esbuild: {
    entryPoints: ["./src/index.jsx"],
    outdir: argv.outdir || './dist',
    minify: argv.minify === undefined ? true : argv.minify !== 'false',
    bundle: true,
    write: false,
    incremental: buildOnly ? false : true,
    metafile: argv.analyze !== undefined,
    define: {
      'process.env.NODE_ENV': buildOnly ? '"production"' : '"development"'
    }
  }
};

builder.init(config);
