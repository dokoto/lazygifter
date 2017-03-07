'use strict';

const TelegramBot = require('node-telegram-bot');
const TELEGRAM_CONST = require('../../config/telegramAPI');
const EventEmitter = require('events');


class TelegramDaemon extends EventEmitter {
    constructor() {
        super();
        this.telegramBot = new TelegramBot({
            token: TELEGRAM_CONST.TOKEN
        });
    }


    start() {
        console.log('[LAZYGIFTER][TELEGRAM-DAEMON] Started');
        this.telegramBot.on('message', message => this.emit('daemon:incoming:mesage', message));
        this.telegramBot.start();
    }

    destroy() {
        this.telegramBot.removeAllListeners('message');
    }

    sendPhoto(options) {
        this.telegramBot.sendPhoto(options, () => this.emit('daemon:image:sent'));
    }

}

module.exports = TelegramDaemon;
