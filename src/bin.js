#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { Config } = require('./lib/config.js');
const { Orchestrator } = require('./lib/orchestrator.js');

const argv = yargs(process.argv.slice(2)).argv;
const config = new Config(argv);
const orchestrator = new Orchestrator(config);

orchestrator.run();
