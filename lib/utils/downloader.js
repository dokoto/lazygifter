'use strict';

const EventEmitter = require('events');
const request = require('request');
const util = require('util');
const fs = require('fs');
const sh = require('shelljs');
const misc = require('./misc');
const path = require('path');
const os = require('os');

class Downloader extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
    }

    downQueue() {
        this.processLinks();
        this._down(this.options.files.pop());
    }

    _down(file) {
        request(file.url)
            .pipe(fs.createWriteStream(file.destPath))
            .once('finish', this._handleQueue.bind(this, file.filename))
            .once('error', this._handleDownloadedInError.bind(this));
    }

    processLinks() {
        this.options.files = [];
        for (let i in this.options.items) {
            let item = this.options.items[i];
            this.options.files.push({
                filename: misc.extratFileNameFromUrl(item.link),
                destPath: path.join(os.homedir(), '.lazygifter/', misc.extratFileNameFromUrl(item.link)),
                url: item.link
            });
        }
    }

    destroy() {
        for (let i in this.options.files) {
            let file = this.options.files[i];
            console.log(util.format('[LAZYGIFTER][DOWNLOADER] "%s" deleted', file.filename));
            sh.rm('-rf', file.filename);
        }
    }

    _handleDownloadedInError(error) {
        console.error(util.format('[LAZYGIFTER][DOWNLOADER][ERROR] %j', error));
        this.emit('download:error');
        this._handleQueue();
    }

    _handleQueue(filename) {
        console.log(util.format('[LAZYGIFTER][DOWNLOADER] "%s" downloaded', filename));
        if (this.options.files.length > 0) {
            this._down(this.options.files.pop());
        } else {
            this.emit('download:finish');
        }
    }
}

module.exports = Downloader;
