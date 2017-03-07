'use strict';

const EventEmitter = require('events');
const request = require('request');
const fs = require('fs');
const sh = require('shelljs');

class Downloader extends EventEmitter {
    constructor(options) {
        super();
        this.options = {};
        this.options.url = options.url;
        this.options.destPath = options.destPath;
    }

    down() {
        request(this.options.url)
            .pipe(fs.createWriteStream(this.options.destPath))
            .on('finish', () => this.emit('download:success'))
            .on('error', (err) => this.emit('download:error', err));
    }

    clean() {
        sh.rm('-rf', this.options.destPath);
    }
}

module.exports = Downloader;
