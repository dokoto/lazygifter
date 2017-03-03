#!/usr/bin/env node

'use strict';

const Lazygifter = require('../lib/lazygifterlib.js');
const ParamsManager = require('../lib/utils/paramsManager.js');

let params = new ParamsManager();
let options = params.get();
if (options.help) {
    ParamsManager.help();
} else {
    let lazygifter = new Lazygifter(options);
    lazygifter.run();
}
