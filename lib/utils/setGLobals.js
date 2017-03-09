'use strict';

const util = require('util');

class SetGlobals {
    static run() {
        SetGlobals._setGlobalNameSpace();
        SetGlobals._overWriteConsole();
    }

    static _overWriteConsole() {
        console.debug = SetGlobals._consoleDebug;
    }

    static _consoleDebug(msg, ...args) {
        if (process.argv.indexOf('--verbose') !== -1) {
            console.log(util.format.apply(this, [].concat(msg, args)));
        }
    }

    static _setGlobalNameSpace() {
        global.APP = {};
    }
}

module.exports = SetGlobals;
