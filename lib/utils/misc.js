'use strict';

const util = require('util');

class Misc {
    static random(min, max) {
        let low = Math.ceil(min);
        let high = Math.floor(max);

        return Math.floor(Math.random() * (high - low + 1)) + low;
    }

    static extratExtFromUrl(url) {
        try {
            let fileName = url.substr(url.lastIndexOf('/') + 1).split('?')[0];
            return fileName.substr(fileName.indexOf('.') + 1);
        } catch (error) {
            console.error(util.format('[LAZYGIFTER][MISC] %j', error))
            return 'jpg';
        }
    }
}

module.exports = Misc;
