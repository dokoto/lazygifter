#!/usr/bin/env node

'use strict';

const Lazygifter = require('../lib/lazygifterlib.js');
const ParamsManager = require('../lib/utils/paramsManager.js');

let params = new ParamsManager();
let lazygifter = new Lazygifter(params.get());

lazygifter.run();
