'use strict';

const GoogleAPI = require('./googleAPI/googleAPI');
const misc = require('./utils/misc');
const paramsManager = require('./utils/paramsManager');
const util = require('util');
const gmock = require('../mocks/googleSearch');
const ImageBot = require('./telegramAPI/imageBot');
const _ = require('underscore');
const fs = require('fs');
const QUERY = require('../config/query');

class Lazygitfter {
    constructor(options) {
        this.options = options;
        this.imageBot = new ImageBot();

        this.customSearch = new GoogleAPI({
            typeEngine: 'images'
        });

        this.query = {
            params: {
                q: 'lovesome gold deer kissing'
            }
        };

        this.queryParts = {
            things: QUERY.things
        };
    }

    _handleRequest(chat_id, items, searchInformation) {
        console.log('[LAZYGIFTER] Found %d images for query: "%s" time: %s total results: %s chadId: %s', Object.keys(items).length, decodeURI(this.query.params.q),
            searchInformation.formattedSearchTime, searchInformation.formattedTotalResults, chat_id);
        if (this.options.mocks && this.options.mocks.telegram) {
            this._generateHtml({
                'query': decodeURI(this.query.params.q),
                'items': items
            });
        } else {
            this._sendImages(items, chat_id);
        }
    }

    _generateHtml(links) {
        console.log('[LAZYGIFTER][MOCKS] Generating html...');
        let tpl = fs.readFileSync('assets/templates/index.html', 'utf8');
        let tplCompiled = _.template(tpl);
        fs.writeFileSync('test/web/index.html', tplCompiled(links), 'utf8');
    }

    _sendImages(links, chat_id) {
        let item = links.pop();
        if (item) {
            this.imageBot.once('image:sent', this._sendImages.bind(this, links, chat_id));
            this.imageBot.once('image:telegram:error', this._handleErrorSendTelegram.bind(this, links, chat_id));
            this.imageBot.once('image:download:error', this._handleErrorDownload.bind(this, links, chat_id));

            this.imageBot.sendImage(item.title, item.link, chat_id);
        } else {
            console.log('[LAZYGIFTER][SUCCESS] All images sent ok');
        }
    }

    _handleErrorSendTelegram(links, chat_id, error) {
        console.error(error);
        this._sendImages(links, chat_id);
    }

    _handleErrorDownload(links, chat_id, error) {
        console.error(error);
        this._sendImages(links, chat_id);
    }

    _handleErrorRequest(chat_id, error, response, body) {
        console.error(util.format('[LAZYGIFTER][ERROR] ChatId: %s Error: %j Response: %j Body: %j', chat_id, error, response, body));
    }

    _handleTelegramError(err, msg) {
        console.log(util.format('[LAZYGIFTER][ERROR] Error: %j %s', err, msg));
    }

    _generateRandomQueryParts() {
        let queryParts = {};
        queryParts.things = this.queryParts.things[misc.random(0, this.queryParts.things.length - 1)];

        return queryParts;
    }

    _generateRandomSearch() {
        let queryParts = this._generateRandomQueryParts();
        return util.format('%s', queryParts.things);
    }

    send(chat_id) {
        this.customSearch.engine.on('search:success', this._handleRequest.bind(this, chat_id));
        this.customSearch.engine.on('search:error', this._handleErrorRequest.bind(this, chat_id));
        this.query.params.q = (this.options.mocks.query) ? this.query.params.q : encodeURI(this._generateRandomSearch());
        if (misc.isFalse(this.options.mocks)) {
            this.customSearch.engine.search(this.query);
        } else if (this.options.mocks && this.options.mocks.response && !this.options.mocks.telegram) {
            this._handleRequest(chat_id, gmock.items, gmock.searchInformation);
        } else if (this.options.mocks && this.options.mocks.telegram && !this.options.mocks.response) {
            this.customSearch.engine.search(this.query);
        } else if (this.options.mocks && this.options.mocks.telegram && this.options.mocks.response) {
            this._handleRequest(chat_id, gmock.items, gmock.searchInformation);
        }
    }

    _handleIncomingMessage(message) {
        console.log(util.format('[LAZYGIFTER][DAEMON]  Message: %j', message));
        switch (message.text) {
            case '/get':
                console.log(util.format('[LAZYGIFTER][DAEMON]  Command "%s" detected', message.text));
                this.send(message.from.id);
                break;
            default:
                console.log(util.format('[LAZYGIFTER][DAEMON]  Command "%s" no allowed', message.text));
                break;
        }
    }

    daemon() {
        console.log('[LAZYGIFTER][DAEMON] Started daemon mode');
        this.imageBot.on('image:incoming:message', this._handleIncomingMessage.bind(this));
        this.imageBot.start();
    }

    run() {
        if (this.options.daemon) {
            this.daemon();
        } else if (this.options.send) {
            this.send();
        } else if (this.options.help) {
            paramsManager.help();
        } else if (this.options.mocks) {
            this.send();
        }
    }
}


module.exports = Lazygitfter;
