'use strict';

const util = require('util');
const request = require('request');
const GAPI_CONST = require('../../config/googleAPI');
const EventEmitter = require('events');

class CustomImageSearch extends EventEmitter {
    constructor() {
        super();
        this.queryParams = {
            q: 'something',
            searchType: 'image',
            start: 1,
            num: 10,
            filter: 1,
            alt: 'json'
        };
    }

    _buildQueryUrl(query) {
        let urlTpl = util.format('%s?key=%s&cx=%s', GAPI_CONST.CSE_URL, GAPI_CONST.API_KEY, GAPI_CONST.CSE_ID);
        this.queryParams = Object.assign(this.queryParams, query.params);
        for (let key in this.queryParams) {
            urlTpl += util.format('&%s=%s', key, this.queryParams[key]);
        }

        return urlTpl;
    }

    _handleRequest(error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            this.emit('search:success', body.items, body.searchInformation);
        } else {
            this.emit('search:error', error, response, body);
        }
    }

    search(query) {
        let url = this._buildQueryUrl(query);
        console.log('[LAZYGIFTER][CSE] request: %s', url);
        request(url, this._handleRequest.bind(this));
    }
}

module.exports = CustomImageSearch;
