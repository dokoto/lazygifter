'use strict';

const TelegramBot = require('node-telegram-bot');
const TELEGRAM_CONST = require('../../config/telegramAPI');

const EventEmitter = require('events');
const cluster = require('cluster');

class TelegramDaemon extends EventEmitter {
    constructor(options) {
        super();
        this.options = options || {};
        this.telegramBot = new TelegramBot({
            token: TELEGRAM_CONST.TOKEN
        });
    }


    start() {
        console.log('[LAZYGIFTER][TELEGRAM-DAEMON] Started');
        this.telegramBot.on('message', this._handleOnIncoming.bind(this));
        this.telegramBot.start();
    }

    destroy() {
        this.telegramBot.removeAllListeners('message');
    }

    sendPhoto(options) {
        this.telegramBot.sendPhoto(options, () => this.emit('daemon:image:sent'));
    }

    _handleOnIncoming(message) {
        if (this.options.cluster && cluster.isMaster) {
            console.log(`[LAZYGIFTER][TELEGRAM-DAEMON][CLUSTER-MODE] Master incoming message "${message}" from telegram`);
            const worker = cluster.workers[Object.keys(cluster.workers)[0]];
            worker.send(message);
        } else {
            console.log('[LAZYGIFTER][TELEGRAM-DAEMON] Normal incoming message from telegram');
            this.emit('daemon:incoming:mesage', message);
        }
    }

}

module.exports = TelegramDaemon;
