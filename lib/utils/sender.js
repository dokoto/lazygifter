'use strict';

const EventEmitter = require('events');
const request = require('request');
const util = require('util');

const TELEGRAM_CONST = require('../../config/telegramAPI');

class Sender extends EventEmitter {
    constructor(options) {
        super();
        this.downloader = options.downloader;
        this.engine = options.engine;
    }

    sendQueue() {
        this.downloader.processLinks();
        this._send(this.downloader.options.files.pop());
    }

    _send(file) {
        let options = {
            chat_id: this.downloader.options.chat_id || TELEGRAM_CONST.CHAT_ID,
            caption: file.title,
            files: {
                photo: file.destPath
            }
        };

        this.engine.once('daemon:image:sent', this._handleQueue.bind(this, file.filename));
        this.engine.sendPhoto(options);
    }

    _handleQueue(filename) {
        console.log(util.format('[LAZYGIFTER][SENDER] "%s" sent successful', filename));
        if (this.downloader.options.files.length > 0) {
            this._send(this.downloader.options.files.pop());
        } else {
            this.downloader.destroy();
            this.emit('send:finish');
        }
    }
}

module.exports = Sender;
