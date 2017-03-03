'use strict';

const GoogleAPI = require('./googleAPI/googleAPI');
const misc = require('./utils/misc');
const util = require('util');
const gmock = require('../mocks/googleSearch');
const ImageBot = require('./telegramAPI/imageBot');

class Lazygitfter {
    constructor() {
        this.imageBot = new ImageBot();

        this.customSearch = new GoogleAPI({
            typeEngine: 'images'
        });

        this.query = {
            params: {
                q: 'puppies'
            }
        };

        this.queryParts = {
            things: ['puppies', 'kittens', 'cats', 'dogs', 'giraffe', 'elephant', 'duckling', 'deer', 'hedgehog', 'panda', 'wolves', 'lamb', 'owl', 'seal', 'bunny', 'fox', 'foal', 'horse', 'penguin'],
            adjectives: ['baby', 'adorable', 'lovely', 'pretty', 'sweet', 'delicate', 'nice', 'gorgeous', 'lovesome'],
            colors: ['white', 'brown', 'chocolate', 'liver', 'red', 'gold', 'yelow', 'cream', 'fawn', 'black', 'blue', 'grey'],
            gerun: ['kissing', 'jumping', 'sleeping', 'hugging', 'loving', 'drinking']
        };
    }

    _handleRequest(items, searchInformation) {
        console.log('[LAZYGIFTER] Found %d images for query: "%s" time: %s total results: %s', Object.keys(items).length, decodeURI(this.query.params.q), searchInformation.formattedSearchTime, searchInformation.formattedTotalResults);
        this._sendImages(items);
    }

    _sendImages(links) {
        let item = links.pop();
        if (item) {
            this.imageBot.once('image:sent', this._sendImages.bind(this, links));
            this.imageBot.once('image:telegram:error', this._handleErrorSendTelegram.bind(this));
            this.imageBot.once('image:download:error', this._handleErrorDownload.bind(this));
            this.imageBot.sendImage(item.title, item.link);
        } else {
            console.log('[LAZYGIFTER][SUCCESS] All images sent ok');
        }
    }

    _handleErrorSendTelegram(error) {
        console.error(error);
    }

    _handleErrorDownload(error) {
        console.error(error);
    }

    _handleErrorRequest(error, response, body) {
        console.error(util.format('[LAZYGIFTER][ERROR] Error: %j Response: %j Body:%j', error, response, body));
    }

    _handleTelegramError(err, msg) {
        console.log(util.format('[LAZYGIFTER][ERROR] Error: %j %s', err, msg));
    }

    _generateRandomQueryParts() {
        let queryParts = {};
        queryParts.things = this.queryParts.things[misc.random(0, this.queryParts.things.length - 1)];
        queryParts.adjectives = this.queryParts.adjectives[misc.random(0, this.queryParts.adjectives.length - 1)];
        queryParts.colors = this.queryParts.colors[misc.random(0, this.queryParts.colors.length - 1)];
        queryParts.gerun = this.queryParts.gerun[misc.random(0, this.queryParts.gerun.length - 1)];

        return queryParts;
    }

    _generateRandomSearch() {
        let queryParts = this._generateRandomQueryParts();
        return util.format('%s %s %s %s', queryParts.adjectives, queryParts.colors, queryParts.things, queryParts.gerun);
    }

    run() {
        this.customSearch.engine.on('search:success', this._handleRequest.bind(this));
        this.customSearch.engine.on('search:error', this._handleErrorRequest.bind(this));
        this.query.params.q = encodeURI(this._generateRandomSearch());
        //this.customSearch.engine.search(this.query);
        this._handleRequest(gmock.items, gmock.searchInformation);
    }
}


module.exports = Lazygitfter;
