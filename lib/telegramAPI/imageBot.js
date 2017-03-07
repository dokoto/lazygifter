'use strict';

const TelegramBot = require('node-telegram-bot');
const TELEGRAM_CONST = require('../../config/telegramAPI');
const EventEmitter = require('events');
const Downloader = require('../utils/downloader');
const misc = require('../utils/misc');
const util = require('util');
const os = require('os');
const path = require('path');
const fs = require('fs');

class ImageBot extends EventEmitter {
    constructor() {
        super();
        this.telegramBot = new TelegramBot({
            token: TELEGRAM_CONST.TOKEN
        });
    }

    _sendImage(caption, chat_id, downloader) {
        let options = {
            chat_id: chat_id || TELEGRAM_CONST.CHAT_ID,
            caption: caption,
            files: {
                photo: downloader.options.destPath
            }
        };
        console.log('[LAZYGIFTER][IMAGEBOT] Sending image');
        this.telegramBot.sendPhoto(options, this._handleTelegram.bind(this, downloader));
    }

    _handleTelegram(downloader, error, request) {
        try {
            if (error) {
                this.emit('image:telegram:error', util.format('[LAZYGIFTER][IMAGEBOT] %s %j', downloader.options.url, error));
            } else if (request) {
                this.emit('image:sent', downloader.options.url);
            }
        } catch (err) {
            console.log(util.format('[LAZYGIFTER][IMAGEBOT] %j', err));
        } finally {
            downloader.clean();
        }
    }

    _handleDownloadImageError(error) {
        this.emit('image:download:error', util.format('[LAZYGIFTER][IMAGEBOT] %s %j', this.imageUrl, error));
    }

    _createHomeFolder(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }

    sendImage(caption, imageUrl, chat_id) {
        let DownloadPath = path.join(os.homedir(), '.lazygifter/');
        this._createHomeFolder(DownloadPath);
        let downloader = new Downloader({
            url: imageUrl,
            destPath: path.join(DownloadPath, misc.extratFileNameFromUrl(imageUrl))
        });
        console.log(util.format('[LAZYGIFTER][IMAGEBOT] Donwloading %s', imageUrl));
        downloader.on('download:success', this._sendImage.bind(this, caption, chat_id, downloader));
        downloader.on('download:error', this._handleDownloadImageError.bind(this));
        downloader.down();
    }

    _handleMessage(message) {
        this.emit('image:incoming:message', message);
    }

    start() {
        this.telegramBot.on('message', this._handleMessage.bind(this)).start();
    }
}

module.exports = ImageBot;
