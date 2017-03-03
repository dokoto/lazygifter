'use strict';

const TelegramBot = require('node-telegram-bot');
const TELEGRAM_CONST = require('../../config/telegramAPI');
const request = require('request');
const EventEmitter = require('events');
const fs = require('fs');
const misc = require('../utils/misc');
const util = require('util');

class ImageBot extends EventEmitter {
    constructor() {
        super();
        this.tmpImagePath = null;
        this.imageUrl = null;
        this.telegramBot = new TelegramBot();
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
        this.telegramBot.sendPhoto(options, this._handleTelegramError.bind(this));
        this.emit('image:sent', this.imageUrl);
    }

    _handleTelegramError(error) {
        this.emit('image:telegram:error', util.format('[LAZYGIFTER][IMAGEBOT] %s %j', this.imageUrl, error));
    }

    _handleDownloadImageError(error) {
        this.emit('image:download:error', util.format('[LAZYGIFTER][IMAGEBOT] %s %j', this.imageUrl, error));
    }

    sendImage(caption, imageUrl) {
        this.imageUrl = imageUrl;
        this.tmpImagePath = util.format('%s/%s.%s', TELEGRAM_CONST.TEMP_IMAGES_PATH, TELEGRAM_CONST.TEMP_IMAGE_FILENAME, misc.extratExtFromUrl(imageUrl));
        console.log(util.format('[LAZYGIFTER][IMAGEBOT] Donwloading %s', imageUrl));
        request(imageUrl)
            .pipe(fs.createWriteStream(this.tmpImagePath))
            .on('finish', this._sendImage.bind(this, caption))
            .on('error', this._handleDownloadImageError.bind(this));
    }
}

module.exports = ImageBot;
