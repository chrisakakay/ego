#!/usr/bin/env node

const yargs = require('yargs/yargs');
const argv = yargs(process.argv.slice(2)).argv;

const server = require('./webserver.js');
const builder = require('./builder.js');

const buildOnly = argv._[0] === 'build';
let livereloadServer;

const config = {
  publicUrl: argv.publicUrl || '/',
  entryPoint: './src/index.html',
  staticFolder: './static',
  buildOnly: buildOnly,
  esbuild: {
    entryPoints: ["./src/index.jsx"],
    outdir: './dist',
    minify: true,
    bundle: true,
    write: false,
    define: {
      'process.env.NODE_ENV': buildOnly ? '"production"' : '"development"'
    }
  },
  dev: {
    livereload: true,
    watch: true,
    serve: true,
    open: argv.open || false,
    port: argv.port || 8080
  }
};

builder.init(config);
builder.build(config);

if (!buildOnly) {
  server.start(config);

  if (config.dev.open) {
    const cp = require('child_process');
    if (process.platform === 'darwin') cp.exec(`open http://localhost:${config.dev.port}${config.publicUrl}`);
    if (process.platform === 'win32') cp.exec(`start http://localhost:${config.dev.port}${config.publicUrl}`);
  }
}
