'use strict';

const misc = require('./misc');
const util = require('util');

class ParamsManager {
    constructor() {
        this.rawParams = process.argv;
        this.options = {
            help: false,
            send: false,
            daemon: false,
            mocks: {
                query: false,
                response: false,
                telegram: false
            }
        };
        this._processOptions();
    }

    _excludingParam(param) {
        this.options[param] = (this.rawParams.indexOf('--' + param) !== -1);
        if (this.options[param]) {
            misc.recursiveAssign(this.options, false, [param]);
        }

        return this.options[param];
    }

    _excludingParamWithValues(param) {
        try {
            let regexTpl = new RegExp('--' + param);
            let mockParam = this.rawParams.filter(item => regexTpl.test(item));
            if (mockParam.length > 0) {
                let options = mockParam[0].split('=')[1].split(',');
                for (let i in options) {
                    if (this.options[param].hasOwnProperty(options[i])) {
                        this.options[param][options[i]] = true;
                        misc.recursiveAssign(this.options, false, options);
                        console.log('[LAZYGIFTER][OPTIONS] Mock %s activated', options[i]);
                    } else {
                        throw new Error(util.format('[LAZYGIFTER][OPTIONS][ERROR] Option "%s" not recognize', options[i]));
                    }
                }

                return (mockParam.length > 0);
            }
        } catch (err) {
            console.error(err.message);
            return true;
        }
    }

    _processOptions(options) {
        if (this._excludingParam('help')) return;
        if (this._excludingParam('send')) return;
        if (this._excludingParam('daemon')) return;
        if (this._excludingParamWithValues('mocks')) return;

        console.log('[LAZYGIFTER] options ', JSON.stringify(this.options));
    }

    static help() {
        console.log('====> HELP <==== ');
        console.log('use: $> lazygifter [options]');
        console.log('[OPTIONS] --help: This help');
        console.log('[OPTIONS] --send: Telegram send mode mode');
        console.log('[OPTIONS] --daemon: Start dameon mode');
        console.log('[OPTIONS] --mocks=[test]: Start mocks mode. If --mocks is present other params will not be in count');
        console.log('[OPTIONS][MOCKS] query: Disable random query selection ang use default text');
        console.log('[OPTIONS][MOCKS] response: Disable google request #Sample: --mocks=response');
        console.log('[OPTIONS][MOCKS] telegram: Disable telegram tranference, and generate an test/web/index.html with de images #Sample: --mocks=telegram');
    }

    get() {
        return this.options;
    }

}


module.exports = ParamsManager;
