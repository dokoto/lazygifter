'use strict';


class ParamsManager {
    constructor() {
        this.rawParams = process.argv;
        this._processOptions();
    }

    _processOptions(options) {
        this.options = {};
        this.options.daemon = (this.rawParams.indexOf('--daemon') !== -1);
        this.options.help = (this.rawParams.indexOf('--help') !== -1);
        console.log('[LAZYGIFTER] options ', JSON.stringify(this.options));
    }

    static help() {
        console.log('[LAZYGIFTER] ====> HELP <==== ');
        console.log('use: $> lazygifter [options]');
        console.log('[OPTIONS] --help: This help');
        console.log('[OPTIONS] --daemon: Start dameon mode');
    }

    get() {
        return this.options;
    }

}


module.exports = ParamsManager;
