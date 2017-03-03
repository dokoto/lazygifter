'use strict';


class GoogleAPI {
    constructor(options) {
        this.options = options;
        this.engine = null;
        this._resolveEngine();

    }

    _resolveEngine() {
        switch (this.options.typeEngine) {
            case 'images':
                let Images = require('./customImageSearch');
                this.engine = new Images();
                break;
            default:
                console.error('[LAZYGIFTER] "%s" is not valid type of custom engine');
        }
    }
}


module.exports = GoogleAPI;
