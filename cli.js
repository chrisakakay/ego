#!/usr/bin/env node

const yargs = require('yargs/yargs');
const argv = yargs(process.argv.slice(2)).argv;
const buildOnly = argv._[0] === 'build';

const server = require('./webserver.js');
const webopen = require('./webopen.js');
const livereload = require('./livereload.js');
const watcher = require('./watcher.js');
const builder = require('./builder.js');
const static = require('./static.js');

let livereloadServer;

const config = {
  buildPath: './dist',
  publicUrl: argv.publicUrl || '/',
  htmlFiles: [
    { entryPoint: './src/index.html', outPoint: './dist/index.html' }
  ],
  staticFolders: [
    { entryPoint: './static', outPoint: './dist' }
  ],
  esbuild: {
    entryPoints: ["./src/index.jsx"],
    outdir: './dist',
    minify: true,
    bundle: true,
    define: {
      'process.env.NODE_ENV': buildOnly ? '"production"' : '"development"'
    }
  },
  dev: {
    livereload: true,
    watch: true,
    serve: true,
    open: argv.open || true,
    port: argv.port || 8080
  }
};

builder.generate(config);
static.copy(config);

if (!buildOnly) {
  if (config.dev.livereload) livereloadServer = livereload.start();
  if (config.dev.serve) server.start(config);
  if (config.dev.watch) {
    watcher.start({ onChange: () => {
      builder.generate(config, () => {
        static.copy(config);
        if (livereloadServer) livereloadServer.refresh('/');
      })
    }});
  }
  if (config.dev.open) webopen.start(config);
}
