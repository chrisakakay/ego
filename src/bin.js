#!/usr/bin/env node

const { Config } = require('./lib/config.js');
const { Orchestrator } = require('./lib/orchestrator.js');

const config = new Config();
const orchestrator = new Orchestrator(config);

orchestrator.run();
