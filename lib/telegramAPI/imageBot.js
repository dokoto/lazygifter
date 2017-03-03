'use strict';

const TelegramBot = require('node-telegram-bot');
const TELEGRAM_CONST = require('../../config/telegramAPI');
const request = require('request');
const EventEmitter = require('events');
const fs = require('fs');
const misc = require('../utils/misc');
const util = require('util');
const os = require('os');
const path = require('path');

class ImageBot extends EventEmitter {
    constructor() {
        super();
        this.tmpImagePath = null;
        this.imageUrl = null;
        this.telegramBot = new TelegramBot({
            token: TELEGRAM_CONST.TOKEN
        });
    }

    _sendImage(caption) {
        let options = {
            chat_id: TELEGRAM_CONST.CHAT_ID,
            caption: caption,
            files: {
                photo: this.tmpImagePath
            }
        };
        console.log('[LAZYGIFTER][IMAGEBOT] Sending image');
        this.telegramBot.sendPhoto(options, this._handleTelegram.bind(this));
    }

    _handleTelegram(error, request) {
        if (error) {
            this.emit('image:telegram:error', util.format('[LAZYGIFTER][IMAGEBOT] %s %j', this.imageUrl, error));
        } else if (request) {
            this.emit('image:sent', this.imageUrl);
        }
    }

    _handleDownloadImageError(error) {
        this.emit('image:download:error', util.format('[LAZYGIFTER][IMAGEBOT] %s %j', this.imageUrl, error));
    }

    sendImage(caption, imageUrl) {
        this.imageUrl = imageUrl;
        this.tmpImagePath = path.join(os.homedir(), TELEGRAM_CONST.TEMP_IMAGE_FILENAME + misc.extratExtFromUrl(imageUrl));
        console.log(util.format('[LAZYGIFTER][IMAGEBOT] Donwloading %s', imageUrl));
        request(imageUrl)
            .pipe(fs.createWriteStream(this.tmpImagePath))
            .on('finish', this._sendImage.bind(this, caption))
            .on('error', this._handleDownloadImageError.bind(this));
    }

    _handleMessage(message) {
        this.emit('image:incoming:message', message);
    }

    start() {
        this.telegramBot.on('message', this._handleMessage.bind(this)).start();
    }
}

module.exports = ImageBot;
