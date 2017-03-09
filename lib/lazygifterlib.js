'use strict';

const _ = require('underscore');

const os = require('os');
const path = require('path');
const cluster = require('cluster');

const paramsManager = require('./utils/paramsManager');
const util = require('util');
const gmock = require('../mocks/googleSearch');
const TelegramDaemon = require('./telegramAPI/telegramDaemon');
const Downloader = require('./utils/downloader');
const Sender = require('./utils/sender');
const CustomImageSearch = require('./googleAPI/customImageSearch');
const misc = require('./utils/misc');
const CpuUsage = require('./utils/cpuUsage');

const QUERY = require('../config/query');
const GOOGLE_API = require('../config/googleAPI');

class Lazygitfter {
    constructor(options) {
        this.options = options;
        this.query = QUERY.defaults;
    }

    _handleCustomImageSearchRequest(chat_id, items, searchInformation) {
        console.log('[LAZYGIFTER] Found %d images for query: "%s" time: %s total results: %s chadId: %s', Object.keys(items).length, decodeURI(this.query.params.q),
            searchInformation.formattedSearchTime, searchInformation.formattedTotalResults, chat_id);
        if (this.options.mocks && this.options.mocks.telegram) {
            misc.generateHtml({
                'query': decodeURI(this.query.params.q),
                'items': items
            });
        } else {
            this._processItems(items, chat_id);
        }
    }

    _handleCustomImageSearchError(chat_id, error, response, body) {
        console.error(util.format('[LAZYGIFTER][ERROR] ChatId: %s Error: %j Response: %j Body: %j', chat_id, error, response, body));
    }

    _handleIncomingMessage(message) {
        console.log(util.format('[LAZYGIFTER]  Message id: %s from %s in chat id %s', message.message_id, message.from.id, message.chat.id));
        switch (message.text) {
            case '/get':
                console.log(util.format('[LAZYGIFTER]  Command "%s" detected', message.text));
                this.send(message.from.id);
                break;
            default:
                console.log(util.format('[LAZYGIFTER]  Command "%s" no allowed', message.text));
                break;
        }
    }

    _handleAllDownloaded(downloader) {
        let sender = new Sender({
            'downloader': downloader,
            engine: this.telegramDaemon
        });
        sender.sendQueue();
    }

    _generateRandomQueryParts() {
        let queryParts = {};
        queryParts.things = QUERY.things[misc.random(0, QUERY.things.length - 1)];

        return queryParts;
    }

    _processItems(items, chat_id) {
        let downloader = new Downloader({
            chat_id: chat_id,
            'items': items
        });
        misc.createHomeFolder(path.join(os.homedir(), '.lazygifter/'));
        downloader.on('download:finish', this._handleAllDownloaded.bind(this, downloader));
        downloader.downQueue();
    }

    _generateRandomSearch() {
        let queryParts = this._generateRandomQueryParts();
        return util.format('%s', queryParts.things);
    }

    _search(query, chat_id) {
        let customSearch = new CustomImageSearch(GOOGLE_API.CONF);
        customSearch.once('search:success', this._handleCustomImageSearchRequest.bind(this, chat_id));
        customSearch.once('search:error', this._handleCustomImageSearchError.bind(this, chat_id));
        customSearch.search(this.query);
    }

    _cluster() {
        let cpus = os.cpus();
        if (cluster.isMaster) {
            console.log(`[LAZYGIFTER][MASTER] ${process.pid} is running`);
            for (let cpu in cpus) {
                cluster.fork();
            }
            APP.cpuUsage = new CpuUsage();
            APP.cpuUsage.start();
            this.telegramDaemon = new TelegramDaemon(this.options, this.workers);
            this.telegramDaemon.start();
            cluster.on('exit', this._handleClusterExit.bind(this));
        } else {
            this.daemon();
            console.log(`[LAZYGIFTER][WORKER] ${process.pid} is running`);
        }
    }

    _handleClusterExit(worker, code, signal) {
        console.log(`[LAZYGIFTER][WORKER] ${worker.process.pid} died`);
    }

    _handleClusterMessage(message) {
        console.log(`[LAZYGIFTER][WORKER] Incoming message ${message}`);
        this._handleIncomingMessage(message);
    }

    send(chat_id) {
        this.query.params.q = (this.options.mocks.query) ? this.query.params.q : encodeURI(this._generateRandomSearch());
        if (misc.isFalse(this.options.mocks)) {
            this._search(this.query, chat_id);
        } else if (this.options.mocks && this.options.mocks.response && !this.options.mocks.telegram) {
            this._handleCustomImageSearchRequest(chat_id, gmock.items, gmock.searchInformation);
        } else if (this.options.mocks && this.options.mocks.telegram && !this.options.mocks.response) {
            this._search(this.query, chat_id);
        } else if (this.options.mocks && this.options.mocks.telegram && this.options.mocks.response) {
            this._handleCustomImageSearchRequest(chat_id, gmock.items, gmock.searchInformation);
        }
    }

    daemon() {
        if (this.options.cluster && cluster.isWorker) {
            cluster.worker.process.on('message', this._handleClusterMessage.bind(this));
        } else if (!this.options.cluster) {
            this.telegramDaemon = new TelegramDaemon(this.options);
            this.telegramDaemon.on('daemon:incoming:mesage', this._handleIncomingMessage.bind(this));
            this.telegramDaemon.start();
        } else {
            console.log('[LAZYGIFTER] Daemon nothing to do');
        }
    }

    run() {
        if (this.options.cluster && this.options.daemon) {
            this._cluster();
        } else if (this.options.daemon) {
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
