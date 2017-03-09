#!/usr/bin/env node

'use strict';

const Lazygifter = require('../lib/lazygifterlib');
const ParamsManager = require('../lib/utils/paramsManager');
const SetGlobals = require('../lib/utils/setGlobals');

SetGlobals.run();
let params = new ParamsManager();
let lazygifter = new Lazygifter(params.get());
lazygifter.run();
